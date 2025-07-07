process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const employeeRoutes = require('./routes/employeeRoutes');
const hrRoutes = require('./routes/hrRoutes');
const db = require('./db');

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true               
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/employees', employeeRoutes);
app.use("/api/employees", hrRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
