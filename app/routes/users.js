const express = require('express');
const router = express.Router();
const db = require('../db');

// INTENTIONALLY VULNERABLE
router.get('/user/:id', (req, res) => {
  const id = req.params.id;

  db.get(
    `SELECT id, username, email FROM users WHERE id = ${id}`,
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(row);
    }
  );
});

module.exports = router;