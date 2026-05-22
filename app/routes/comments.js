const express = require('express');
const router = express.Router();

let comments = [];

// simple HTML escaping function
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// FIXED XSS
router.post('/comment', (req, res) => {
  const { comment } = req.body;

  if (!comment || typeof comment !== 'string') {
    return res.status(400).send('Invalid comment');
  }

  const safeComment = escapeHtml(comment);
  comments.push(safeComment);

  res.send(`
    <h1>Comment Added</h1>
    <div>${safeComment}</div>
  `);
});

module.exports = router;