const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const db = require('../db');
const { authLimiter } = require('../middleware/rate-limit');
const router = express.Router();

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(128).required(),
  email: Joi.string().email().required()
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password, email } = value;
    const hashedPassword = await bcrypt.hash(password, 12);

    db.run(
      `INSERT INTO users (username, password, role, email) VALUES (?, ?, 'user', ?)`,
      [username, hashedPassword, email],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'Username or email already exists' });
          }
          console.error(err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({
          message: 'User created successfully',
          user: { username, role: 'user' }
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
