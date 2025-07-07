require('dotenv').config({ path: '../.env' });
const db = require('./index');

const createHRRequestTable = `
  CREATE TABLE IF NOT EXISTS hr_requests (
    request_id SERIAL PRIMARY KEY,
    employee_id VARCHAR NOT NULL,
    request_title TEXT NOT NULL,
    request_query TEXT NOT NULL,
    hr_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee
      FOREIGN KEY (employee_id)
      REFERENCES employees(employee_id)
      ON DELETE CASCADE
  );
`;


db.query(createHRRequestTable)
  .then(() => {
    console.log('"hr_requests" table created or already exists.');
    process.exit();
  })
  .catch((err) => {
    console.error('Error creating "hr_requests" table:', err);
    process.exit(1);
  });
