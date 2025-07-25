// routes/projectRoutes.js
import express from "express";
import { createProject, getAllProjects, assignTeamLead,getProjectsForTeamLead, assignDevelopers, getProjectDevelopers } from "../controller/ProjectController.js";
import { getTeamLeads } from "../controller/employeeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createProject);
router.get("/projects", getAllProjects);
router.get("/team-leads", getTeamLeads);
router.post("/assign-tl/:projectId", assignTeamLead);
router.get("/team-lead/projects", authenticateToken, getProjectsForTeamLead);
router.put("/:projectId/assign-developers", authenticateToken, assignDevelopers);
router.get('/projects/:projectId/developers', getProjectDevelopers);

export default router;
