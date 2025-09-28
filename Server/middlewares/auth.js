const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, MESSAGES } = require('../config/constants');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
      error: 'Invalid token'
    });
  }
};

module.exports = auth;
