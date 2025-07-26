import express from "express";
import { createProject, getAllProjects, assignTeamLead,getProjectsForTeamLead, assignDevelopers, 
    getProjectDevelopers, assignTaskToDeveloper, getTasksForDeveloper, getProjectsAndTasksForDeveloper,
submitTaskByDeveloper } from "../controller/ProjectController.js";
import { getTeamLeads } from "../controller/employeeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"

const router = express.Router();

router.post("/create", authenticateToken, createProject);
router.get("/projects", getAllProjects);
router.get("/team-leads", getTeamLeads);
router.post("/assign-tl/:projectId", assignTeamLead);
router.get("/team-lead/projects", authenticateToken, getProjectsForTeamLead);
router.put("/:projectId/assign-developers", authenticateToken, assignDevelopers);
router.get('/projects/:projectId/developers', getProjectDevelopers);
router.post('/tasks/assign', upload.single('file'), assignTaskToDeveloper);
router.get('/projects/:projectId/developers/:developerId/tasks', getTasksForDeveloper);
router.get("/developers/projects-and-tasks", authenticateToken, getProjectsAndTasksForDeveloper);
router.post("/developers/:developerId/tasks/:taskId/submit",authenticateToken,upload.single('file'),submitTaskByDeveloper);


export default router;
