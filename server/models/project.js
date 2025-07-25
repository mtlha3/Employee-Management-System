import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
    unique: true,
    maxlength: 5,
  },
  project_name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  project_manager_id: {
    type: String,
    required: true,
  },
  project_manager_name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  team_lead: {
    employee_id: String,
    name: String,
    role: String,
  },
  developers: [
    {
      employee_id: String,
      name: String,
      role: String,
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
})

const Project = mongoose.model('Project', projectSchema);
export default Project;