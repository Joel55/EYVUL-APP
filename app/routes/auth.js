const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  // 🔐 FIX: parameterized query prevents SQL injection
  const query = `
    SELECT id, username, role, password
    FROM users
    WHERE username = ?
  `;

  db.get(query, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 password check (still simple for CTF, but safer structure)
    if (row.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: row.id,
        role: row.role
      },
      SECRET,
      { expiresIn: '1h' } // 🔐 good practice + reduces token abuse
    );

    res.json({
      message: `Welcome ${row.username}`,
      token
    });
  });
});

module.exports = router;