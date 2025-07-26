import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  task_id: String,
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in progress', 'completed', 'revision'],
    default: 'pending'
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  file: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  submission_comment: {
    type: String,
    default: ''
  },
  submission_file: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  submitted_at: {
    type: Date
  }
});


const developerSchema = new mongoose.Schema({
  employee_id: String,
  name: String,
  role: String,
  tasks: [taskSchema]
});

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
  developers: [developerSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
