const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('./auth');

// FIXED IDOR ROUTE
router.get('/user/:id', auth, (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const requesterId = Number(req.user.id);
  const isAdmin = req.user.role === 'admin';

  // 🔐 IDOR FIX
  if (!isAdmin && requesterId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const query = `
    SELECT id, username, email
    FROM users
    WHERE id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(row);
  });
});

module.exports = router;