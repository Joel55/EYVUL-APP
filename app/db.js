require('dotenv').config({ quiet: true });
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./ctf.db');

function seedUser(username, password, role, email) {
  const hasAnyValue = username || password || email;
  if (!hasAnyValue) return;
  if (!username || !password || !email) throw new Error(`${role.toUpperCase()} seed user requires username, password, and email`);
  if (password.length < 12) throw new Error(`${role.toUpperCase()} seed password must be at least 12 characters`);

  db.get(`SELECT id FROM users WHERE username = ?`, [username], async (err, row) => {
    if (err) {
      console.error('DB error:', err);
      return;
    }

    if (row) return;

    const hashedPassword = await bcrypt.hash(password, 12);

    db.run(
      `INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)`,
      [username, hashedPassword, role, email],
      (err) => {
        if (err) console.error('Error inserting user:', err);
      }
    );
  });
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','user')) NOT NULL DEFAULT 'user',
      email TEXT UNIQUE NOT NULL
    )
  `);

  seedUser(process.env.SEED_ADMIN_USERNAME, process.env.SEED_ADMIN_PASSWORD, 'admin', process.env.SEED_ADMIN_EMAIL);
  seedUser(process.env.SEED_USER_USERNAME, process.env.SEED_USER_PASSWORD, 'user', process.env.SEED_USER_EMAIL);
});

module.exports = db;
