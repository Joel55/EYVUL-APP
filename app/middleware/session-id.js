const crypto = require('crypto');

const COOKIE_NAME = 'app-session-id';
const isProd = process.env.NODE_ENV === 'production';

function ensureSessionId(req, res, next) {
  let id = req.cookies && req.cookies[COOKIE_NAME];

  if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) {
    id = crypto.randomBytes(32).toString('hex');
    res.cookie(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProd,
      path: '/'
    });
    if (!req.cookies) req.cookies = {};
    req.cookies[COOKIE_NAME] = id;
  }

  req.sessionId = id;
  next();
}

module.exports = ensureSessionId;
