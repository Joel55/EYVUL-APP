const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

/**
 * 🚦 Rate limit to prevent spam / abuse
 */
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many comments, slow down' }
});


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

  comments.push(comment.trim());
  return res.render('comment', {
    comment: comment.trim()
  });
});

module.exports = router;