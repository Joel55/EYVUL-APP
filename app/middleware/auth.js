const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { audit } = require('./audit-log');

function authenticate(req, res, next) {
  const header = req.get('authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.slice(7).trim();

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });

    if (!Number.isInteger(payload.id) || !['admin', 'user'].includes(payload.role)) {
      audit('auth.token.invalid', { reason: 'bad_payload' });
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    return next();
  } catch (err) {
    audit('auth.token.invalid', { reason: err.name || 'verify_failed' });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
