import express from "express";
import { createProject, updateProject, deleteProject ,getAllProjects, assignTeamLead,getProjectsForTeamLead, assignDevelopers, 
    getProjectDevelopers, assignTaskToDeveloper, getTasksForDeveloper, getProjectsAndTasksForDeveloper,
submitTaskByDeveloper, getAllTaskSubmissionsForTeamLead, updateTaskStatus, getStatusUpdatedTasksForTeamLead,
getAllSubmissionsLog, downloadSubmissionFile, getTeamLeadOfProject, removeDeveloperFromProject } from "../controller/ProjectController.js";
import { getTeamLeads } from "../controller/employeeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"

const router = express.Router();

router.post("/create", authenticateToken, createProject);
router.put("/projects/:projectId", updateProject)
router.delete("/projects/:projectId", deleteProject)
router.get("/projects", getAllProjects);
router.get("/team-leads", getTeamLeads);
router.post("/assign-tl/:projectId", assignTeamLead);
router.get("/projects/team-lead/:projectId", getTeamLeadOfProject);
router.get("/team-lead/projects", authenticateToken, getProjectsForTeamLead);
router.put("/:projectId/assign-developers", authenticateToken, assignDevelopers);
router.get('/projects/:projectId/developers', getProjectDevelopers);
router.post('/tasks/assign', upload.single('file'), assignTaskToDeveloper);
router.get('/projects/:projectId/developers/:developerId/tasks', getTasksForDeveloper);
router.get("/developers/projects-and-tasks", authenticateToken, getProjectsAndTasksForDeveloper);
router.post("/developers/:developerId/tasks/:taskId/submit",authenticateToken,upload.single('file'),submitTaskByDeveloper);
router.get("/teamlead/submissions", authenticateToken , getAllTaskSubmissionsForTeamLead);
router.put("/project/updatetaskstatus", updateTaskStatus);
router.get("/teamlead/status-updated-tasks", getStatusUpdatedTasksForTeamLead);
router.get("/admin/all-submissions", getAllSubmissionsLog);
router.get("/project/:projectId/developer/:developerId/task/:taskId/download-submission",authenticateToken,downloadSubmissionFile)
router.delete('/projects/:projectId/developers/:employeeId', removeDeveloperFromProject)
export default router;
