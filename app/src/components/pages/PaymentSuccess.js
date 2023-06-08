// src/pages/PaymentSuccess.js
import React from 'react';
import { Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const PaymentSuccess = () => {
  return (
    <StyledContainer>
      <Typography variant="h4" align="center">
        Payment successful! Welcome to the Premium plan!
      </Typography>
    </StyledContainer>
  );
};

export default PaymentSuccess;
