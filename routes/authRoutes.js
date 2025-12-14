const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username, email, and password are required.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email or username already exists.'
      });
    }

    // Create user (only admins can set role, default is 'analyst')
    const userData = { username, email, password };
    if (role && req.user && req.user.role === 'admin') {
      userData.role = role;
    }

    const user = await User.create(userData);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required.'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials or account is inactive.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials.'
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

// Update current user profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    await req.user.update(updates);

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Current password and new password are required.'
      });
    }

    const isPasswordValid = await req.user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Current password is incorrect.'
      });
    }

    await req.user.update({ password: newPassword });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
