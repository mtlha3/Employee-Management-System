import Project from '../models/project.js';

const generateProjectId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

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

export const assignDevelopers = async (req, res) => {
  const { projectId } = req.params;
  const { developers } = req.body;

  try {
    const project = await Project.findOne({ project_id: projectId });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Filter out already added developers
    const existingIds = new Set(project.developers.map(dev => dev.employee_id));
    const newDevelopers = developers.filter(dev => !existingIds.has(dev.employee_id));

    // Append new ones
    project.developers.push(...newDevelopers);

    const updatedProject = await project.save();

    res.status(200).json({ message: "Developers assigned", project: updatedProject });
  } catch (error) {
    console.error("Error assigning developers:", error);
    res.status(500).json({ error: "Failed to assign developers" });
  }
};


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
