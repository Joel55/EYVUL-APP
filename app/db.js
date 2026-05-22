const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./ctf.db');

db.serialize(async () => {
  // 🔐 schema with constraints
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('user','admin')) DEFAULT 'user',
      email TEXT
    )
  `);

  // ⚠️ CTF reset (explicit intent)
  db.run(`DELETE FROM users`);

  // 🔐 bcrypt hashing (consistent with login/register)
  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('password123', 12);

  const stmt = db.prepare(`
    INSERT INTO users (username, password, role, email)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run('admin', adminPass, 'admin', 'admin@corp.local');
  stmt.run('user1', userPass, 'user', 'user1@corp.local');

  stmt.finalize();
});

module.exports = db;