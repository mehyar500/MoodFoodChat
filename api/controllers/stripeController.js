// controllers/stripeController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const logger = require('../logger');

exports.createCheckoutSession = async (req, res) => {
    const { priceId } = req.body;
    const userEmail = req.userEmail;

    try {
      // Retrieve the Price object using the priceId
      const price = await stripe.prices.retrieve(priceId);
      
      const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer_email: userEmail,
          line_items: [
            {
                price_data: {
                  product_data: {
                    name: 'Premium Subscription',
                  },
                  unit_amount: price.unit_amount,
                  currency: 'usd',
                  recurring: {
                    interval: 'month',
                  },
                },
                quantity: 1,
            },
          ],
          success_url: `${process.env.FRONTEND_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_BASE_URL}/canceled`,
      });
  
      res.send({ sessionId: session.id });
    } catch (error) {
      console.error(error);
      res.status(400).send({ error: 'An error occurred while creating the Checkout Session.' });
    }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user.stripeSubscriptionId) {
      res.status(400).send({ error: 'No subscription found for this user.' });
      return;
    }

    // Retrieve the subscription first
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId).catch((error) => {
      console.error('Error in retrieving subscription:', error);
      res.status(400).send({ error: 'Failed to retrieve the subscription.' });
      return;
    });

    // If the subscription exists, delete it
    if (subscription && subscription.status !== 'canceled') {
      await stripe.subscriptions.del(user.stripeSubscriptionId);
    }

    // Update the user's subscription status in the database
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          stripeSubscriptionId: null,
          subscriptionType: 'free',
          'meta.subscription.canceled': subscription,
        },
      }
    );

    res.send({ message: 'Subscription canceled successfully.' });
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    res.status(400).send({ error: 'Failed to cancel the subscription.' });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userEmail = session.customer_email;

      // Update the user's subscription
      try {
        const customer = await stripe.customers.retrieve(session.customer, { expand: ['subscriptions'] });
        const subscription = await stripe.subscriptions.retrieve(customer.subscriptions.data[0].id);

        await User.updateOne(
          { email: userEmail },
          {
            $set: {
              stripeSubscriptionId: subscription.id,
              subscriptionType: 'premium',
              stripeCustomerId: customer.id,
              'meta.subscription.active': subscription,
            },
          }
        );

        logger.info(`Subscription updated successfully for user: ${userEmail}`);
        res.status(200).send({ message: 'Subscription updated successfully' });
      } catch (error) {
        logger.error(`An error occurred while updating the subscription: ${error}`);
        res.status(500).send({ error: 'An error occurred while updating the subscription' });
      }
      break;
    default:
      logger.warn(`Unhandled event type: ${event.type}`);
      res.status(400).send({ error: 'Unhandled event type' });
  }
};