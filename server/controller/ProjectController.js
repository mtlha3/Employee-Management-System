import Project from '../models/project.js';
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import fs from "fs";

const generateProjectId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};


//==================== Create Project ====================
export const createProject = async (req, res) => {
  const { project_name, start_date, end_date } = req.body;

  const project_manager_id = req.user?.employee_id;
  const project_manager_name = req.user?.name;

  if (!project_manager_id || !project_manager_name) {
    return res
      .status(400)
      .json({ error: "Project manager info missing from token" });
  }

  try {
    const project_id = generateProjectId();

    const newProject = new Project({
      project_id,
      project_name,
      start_date,
      end_date,
      project_manager_id,
      project_manager_name,
    });

    const savedProject = await newProject.save();

    res.status(201).json({
      message: "Project created successfully",
      project: savedProject,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
};


//==================== Get All Project ====================

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ created_at: -1 })
      .select('project_id project_name start_date end_date project_manager_name created_at');

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

//==================== Assign Team Lead ====================
export const assignTeamLead = async (req, res) => {
  const { projectId } = req.params;
  const { employee_id, name, role } = req.body;

  if (!employee_id || !name || !role) {
    return res.status(400).json({ error: "Team lead data incomplete" });
  }

  try {
    const updatedProject = await Project.findOneAndUpdate(
      { project_id: projectId },
      { team_lead: { employee_id, name, role } },
      { new: true }
    );

    if (!updatedProject) return res.status(404).json({ error: "Project not found" });

    res.status(200).json({ message: "Team lead assigned", project: updatedProject });
  } catch (err) {
    console.error("Assign team lead error:", err);
    res.status(500).json({ error: "Failed to assign team lead" });
  }
};


//==================== Team Lead Projects ====================
export const getProjectsForTeamLead = async (req, res) => {
  const team_lead_id = req.user?.employee_id;

  if (!team_lead_id) {
    return res.status(401).json({ error: "Unauthorized: Missing team lead ID" });
  }

  try {
    const projects = await Project.find(
      { "team_lead.employee_id": team_lead_id },
      {
        project_id: 1,
        project_name: 1,
        start_date: 1,
        end_date: 1,
        project_manager_id: 1,
        project_manager_name: 1,
        created_at: 1,
      }
    ).sort({ created_at: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects for team lead:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

//==================== Assign Developers to Project ====================
export const assignDevelopers = async (req, res) => {
  const { projectId } = req.params;
  const { developers } = req.body;

  try {
    const project = await Project.findOne({ project_id: projectId });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const existingIds = new Set(project.developers.map(dev => dev.employee_id));
    const newDevelopers = developers.filter(dev => !existingIds.has(dev.employee_id));

    project.developers.push(...newDevelopers);

    const updatedProject = await project.save();

    res.status(200).json({ message: "Developers assigned", project: updatedProject });
  } catch (error) {
    console.error("Error assigning developers:", error);
    res.status(500).json({ error: "Failed to assign developers" });
  }
};

//==================== Get Developer Working on Project ====================
export const getProjectDevelopers = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findOne({ project_id: projectId });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ developers: project.developers });
  } catch (error) {
    console.error("Error fetching developers:", error);
    res.status(500).json({ error: "Failed to fetch developers" });
  }
};


//============

export const assignTaskToDeveloper = async (req, res) => {
  try {
    const { project_id, developerId, title, description } = req.body;
    const file = req.file;

    if (!project_id || !developerId || !title || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const project = await Project.findOne({ project_id });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const developer = project.developers.find(dev => dev.employee_id === developerId);
    if (!developer) {
      return res.status(404).json({ message: "Developer not found in project." });
    }

    const task = {
      task_id: uuidv4().slice(0, 6).toUpperCase(),
      title,
      description,
      status: 'pending',
      assigned_at: new Date(),
      file: file ? {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      } : null
    };

    developer.tasks.push(task);
    await project.save();

    res.status(200).json({ message: "Task assigned successfully.", task });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//================

export const getTasksForDeveloper = async (req, res) => {
  try {
    const { projectId, developerId } = req.params;

    const project = await Project.findOne({ project_id: projectId });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const developer = project.developers.find(
      (dev) => dev.employee_id.trim().toLowerCase() === developerId.trim().toLowerCase()
    );

    if (!developer) {
      return res.status(404).json({ message: "Developer not found in this project." });
    }

    res.status(200).json({ tasks: developer.tasks || [] });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error while fetching tasks." });
  }
};

//==========
  export const getProjectsAndTasksForDeveloper = async (req, res) => {
  try {
    const developerId = req.user.employee_id; // Extract from authenticated user

    const projects = await Project.find({
      "developers.employee_id": developerId,
    });

    if (!projects.length) {
      return res.status(404).json({ message: "No projects found for this developer." });
    }

    const result = projects.map((project) => {
      const developer = project.developers.find(dev => dev.employee_id === developerId);

      return {
        project_id: project.project_id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        team_lead: project.team_lead,
        project_manager_id: project.project_manager_id,
        project_manager_name: project.project_manager_name,
        developer: {
          employee_id: developer.employee_id,
          name: developer.name,
          role: developer.role,
          tasks: developer.tasks || [],
        }
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching developer's projects and tasks:", error);
    res.status(500).json({ message: "Server error while fetching data." });
  }
}

//==========

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/submitted_tasks";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
export const upload = multer({ storage: storage }).single("submission_file");

export const submitTaskByDeveloper = async (req, res) => {
  const { developerId, taskId } = req.params;
  const { comment } = req.body;

  try {
    const project = await Project.findOne({
      "developers.tasks.task_id": taskId,
      "developers.employee_id": developerId
    });

    if (!project) {
      return res.status(404).json({ error: "Project or task not found" });
    }

    const developer = project.developers.find(
      (dev) => dev.employee_id === developerId
    );

    if (!developer) {
      return res.status(404).json({ error: "Developer not found in project" });
    }

    const task = developer.tasks.find((t) => t.task_id === taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = "pending";
    task.submission_comment = comment || "";
    task.submitted_at = new Date();

    if (req.file) {
      task.submission_file = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    await project.save();
    return res.status(200).json({ message: "Task submitted successfully", task });
  } catch (error) {
    console.error("Submission error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


//=========
export const getAllTaskSubmissionsForTeamLead = async (req, res) => {
  const teamLeadId = req.user?.employee_id;

  if (!teamLeadId) {
    return res.status(401).json({ error: "Unauthorized: Team Lead ID missing" });
  }

  try {
    const projects = await Project.find({ "team_lead.employee_id": teamLeadId });

    let submissions = [];

    projects.forEach(project => {
      project.developers.forEach(developer => {
        developer.tasks.forEach(task => {
          if (task.submission_file && task.submitted_at) {
            submissions.push({
              project_id: project.project_id,
              project_name: project.project_name,
              developer_id: developer.employee_id,
              developer_name: developer.name,
              task_id: task.task_id,
              task_title: task.title,
              submitted_at: task.submitted_at,
              comment: task.submission_comment,
              submission_file: task.submission_file,
              status: task.status
            });
          }
        });
      });
    });

    // ✅ Return correct response
    return res.status(200).json({ submissions });

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//======

export const updateTaskStatus = async (req, res) => {
  const { project_id, developer_id, task_id, status } = req.body;

  if (!project_id || !developer_id || !task_id || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const project = await Project.findOne({ project_id });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const developer = project.developers.find(dev => dev.employee_id === developer_id);
    if (!developer) {
      return res.status(404).json({ error: "Developer not found in this project" });
    }

    const task = developer.tasks.find(task => task.task_id === task_id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = status;
    await project.save();

    return res.status(200).json({ message: "Task status updated successfully", task });
  } catch (err) {
    console.error("Error updating task status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//=============
export const getStatusUpdatedTasksForTeamLead = async (req, res) => {
  const teamLeadId = req.user?.employee_id;

  if (!teamLeadId) {
    return res.status(401).json({ error: "Unauthorized: Team Lead ID missing" });
  }

  try {
    const projects = await Project.find({ "team_lead.employee_id": teamLeadId });

    let updatedTasks = [];

    projects.forEach(project => {
      project.developers.forEach(developer => {
        developer.tasks.forEach(task => {
          if (
            task.status !== "pending" &&         // assuming "pending" is the default
            task.submission_file &&              // only consider submitted tasks
            task.submitted_at
          ) {
            updatedTasks.push({
              project_id: project.project_id,
              project_name: project.project_name,
              developer_id: developer.employee_id,
              developer_name: developer.name,
              task_id: task.task_id,
              task_title: task.title,
              submitted_at: task.submitted_at,
              comment: task.submission_comment,
              submission_file: task.submission_file,
              status: task.status
            });
          }
        });
      });
    });

    return res.status(200).json({ updatedTasks });

  } catch (error) {
    console.error("Error fetching updated tasks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
