// SignIn.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';

const SignIn = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLoginWithGoogle = (subscriptionType) => {
    const url = `${process.env.REACT_APP_API_URL}/auth/google?subscriptionType=${subscriptionType}`;
    window.location.href = url;
  };

  return (
    <>
      <Button color="inherit" onClick={handleOpen}>
        Sign In
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Sign In with Google</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Signin for a free 10,000 daily tokens to use the MoodFood chat
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleLoginWithGoogle('free')}
            fullWidth
          >
            Sign In With Google
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignIn;
