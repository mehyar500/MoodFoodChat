// routes/index.js
const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const requireAuth = require('./middlewares/requireAuth');
const stripeController = require('./controllers/stripeController');
const messageController = require('./controllers/messageController');
const recipeController = require('./controllers/recipeController');

// Google OAuth routes
router.get('/auth/google', authController.googleSignup);
router.get('/auth/google/callback', authController.googleCallback);

// User routes
router.get('/user/me', requireAuth, authController.getUserDataByAccessToken);
router.get('/user/:userId', requireAuth, authController.getUserData);
router.post('/user/:userId/preference' , requireAuth, authController.saveUserPreference);
router.delete('/user/:userId/preference', requireAuth, authController.removeMenuItem);
router.post('/user/:userId/bookmarks' , requireAuth, authController.saveUserBookmark);

// Recipe routes
router.get('/recipes/latest', recipeController.getLatestAiRecipes);
router.get('/recipes/search', recipeController.searchRecipes);

// Message routes
router.post('/contact-us', messageController.sendContactEmail);
router.post('/signup', messageController.signup);
router.post('/unsubscribe', messageController.unsubscribe);

// Stripe routes
router.post('/create-checkout-session', requireAuth, stripeController.createCheckoutSession);
router.post('/cancel-subscription', requireAuth, stripeController.cancelSubscription);
router.post('/stripe-webhook', stripeController.handleWebhook);

module.exports = router;
