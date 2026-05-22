require('dotenv').config({ quiet: true });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10kb' }));
app.use('/api', authRoutes);
app.use('/api', commentRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.get('/', (req, res) => {
  res.send('Secure Coding CTF Platform');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
