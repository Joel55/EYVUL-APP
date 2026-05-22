require('dotenv').config({ quiet: true });

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('./db');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection
} = require('./middleware/csrf');
const ensureSessionId = require('./middleware/session-id');
const { audit } = require('./middleware/audit-log');

const allowedOrigin = process.env.ALLOWED_ORIGIN;
if (!allowedOrigin || allowedOrigin.trim() === '' || allowedOrigin.trim() === '*') {
  throw new Error('ALLOWED_ORIGIN must be set to a specific origin (wildcard "*" is not allowed)');
}

const app = express();

app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 0);

app.use(helmet());

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true
}));

app.use(cookieParser());
app.use(ensureSessionId);
app.use(bodyParser.json({ limit: '10kb' }));

app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  res.json({ csrfToken });
});

app.use(doubleCsrfProtection);

app.use('/api', authRoutes);
app.use('/api', commentRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.get('/', (req, res) => {
  res.send('Secure Coding CTF Platform');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError || err && err.code === 'EBADCSRFTOKEN') {
    audit('csrf.blocked', {
      method: req.method,
      path: req.originalUrl,
      origin: req.get('origin') || null,
      referer: req.get('referer') || null
    });
    return res.status(403).json({ error: 'CSRF check failed' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
