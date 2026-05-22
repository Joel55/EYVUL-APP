const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { jwtSecret } = require('../config');
const { authLimiter } = require('../middleware/rate-limit');
const { audit } = require('../middleware/audit-log');

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-placeholder', 12);

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(128).required()
});

router.post('/login', authLimiter, (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { username, password } = value;

  const query = `SELECT * FROM users WHERE username = ?`;
  db.get(query, [username], async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const hashToCompare = row ? row.password : DUMMY_HASH;
    const match = await bcrypt.compare(password, hashToCompare);

    if (!row || !match) {
      audit('auth.login.failure', {
        username,
        reason: !row ? 'unknown_user' : 'bad_password'
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: row.id, role: row.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    audit('auth.login.success', { userId: row.id, role: row.role });

    res.json({
      message: `Welcome ${row.username}`,
      token
    });
  });
});

module.exports = router;
