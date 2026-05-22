const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./ctf.db');

// Initialize DB safely
db.serialize(async () => {
  // Create users table with constraints
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','user')) NOT NULL DEFAULT 'user',
      email TEXT UNIQUE NOT NULL
    )
  `);

  // Check if admin already exists before inserting
  db.get(`SELECT * FROM users WHERE username = ?`, ['admin'], async (err, row) => {
    if (err) {
      console.error('DB error:', err);
      return;
    }

    if (!row) {
      // Hash passwords before inserting
      const adminPassword = await bcrypt.hash('admin123', 12);
      const userPassword = await bcrypt.hash('password123', 12);

      db.run(`
        INSERT INTO users (username, password, role, email)
        VALUES
        (?, ?, 'admin', ?),
        (?, ?, 'user', ?)
      `, ['admin', adminPassword, 'admin@corp.local', 'user1', userPassword, 'user1@corp.local'], (err) => {
        if (err) console.error('Error inserting users:', err);
        else console.log('Default users created.');
      });
    }
  });
});

module.exports = db;