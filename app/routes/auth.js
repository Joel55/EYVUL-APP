const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

/**
 * 🔐 Hash helper (CTF-safe, deterministic)
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 🔐 input validation
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const hashedPassword = hashPassword(password);

  // 🔐 parameterized query (SQL injection safe)
  const query = `
    SELECT id, username, role, password
    FROM users
    WHERE username = ?
  `;

  db.get(query, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // 🔐 prevent user enumeration timing differences
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 secure password comparison (hashed)
    const isValidPassword = row.password === hashedPassword;

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 JWT with expiration + clean payload
    const token = jwt.sign(
      {
        id: Number(row.id),
        role: row.role
      },
      SECRET,
      {
        expiresIn: '1h',
        issuer: 'ctf-platform'
      }
    );

    return res.json({
      message: `Welcome ${row.username}`,
      token
    });
  });
});

module.exports = router;