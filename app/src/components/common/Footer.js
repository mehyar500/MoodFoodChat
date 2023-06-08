import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SignUp from './SignUp';

const Footer = () => {
  const navigate = useNavigate();
  const [openSignUp, setOpenSignUp] = useState(false);

  const handleSignUpClick = () => {
    setOpenSignUp(true);
  };
  
  const handleCloseSignUp = () => {
    setOpenSignUp(false);
  };  

  const handleAboutUsClick = () => {
    navigate('/about-us');
  };

  const handleContactUsClick = () => {
    navigate('/contact-us');
  };

  const handlePrivacyPolicyClick = () => {
    navigate('/privacy-policy');
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary">
              Discover MoodFood.ai
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your all-in-one AI chatbot for food recommendations, recipes, and more!
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary">
              Quick Links
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ cursor: 'pointer' }} onClick={handleAboutUsClick}>
                About Us
              </li>
              <li style={{ cursor: 'pointer' }} onClick={handleContactUsClick}>
                Contact Us
              </li>
              <li style={{ cursor: 'pointer' }} onClick={handlePrivacyPolicyClick}>
                Privacy Policy
              </li>
              <li style={{ cursor: 'pointer' }} onClick={handleSignUpClick}>
                Sign Up
              </li>
            </ul>
            <Dialog open={openSignUp} onClose={handleCloseSignUp} maxWidth="xs" fullWidth>
              <DialogContent>
                <SignUp />
              </DialogContent>
            </Dialog>
          </Grid>
          <Grid item xs={12} sm={4}>
          <Typography variant="body4" color="text.secondary">
              For any questions or support, please email us at
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <a href="mailto:moodi@moodfood.app">moodi@moodfood.app</a>
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} MoodFood.ai. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
