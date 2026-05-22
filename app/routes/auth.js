
const express = require('express');
  const router = express.Router();
  const db = require('../db');
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  const { verifyPassword } = require('../security/passwords');
  const { createRateLimiter } = require('../middleware/rateLimit');

  const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.'
  });
  // Login
  router.post('/login',createRateLimiter, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Unable to process login' });
      }

      if (!row || !verifyPassword(password, row.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          id: row.id,
          username: row.username,
          role: row.role
        },
        JWT_SECRET,
        {
          expiresIn: '15m',
          issuer: 'ctf-api',
          audience: 'ctf-client'
        }
      );

      res.json({
        message: `Welcome ${row.username}`,
        token
      });
    });
  });

  module.exports = router;