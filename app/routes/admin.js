

const express = require('express');
  const router = express.Router();
  const db = require('../db');
  const { authenticate, requireAdmin } = require('../middleware/auth');
  const { hashPassword } = require('../security/passwords');

  router.post('/register', authenticate, requireAdmin, (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
    }

    db.run(
      `
        INSERT INTO users (username, password, role, email)
        VALUES (?, ?, ?, ?)
      `,
      [username, hashPassword(password), 'user', email],
      function insertUser(err) {
        if (err) {
          return res.status(400).json({ message: 'Unable to create user' });
        }

        return res.status(201).json({
          message: 'User created',
          user: {
            id: this.lastID,
            username,
            role: 'user',
            email
          }
        });
      }
    );
  });

  module.exports = router;