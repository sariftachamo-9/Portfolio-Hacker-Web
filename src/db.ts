import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('portfolio.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    technologies TEXT,
    github_link TEXT,
    live_link TEXT,
    image TEXT,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    proficiency_level INTEGER,
    is_visible INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    organization TEXT NOT NULL,
    duration TEXT,
    description TEXT,
    is_visible INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT,
    year TEXT,
    credential_link TEXT,
    is_visible INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    duration TEXT,
    focus TEXT,
    is_visible INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    image TEXT,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initial Seeding logic is now locked. 
// To re-seed, manually clear the database or reset the projectCount check.
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
if (projectCount.count === 0) {
  console.log('--- SYSTEM_INIT: Populating Production Data ---');
  // Seeding removed for security and data integrity.
  // Data is now persistent in the local portfolio.db file.
}

export default db;
