const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const escapeHtml = require('escape-html');

/**
 * 🚦 Rate limit to prevent spam / abuse
 */
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many comments, slow down' }
});

/**
 * In-memory store (CTF-safe)
 */
const comments = [];

// FIXED XSS + hardened version
router.post('/comment', commentLimiter, (req, res) => {
  let { comment } = req.body;

  // 🔐 validation
  if (
    typeof comment !== 'string' ||
    comment.trim().length === 0
  ) {
    return res.status(400).send('Invalid comment');
  }

  // 🔐 prevent DoS via huge payloads
  if (comment.length > 500) {
    return res.status(400).send('Comment too long');
  }

  const safeComment = escapeHtml(comment.trim());

  comments.push(safeComment);

  return res.send(`
    <h1>Comment Added</h1>
    <div>${safeComment}</div>
  `);
});

module.exports = router;