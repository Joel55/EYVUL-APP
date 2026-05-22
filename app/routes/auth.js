const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

/**
 * 🚦 Rate limit login attempts (brute-force protection)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 🔐 Hash helper
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * 🔐 Constant-time comparison
 */
function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
}

router.post('/login', loginLimiter, (req, res) => {
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

  const query = `
    SELECT id, username, role, password
    FROM users
    WHERE username = ?
  `;

  db.get(query, [username.trim().toLowerCase()], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // uniform response (prevents enumeration)
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 secure comparison
    const isValidPassword = safeCompare(row.password, hashedPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 stronger JWT claims
    const token = jwt.sign(
      {
        id: Number(row.id),
        role: row.role
      },
      SECRET,
      {
        expiresIn: '1h',
        issuer: 'ctf-platform',
        audience: 'ctf-users',
        notBefore: '0s'
      }
    );

    return res.json({
      message: `Welcome ${row.username}`,
      token
    });
  });
});

module.exports = router;