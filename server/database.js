import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    const dbPath = path.join(__dirname, 'vibe_detector.db');
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        dominant_emotion TEXT NOT NULL,
        confidence REAL NOT NULL,
        vibe TEXT NOT NULL,
        mood_category TEXT NOT NULL,
        playlist TEXT NOT NULL,
        color_analysis TEXT,
        preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database initialized successfully');
        // Add new columns if they don't exist
        this.addColumnIfNotExists('color_analysis', 'TEXT');
        this.addColumnIfNotExists('preferences', 'TEXT');
      }
    });
  }

  addColumnIfNotExists(columnName, columnType) {
    this.db.run(`ALTER TABLE analyses ADD COLUMN ${columnName} ${columnType}`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`Error adding column ${columnName}:`, err);
      }
    });
  }

  saveAnalysis(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO analyses (filename, dominant_emotion, confidence, vibe, mood_category, playlist, color_analysis, preferences)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        data.filename,
        data.dominantEmotion,
        data.confidence,
        data.vibe,
        data.moodCategory,
        data.playlist,
        data.colorAnalysis || null,
        data.preferences || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  getAnalysis(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM analyses WHERE id = ?';
      
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getRecentAnalyses(limit = 10) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?';
      
      this.db.all(query, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export default Database;