// routes/projectRoutes.js
import express from "express";
import { createProject, getAllProjects } from "../controller/ProjectController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createProject);
router.get("/projects", getAllProjects);

export default router;
