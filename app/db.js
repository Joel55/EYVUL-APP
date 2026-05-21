
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ctf.db');

// Create users table

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT,
      role TEXT,
      email TEXT
    )
  `);

  db.run(`DELETE FROM users`);

  db.run(`
    INSERT INTO users (username, password, role, email)
    VALUES
    ('admin', 'admin123', 'admin', 'admin@corp.local'),
    ('user1', 'password123', 'user', 'user1@corp.local')
  `);
});

module.exports = db;