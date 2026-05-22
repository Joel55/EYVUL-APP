// require('dotenv').config();

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// require('./db');

// const authRoutes = require('./routes/auth');
// const commentRoutes = require('./routes/comments');
// const userRoutes = require('./routes/users');
// const adminRoutes = require('./routes/admin');

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// app.use('/api', authRoutes);
// app.use('/api', commentRoutes);
// app.use('/api', userRoutes);
// app.use('/api', adminRoutes);

// app.get('/', (req, res) => {
//   res.send('Secure Coding CTF Platform');
// });

// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

 require('dotenv').config();

  const express = require('express');
  const bodyParser = require('body-parser');
  const cors = require('cors');

  require('./db');

  const authRoutes = require('./routes/auth');
  const commentRoutes = require('./routes/comments');
  const userRoutes = require('./routes/users');
  const adminRoutes = require('./routes/admin');

  const app = express();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    }
  }));
  app.use(bodyParser.json({ limit: '100kb' }));

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