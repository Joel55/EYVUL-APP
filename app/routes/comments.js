const express = require('express');
const router = express.Router();

let comments = [];

// INTENTIONALLY VULNERABLE
router.post('/comment', (req, res) => {
  const { comment } = req.body;

  comments.push(comment);

  res.send(`
    <h1>Comment Added</h1>
    <div>${comment}</div>
  `);
});

module.exports = router;