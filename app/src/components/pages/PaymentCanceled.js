// src/pages/PaymentCanceled.js
import React from 'react';
import { Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const PaymentCanceled = () => {
  return (
    <StyledContainer>
      <Typography variant="h4" align="center">
        Payment canceled. You can always try again later.
      </Typography>
    </StyledContainer>
  );
};

export default PaymentCanceled;
