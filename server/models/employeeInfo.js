import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    maxlength: 50,
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'suspended'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;
