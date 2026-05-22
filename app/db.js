

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
  const crypto = require('crypto');
  const { hashPassword } = require('./security/passwords');

  const db = new sqlite3.Database('./ctf.db');

  function seededPassword(envVarName) {
    return process.env[envVarName] || crypto.randomBytes(24).toString('hex');
  }

  // Create users table

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
        email TEXT UNIQUE NOT NULL
      )
    `);

    const seedUser = db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, email)
      VALUES (?, ?, ?, ?)
    `);

    const adminPassword = hashPassword(seededPassword('SEED_ADMIN_PASSWORD'));
    const userPassword = hashPassword(seededPassword('SEED_USER_PASSWORD'));

    seedUser.run('admin', adminPassword, 'admin', 'admin@corp.local');
    seedUser.run('user1', userPassword, 'user', 'user1@corp.local');
    seedUser.finalize();

    db.run(
      `
        UPDATE users
        SET password = ?
        WHERE username = 'admin' AND password NOT LIKE '%:%'
      `,
      [adminPassword]
    );
    db.run(
      `
        UPDATE users
        SET password = ?
        WHERE username = 'user1' AND password NOT LIKE '%:%'
      `,
      [userPassword]
    );
  });

  module.exports = db;