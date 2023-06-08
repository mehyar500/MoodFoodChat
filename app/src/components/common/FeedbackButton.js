// FeedbackButton.js
import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import axios from 'axios';

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    // Call your API to send the feedback message.
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/contact-us`, {
        name: 'User Feedback',
        email: 'noreply@moodfood.app',
        message,
      });
      alert('Feedback sent successfully.');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('An error occurred while sending the feedback.');
    }

    setOpen(false);
    setMessage('');
  };

  return (
    <>
      <Fab
        color="secondary"
        aria-label="Send feedback"
        onClick={handleClickOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 2000,
        }}
      >
        <FeedbackIcon />
      </Fab>
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogTitle>Send us feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Feedback message"
            type="text"
            fullWidth
            multiline
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Send feedback</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
