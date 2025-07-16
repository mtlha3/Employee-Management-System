process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import db from './index.js'; // Make sure this exports the pool

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// SQL for project table
const createProjectTable = `
  CREATE TABLE IF NOT EXISTS projects (
    project_id VARCHAR(5) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    project_manager_id TEXT NOT NULL,
    project_manager_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

db.query(createProjectTable)
  .then(() => {
    console.log('"projects" table created or already exists.');
    process.exit();
  })
  .catch(err => {
    console.error('Error creating "projects" table:', err);
    process.exit(1);
  });
