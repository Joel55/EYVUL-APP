require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('./db');

const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');

const app = express();

/**
 * 🔐 Security headers (hardened)
 */
app.use(
  helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" }
  })
);

/**
 * 🚦 Global rate limit (baseline protection)
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

/**
 * 🔐 CORS hardened
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

/**
 * 🔐 Body size protection
 */
app.use(bodyParser.json({ limit: '10kb' }));

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

/**
 * Health check
 */
app.get('/', (req, res) => {
  res.status(200).send('Secure Coding CTF Platform');
});

/**
 * 🔐 Safe error handler (no internal leakage)
 */
app.use((err, req, res, next) => {
  // avoid leaking internal error details
  return res.status(500).json({
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});