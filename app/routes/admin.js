const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

/**
 * 🚦 Rate limiting (protect admin endpoint from abuse)
 */
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window
  message: {
    error: 'Too many registration attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 🔐 Admin guard
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * ✅ Validation helpers
 */
function isValidUsername(username) {
  return (
    typeof username === 'string' &&
    /^[a-zA-Z0-9_]{3,30}$/.test(username)
  );
}

function isValidPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    password.length <= 72
  );
}

function isValidEmail(email) {
  return (
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

/**
 * 🔐 Admin Register (SECURED)
 */
router.post('/register', registerLimiter, requireAdmin, async (req, res) => {
  const { username, password, email } = req.body;

  // 🔐 Strong validation
  if (
    !isValidUsername(username) ||
    !isValidPassword(password)
  ) {
    return res.status(400).json({ error: 'Invalid username or password format' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();

    // 🔐 Check if user exists
    db.get(
      `SELECT id FROM users WHERE username = ?`,
      [normalizedUsername],
      async (err, existing) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (existing) {
          return res.status(409).json({ error: 'User already exists' });
        }

        // 🔐 bcrypt hashing (secure password storage)
        const hashedPassword = await bcrypt.hash(password, 12);

        const query = `
          INSERT INTO users (username, password, role, email)
          VALUES (?, ?, ?, ?)
        `;

        db.run(
          query,
          [normalizedUsername, hashedPassword, 'user', email || null],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Internal server error' });
            }

            return res.json({
              message: 'User created successfully',
              userId: this.lastID
            });
          }
        );
      }
    );
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;