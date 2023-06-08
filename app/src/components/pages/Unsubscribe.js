// components/pages/Unsubscribe.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar } from '@mui/material';
import axios from 'axios';
import { styled } from "@mui/material/styles";

const UnsubscribeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Unsubscribe = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/unsubscribe`, { email });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(true);
      console.error('Error unsubscribing:', err);
    }
  };

  return (
    <UnsubscribeContainer>
      <Typography variant="h5">Unsubscribe</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          required
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Unsubscribe
          </Button>
        </Box>
      </form>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Unsubscribed successfully!"
      />
      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
        message="Error unsubscribing, please try again."
      />
    </UnsubscribeContainer>
  );
};

export default Unsubscribe;
