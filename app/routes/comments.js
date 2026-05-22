const express = require('express');
const router = express.Router();
let comments = [];

router.post('/comment', (req, res) => {
  const { comment } = req.body;

  const sanitized = comment
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  comments.push(sanitized);
  res.send(`
    <h1>Comment Added</h1>
    <div>${sanitized}</div>
  `);
});
module.exports = router;