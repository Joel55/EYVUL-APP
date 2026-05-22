require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

require('./db');

const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

/**
 * 🔐 Security middleware
 */
app.use(helmet());

/**
 * 🔐 CORS hardened (no open wildcard)
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || false,
  credentials: true
}));

app.use(bodyParser.json({ limit: '10kb' })); // prevent payload abuse

app.use('/api', authRoutes);
app.use('/api', commentRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);

/**
 * Health route
 */
app.get('/', (req, res) => {
  res.send('Secure Coding CTF Platform');
});

/**
 * 🔐 Basic error handler (helps avoid info leaks)
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  res.status(500).json({
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});