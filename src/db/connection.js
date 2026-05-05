const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ensure database path is always relative to the project root
const dbPath = path.resolve(__dirname, '../../sansad.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  }
});

module.exports = db;
