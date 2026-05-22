// const express = require('express');
// const router = express.Router();
// const db = require('../db');

// // INTENTIONALLY VULNERABLE
// router.get('/user/:id', (req, res) => {
//   const id = req.params.id;

//   db.get(
//     `SELECT id, username, email FROM users WHERE id = ?`,
//     [id],
//     (err, row) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }

//       res.json(row);
//     }
//   );
// });

// module.exports = router;
const express = require('express');
  const router = express.Router();
  const db = require('../db');
  const { authenticate } = require('../middleware/auth');

  router.get('/user/:id', authenticate, (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    db.get('SELECT id, username, email FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Unable to fetch user' });
      }

      if (!row) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(row);
    });
  });

  module.exports = router;