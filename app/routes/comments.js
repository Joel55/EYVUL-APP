const express = require('express');
const Joi = require('joi');
const authenticate = require('../middleware/auth');
const router = express.Router();

const comments = [];

const commentSchema = Joi.object({
  comment: Joi.string().trim().min(1).max(1000).required()
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

router.post('/comment', authenticate, (req, res) => {
  const { error, value } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const sanitized = escapeHtml(value.comment);
  comments.push(sanitized);

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <h1>Comment Added</h1>
    <div>${sanitized}</div>
  `);
});

module.exports = router;
