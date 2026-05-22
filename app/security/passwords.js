const crypto = require('crypto');

  const KEY_LENGTH = 64;
  const DIGEST = 'sha512';

  function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');

    return `${salt}:${hash}`;
  }

  function verifyPassword(password, storedPassword) {
    if (!password || !storedPassword || !storedPassword.includes(':')) {
      return false;
    }

    const [salt, storedHash] = storedPassword.split(':');
    const suppliedHash = crypto.scryptSync(password, salt, KEY_LENGTH);
    const storedBuffer = Buffer.from(storedHash, 'hex');

    return (
      storedBuffer.length === suppliedHash.length &&
      crypto.timingSafeEqual(storedBuffer, suppliedHash)
    );
  }

  module.exports = {
    hashPassword,
    verifyPassword
  };