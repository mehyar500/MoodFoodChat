import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/contact-us`, { name, email, message });
      alert('Email sent successfully.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An error occurred while sending the email.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" align="center">
          Contact Us
        </Typography>
        <Typography variant="h5" align="center" sx={{ mt: 2 }}>
          Revolutionize your food journey with MoodFood.ai
        </Typography>
        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
          Discover unique recipes, explore new cuisines, and get personalized recommendations based on your mood.
          Enhance your daily life with the power of our AI chatbot, designed to make your culinary experiences more enjoyable and adventurous.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ContactUs;
