const { doubleCsrf } = require('csrf-csrf');
const { csrfSecret } = require('../config');

const isProd = process.env.NODE_ENV === 'production';

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection
} = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) => req.sessionId,
  cookieName: isProd ? '__Host-csrf-token' : 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    path: '/'
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token']
});

module.exports = {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection
};
