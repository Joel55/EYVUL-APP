require('dotenv').config({ quiet: true });

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters');
}

module.exports = {
  jwtSecret
};
