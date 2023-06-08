// controllers/authController.js
const User = require('../models/User');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

require('dotenv').config();

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_BASE_URL}/api/auth/google/callback`
);

exports.saveUserBookmark = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.bookmarkedRecipes && user.bookmarkedRecipes.includes(recipeId)) {
      return res.status(400).json({ error: "Recipe already bookmarked" });
    }

    if (!user.bookmarkedRecipes) {
      user.bookmarkedRecipes = [recipeId];
    } else {
      user.bookmarkedRecipes.push(recipeId);
    }
    await user.save();

    res.status(200).json({ message: "Recipe successfully saved" });
  } catch (error) {
    console.error("Error saving the recipe:", error);
    res.status(500).json({ error: "Failed to save the recipe" });
  }
};

exports.saveUserPreference = async (req, res) => {
  try {
    const userId = req.params.userId;
    // const { userMenu } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // user.preference = { userMenu: userMenu };
    await user.save();

    res.status(200).json({ message: 'User bookmark saved successfully' });

  } catch (error) {
    console.error('Error saving user preference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.removeMenuItem = async (req, res) => {
  const { userId } = req.params;
  const { itemToRemove } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || !user.preference || !user.preference.userMenu) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    const updatedMenuItems = user.preference.userMenu.filter(
      (item) => JSON.stringify(item) !== JSON.stringify(itemToRemove)
    );

    user.preference.userMenu = updatedMenuItems;
    await user.save();

    res.status(200).json({ message: 'Menu item removed successfully', userMenu: user.preference.userMenu });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.googleSignup = (req, res) => {
  const { subscriptionType } = req.query;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state: JSON.stringify({ subscriptionType }),
  });

  res.redirect(url);
};

exports.googleCallback = async (req, res, next) => {

  const { code, state } = req.query;
  const { subscriptionType } = JSON.parse(state);
  
  if (!code) {
    res.status(400).send('No code provided');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens) {
      // Retry getting the tokens
      const { tokens: retryTokens } = await oauth2Client.getToken(code);
      if (!retryTokens) {
        res.status(400).send('Failed to get tokens');
        return;
      }
      oauth2Client.setCredentials(retryTokens);
    } else {
      oauth2Client.setCredentials(tokens);
    }

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    // Save user to database
    const user = await User.findOneAndUpdate(
      { googleId: userInfo.data.id },
      {
        displayName: userInfo.data.name,
        email: userInfo.data.email,
        avatar: userInfo.data.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        subscriptionType: subscriptionType,
      },
      { upsert: true, new: true }
    );
    // Set user state in cookies
    res.cookie('user', JSON.stringify(user), { maxAge: 72 * 60 * 60 * 1000 })
    res.cookie('token', user.accessToken, { maxAge: 72 * 60 * 60 * 1000 });

    const redirectUrl = `${process.env.FRONTEND_BASE_URL}/auth/callback/#token=${user.accessToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getUserData = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);

      req.user = user;
  
      res.send(user);
    } catch (error) {
      next(error);
    }
};

exports.getUserDataByAccessToken = async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization.split(' ')[1];

      const user = await User.findOne({ accessToken });

      res.send(user);
    } catch (error) {
      next(error);
    }
};