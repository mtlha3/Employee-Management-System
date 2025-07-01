require('dotenv').config({ path: '../.env' });
const db = require('./index');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS employees (
  employee_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(createTableQuery)
  .then(() => {
    console.log('"employees" table created with employee_id as PRIMARY KEY.');
    process.exit();
  })
  .catch(err => {
    console.error('Error creating table:', err);
    process.exit();
  });
