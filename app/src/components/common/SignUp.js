import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Grid } from '@mui/material';
import axios from 'axios';
import { styled } from "@mui/material/styles";
import { publicIpv4 } from 'public-ip';

const SignUpContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [userIP, setUserIP] = useState('');
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    const fetchIP = async () => {
      const publicIpAddress = await publicIpv4();
      setUserIP(publicIpAddress);
    };

    fetchIP();
    setUserAgent(navigator.userAgent);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        email,
        firstName,
        lastName,
        phoneNumber,
        userIP,
        userAgent,
      });
      setSuccess(true);
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
    } catch (err) {
      setError(true);
      console.error('Error signing up:', err);
    }
  };

  return (
    <SignUpContainer>
      <Typography variant="h5">Sign up</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mt={2}>
                <Button type="submit" variant="contained" color="primary">
                    Sign Up
                </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Signed up successfully!"
      />
      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
        message="Error signing up, please try again."
      />
    </SignUpContainer>
  );
};

export default SignUp;
