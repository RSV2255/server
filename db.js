const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db = null;

async function initializeDatabase() {
  if (db) {
    return db;
  }

  try {
    db = await open({
      filename: './data/my-database.db',
      driver: sqlite3.Database
    });
    console.log('SQLite database connected');
    return db;
  } catch (error) {
    console.error('Error connecting to SQLite database:', error.message);
    process.exit(1);
  }
}

module.exports = {
  initializeDatabase,
  getDatabase: () => db
};