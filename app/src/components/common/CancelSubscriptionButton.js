import React, { useState } from 'react';
import Button from '@mui/material/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthContext } from '../../contexts/AuthContext';

const CancelSubscriptionButton = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const handleClick = async () => {
    setLoading(true);
    const token = Cookies.get('token');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cancel-subscription`,
        { userId: user._id },
        { headers: { 'Authorization': `Bearer ${token}`},
      });

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.error || 'Failed to cancel the subscription.');
      }

      alert('Subscription canceled successfully.');
    } catch (error) {
        console.error('Error response:', error.response);
        alert(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? 'Processing...' : 'Cancel Subscription'}
    </Button>
  );
};

export default CancelSubscriptionButton;
