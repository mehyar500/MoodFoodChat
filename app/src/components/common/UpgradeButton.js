import React, { useState } from 'react';
import Button from '@mui/material/Button';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import Cookies from 'js-cookie';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const UpgradeButton = () => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        const stripe = await stripePromise;

        // Fetch the Checkout Session from the backend
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/create-checkout-session`, {
                priceId: process.env.REACT_APP_STRIPE_PRICE_ID,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });

            const session = response.data;

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({ sessionId: session.sessionId });

            if (result.error) {
                setLoading(false);
                console.error(result.error.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            onClick={handleClick}
        >
            {loading ? 'Processing...' : 'Upgrade to Premium $5/month for 100,000 tokens per day'}
        </Button>
    );
};

export default UpgradeButton;
