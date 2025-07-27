import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import employeeRoutes from "./routes/employeeRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import connectDB from "./db/db.js";

dotenv.config();

const app = express();
await connectDB();

app.use(cors({
  origin: true,  
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/employees", employeeRoutes);
app.use("/api/employees", hrRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
