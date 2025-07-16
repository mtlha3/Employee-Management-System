process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import pool from "./db/index.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/employees", hrRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
