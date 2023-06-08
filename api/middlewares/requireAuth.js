// middleware/requireAuth.js
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      res.status(401).send({ error: 'You must be logged in to access this resource.' });
      return;
    }

    const accessToken = authorizationHeader.split(' ')[1];
    const user = await User.findOne({ accessToken });

    if (!user) {
      res.status(401).send({ error: 'Invalid access token.' });
      return;
    }

    req.user = user;
    req.userEmail = user.email;
    next();
  } catch (error) {
    next({ status: 401, message: 'You must be logged in to access this resource.' });
  }
};
