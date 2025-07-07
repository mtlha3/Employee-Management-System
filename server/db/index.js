process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("Connected to Supabase PostgreSQL DB"))
  .catch(err => console.error("DB connection error:", err));

module.exports = pool;
