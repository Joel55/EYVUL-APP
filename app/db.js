const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./ctf.db');

/**
 * Simple hash helper (CTF-safe, avoids plaintext password flagging)
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      email TEXT
    )
  `);

  // ⚠️ CTF reset - keep but make intent explicit
  db.run(`DELETE FROM users`);

  const adminPass = hashPassword('admin123');
  const userPass = hashPassword('password123');

  const stmt = db.prepare(`
    INSERT INTO users (username, password, role, email)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run('admin', adminPass, 'admin', 'admin@corp.local');
  stmt.run('user1', userPass, 'user', 'user1@corp.local');

  stmt.finalize();
});

module.exports = db;