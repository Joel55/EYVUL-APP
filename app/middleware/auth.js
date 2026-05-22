// const crypto = require('crypto');
//   const jwt = require('jsonwebtoken');

//   const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

//   if (!process.env.JWT_SECRET) {
//     console.warn('JWT_SECRET is not set. Using an ephemeral development secret.');
//   }

//   function authenticate(req, res, next) {
//     const authHeader = req.get('authorization');
//     const token = authHeader && authHeader.startsWith('Bearer ')
//       ? authHeader.slice(7)
//       : null;

//     if (!token) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     try {
//       req.user = jwt.verify(token, JWT_SECRET, {
//         issuer: 'ctf-api',
//         audience: 'ctf-client'
//       });
//       return next();
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid or expired token' });
//     }
//   }

//   function requireAdmin(req, res, next) {
//     if (!req.user || req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }

//     return next();
//   }

//   module.exports = {
//     JWT_SECRET,
//     authenticate,
//     requireAdmin
//   };

const express = require('express');
  const router = express.Router();
  const db = require('../db');
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  const { verifyPassword } = require('../security/passwords');

  // Login
  router.post('/login', (req, res) => {
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