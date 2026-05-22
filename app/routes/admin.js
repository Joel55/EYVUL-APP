

const express = require('express');
const router = express.Router();

// Admin Auth 
router.post('/register', (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  };

  res.json({
    message: 'User created',
    user
  });
});

  module.exports = router;