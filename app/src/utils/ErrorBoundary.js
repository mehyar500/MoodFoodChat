// components/ErrorBoundary.js
import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';

const ErrorBoundary = (props) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const errorHandler = (error, info) => {
      setHasError(true);
      console.error('ErrorBoundary caught an error:', error, info);
    };

    window.addEventListener('error', errorHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom>
          Oops, something went wrong.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please try refreshing the page, or contact support if the issue persists.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Refresh
        </Button>
      </Box>
    );
  }

  return props.children;
};

export default ErrorBoundary;
