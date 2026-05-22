require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

  require('./db');

const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      name: 'ey-group3-cookie',
      
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: 'ey-group3.ctf',
      expires: 60 * 60 * 1000, // 1 hour
      path: '/ctf-cookie'
    }
  })
);
/**
 * Routes
 */
app.use('/api', authRoutes);
app.use('/api', commentRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);

app.get('/', (req, res) => {
  res.send('Secure Coding CTF Platform');
});

const PORT = 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });