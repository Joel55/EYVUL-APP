const express = require('express');
  const router = express.Router();
  const db = require('../db');
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  const { createRateLimiter } = require('../middleware/rateLimit');
  const { verifyPassword } = require('../security/passwords');
  const { isValidUsername } = require('../validation');
 
  const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.'
  });
 
  router.post('/login', loginRateLimiter, async (req, res, next) => {
    const { username, password } = req.body;
 
    if (!isValidUsername(username) || typeof password !== 'string' || password.length > 128) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
 
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      try {
        if (err) return res.status(500).json({ message: 'Unable to process login' });
 
        if (!row || !(await verifyPassword(password, row.password))) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
 
        const token = jwt.sign(
          { id: row.id, username: row.username, role: row.role },
          JWT_SECRET,
          { expiresIn: '15m', issuer: 'ctf-api', audience: 'ctf-client' }
        );
 
        return res.json({ message: `Welcome ${row.username}`, token });
      } catch (error) {
        return next(error);
      }
    });
  });
 
  module.exports = router;