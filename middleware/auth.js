const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
require('dotenv').config();

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'No token provided. Please login.'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid token or user account is inactive.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid or expired token.'
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
