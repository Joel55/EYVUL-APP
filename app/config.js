require('dotenv').config({ quiet: true });

const jwtSecret = process.env.JWT_SECRET;
const csrfSecret = process.env.CSRF_SECRET;
const sessionSecret = process.env.SESSION_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters');
}

if (!csrfSecret || csrfSecret.length < 32) {
  throw new Error('CSRF_SECRET must be set to at least 32 characters');
}

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be set to at least 32 characters');
}

module.exports = {
  jwtSecret,
  csrfSecret,
  sessionSecret
};
