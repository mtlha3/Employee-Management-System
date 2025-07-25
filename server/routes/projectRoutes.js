// routes/projectRoutes.js
import express from "express";
import { createProject, getAllProjects, assignTeamLead } from "../controller/ProjectController.js";
import { getTeamLeads } from "../controller/employeeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createProject);
router.get("/projects", getAllProjects);
router.get("/team-leads", getTeamLeads);
router.post("/assign-tl/:projectId", assignTeamLead);

export default router;
