const express = require('express');
const router = express.Router();

// Admin Auth (assumes middleware exists elsewhere)
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Admin Register (FIXED)
router.post('/register', requireAdmin, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const user = {
    username,
    password,
    role: 'user' // 🔐 FIX: prevent mass assignment of role
  };

  res.json({
    message: 'User created',
    user
  });
});

module.exports = router;