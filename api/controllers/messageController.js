const aws = require('aws-sdk');
const { Pool } = require('pg');
const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE
});

aws.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

const sendMailjetEmail = async (recipient, subject, body) => {
  console.log('Sending email with Mailjet:', recipient, subject);
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: { Email: 'noreply@example.com', Name: 'MoodFoodChat' },
        To: [{ Email: recipient }],
        Subject: subject,
        TextPart: body.replace(/<[^>]*>?/gm, ''), 
        HTMLPart: body,
      },
    ],
  });

  try {
    const response = await request;
    console.log('Mailjet response:', response);
  } catch (error) {
    console.log('Error sending email with Mailjet:', error.statusCode, error.message);
  }
};

exports.signup = async (req, res) => {
  const { email, firstName, lastName, phoneNumber, userIP, userAgent } = req.body;

  const sqlQuery =
    'INSERT INTO moodfood_signups (email, first_name, last_name, phone_number, user_ip, user_agent) VALUES ($1, $2, $3, $4, $5, $6)';
  const values = [email, firstName, lastName, phoneNumber, userIP, userAgent];

  console.log('SQL Query:', sqlQuery);
  console.log('Values:', values);

  try {
    // await pool.query(sqlQuery, values);

    // Send the welcome email to the user
    const welcomeSubject = 'Welcome to MoodFood!';
    const welcomeBody = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
        <p>Dear ${firstName},</p>
        <p>Thank you for signing up for MoodFood's newsletter! As your GPT4 AI-Powered Personal Cooking Assistant, we're excited to revolutionize your cooking experience. MoodFood streamlines meal planning, inspires culinary creativity, and enhances your dining experience through a suite of powerful features.</p>
      </div>
    `;

    await sendMailjetEmail(email, welcomeSubject, welcomeBody);

    res.status(200).send({ message: 'Signed up successfully!' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send({ message: 'Error signing up, please try again.' });
  }
};

exports.unsubscribe = async (req, res) => {
  const { email } = req.body;
  const sqlQuery = 'UPDATE moodfood_signups SET is_unsubscribed = true WHERE email = $1';
  const values = [email];

  try {
    await pool.query(sqlQuery, values);
    res.status(200).send({ message: 'Unsubscribed successfully!' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).send({ message: 'Error unsubscribing, please try again.' });
  }
};

const sendSESEmail = async (recipient, subject, body) => {
  const ses = new aws.SES({ apiVersion: '2010-12-01' });

  const params = {
    Source: 'noreply@example.com',
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: body,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await sendSESEmail('example@example.com', 'Contact Form Submission', `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    res.status(200).send({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'An error occurred while sending the email.' });
  }
};