const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');

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

  const query = `
    SELECT * FROM users
    WHERE username = '${username}'
    AND password = '${password}'
  `;

  db.get(query, [username.trim().toLowerCase()], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 secure comparison
    const isValidPassword = await bcrypt.compare( password ,row.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    
/// 🔐 stronger JWT claims
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