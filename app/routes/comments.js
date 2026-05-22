
 const express = require('express');
  const router = express.Router();

  let comments = [];

  router.post('/comment', (req, res) => {
    const { comment } = req.body;

    if (typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    comments.push(comment);

    return res.status(201).json({
      message: 'Comment added',
      comment
    });
  });

  module.exports = router;