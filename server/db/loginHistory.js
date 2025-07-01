process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('./index');

const createLoginHistoryTable = `
CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(10) NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(100),
  user_agent TEXT,
  CONSTRAINT fk_employee
    FOREIGN KEY (employee_id)
    REFERENCES employees(employee_id)
    ON DELETE CASCADE
);
`;

db.query(createLoginHistoryTable)
  .then(() => {
    console.log('"login_history" table created or already exists.');
    process.exit();
  })
  .catch(err => {
    console.error('Error creating login_history table:', err);
    process.exit();
  });
