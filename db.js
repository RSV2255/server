import sqlite3 from 'sqlite3'; // Import sqlite3
import { open } from 'sqlite'; // Import open function from sqlite

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

export default initializeDatabase;

