const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const router = express.Router();
require('dotenv').config();

const users = [];

// Input validation schema
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('user').required()
});

router.post('/register', async (req, res) => {
  try {
    // validate input
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password, role } = value;

    // check if user already exists
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // hash password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = { username, password: hashedPassword, role };
    users.push(user);

    res.status(201).json({
      message: 'User created successfully',
      user: { username, role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;