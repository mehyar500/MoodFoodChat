import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Helmet>
        <meta
          name="description"
          content="MoodFood Privacy Policy."
        />
      </Helmet>
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="h4" paragraph>
          Last updated: June 7, 2023
        </Typography>
        <Typography variant="body1" paragraph>
          MoodFood ("us", "we", or "our") operates the MoodFood application (the "Service").
        </Typography>
        <Typography variant="body1" paragraph>
          This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. By using the Service, you agree to the collection and use of information in accordance with this policy.
        </Typography>
        <Typography variant="h4" gutterBottom>
          Information Collection and Use
        </Typography>
        <Typography variant="body1" paragraph>
          We collect several different types of information for various purposes to provide and improve our Service to you.
        </Typography>
        <Typography variant="body1" paragraph>
          Personal Data: When you sign up for MoodFood, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to, your email address and first and last name.
        </Typography>
        <Typography variant="body1" paragraph>
          Usage Data: When you access the Service by or through a mobile device, we may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile device unique ID, the IP address of your mobile device, your mobile operating system, the type of mobile Internet browser you use, unique device identifiers and other diagnostic data ("Usage Data").
        </Typography>
        <Typography variant="h4" gutterBottom>
          Use of Data
        </Typography>
        <Typography variant="body1" paragraph>
          MoodFood uses the collected data for various purposes such as providing and maintaining the Service, notifying you about changes to our Service, providing customer care and support, providing analysis or valuable information so that we can improve the Service, monitoring the usage of the Service, and detecting, preventing and addressing technical issues.
        </Typography>
        <Typography variant="h4" gutterBottom>
          Transfer of Data
        </Typography>
        <Typography variant="body1" paragraph>
          Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
        </Typography>
        <Typography variant="h4" gutterBottom>
          Subscription Fees
        </Typography>
        <Typography variant="body1" paragraph>
          Our Service offers certain enhanced features of the Service which you can purchase as a monthly subscription ("Subscription"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set on a monthly basis.
        </Typography>
        <Typography variant="h4" gutterBottom>
          Ads
        </Typography>
        <Typography variant="body1" paragraph>
          Please note that some content, including advertisements, may be served by third-party advertisers. These third parties may use cookies alone or in conjunction with web beacons or other tracking technologies to collect information about you when you use our services. They may use this information to provide you with interest-based (behavioral) advertising or other targeted content.
        </Typography>
        <Typography variant="body1" paragraph>
          We do not control these third parties' tracking technologies or how they may be used. If you have any questions about an advertisement or other targeted content, you should contact the responsible provider directly.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
