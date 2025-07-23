import Project from '../models/Project.js';

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
