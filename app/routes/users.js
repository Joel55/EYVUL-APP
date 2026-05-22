const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('./auth');

/**
 * FIXED IDOR ROUTE (HARDENED)
 */
router.get('/user/:id', authMiddleware, (req, res) => {
  const userId = parseInt(req.params.id, 10);

  // 🔐 strict validation
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const requesterId = parseInt(req.user?.id, 10);
  const requesterRole = req.user?.role;

  // 🔐 ensure valid auth context
  if (!Number.isInteger(requesterId) || !requesterRole) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isAdmin = requesterRole === 'admin';

  // 🔐 IDOR protection
  if (!isAdmin && requesterId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const query = `
    SELECT id, username
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

    return res.json(row);
  });
});

module.exports = router;