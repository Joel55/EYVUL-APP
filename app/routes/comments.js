const express = require('express');
  const router = express.Router();
  const db = require('../db');
  const { authenticate } = require('../middleware/auth');
  const { isValidComment } = require('../validation');
 
  router.post('/comment', authenticate, (req, res) => {
    const { comment } = req.body;
 
    if (!isValidComment(comment)) {
      return res.status(400).json({ message: 'Comment must be between 1 and 1000 characters' });
    }
 
    db.run(
      'INSERT INTO comments (user_id, comment) VALUES (?, ?)',
      [req.user.id, comment.trim()],
      function insertComment(err) {
        if (err) return res.status(500).json({ message: 'Unable to save comment' });
 
        return res.status(201).json({
          message: 'Comment added',
          comment: {
            id: this.lastID,
            userId: req.user.id,
            text: comment.trim()
          }
        });
      }
    );
  });
 
  module.exports = router;