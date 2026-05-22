const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

/**
 * Admin guard
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * 🔐 Password hashing (must match login route)
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Admin Register (SECURED)
router.post('/register', requireAdmin, (req, res) => {
  const { username, password, email } = req.body;

  // 🔐 input validation
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const hashedPassword = hashPassword(password);

  const query = `
    INSERT INTO users (username, password, role, email)
    VALUES (?, ?, ?, ?)
  `;

  const params = [
    username.trim(),
    hashedPassword,
    'user', // 🔐 FIX: prevent privilege escalation (no mass assignment)
    email || null
  ];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json({
      message: 'User created successfully',
      userId: this.lastID
    });
  });
});

module.exports = router;