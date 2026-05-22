const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const SECRET = process.env.JWT_SECRET || 'supersecret';

// input validation
const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(128).required()
});

router.post('/login', (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { username, password } = value;

  // use parameterized queries to prevent SQL injection
  const query = `SELECT * FROM users WHERE username = ?`;
  db.get(query, [username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (!row) return res.status(401).json({ message: 'Invalid credentials' });

    // compare hashed password
    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // create JWT with expiration
    const token = jwt.sign(
      { id: row.id, role: row.role },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: `Welcome ${row.username}`,
      token
    });
  });
});

module.exports = router;