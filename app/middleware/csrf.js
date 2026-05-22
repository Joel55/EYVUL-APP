const { audit } = require('./audit-log');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function refererOrigin(referer) {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function verifyOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.get('origin');
  const referer = req.get('referer');

  const effectiveOrigin = origin || (referer ? refererOrigin(referer) : null);

  if (effectiveOrigin && effectiveOrigin === allowed) {
    return next();
  }

  audit('csrf.blocked', {
    method: req.method,
    path: req.originalUrl,
    origin: origin || null,
    referer: referer || null
  });
  return res.status(403).json({ error: 'CSRF check failed' });
}

module.exports = verifyOrigin;
