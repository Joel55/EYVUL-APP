
require('dotenv').config();
 const crypto = require('crypto');
  const jwt = require('jsonwebtoken');

  const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set. Using an ephemeral development secret.');
  }

  function authenticate(req, res, next) {
    const authHeader = req.get('authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      req.user = jwt.verify(token, JWT_SECRET, {
        issuer: 'ctf-api',
        audience: 'ctf-client'
      });
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    return next();
  }

  module.exports = {
    JWT_SECRET,
    authenticate,
    requireAdmin
  };
  