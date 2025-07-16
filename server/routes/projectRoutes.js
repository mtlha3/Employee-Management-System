// routes/projectRoutes.js
import express from "express";
import { createProject } from "../controller/ProjectController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createProject);

export default router;
