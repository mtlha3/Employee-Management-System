import mongoose from 'mongoose';

const hrRequestSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  requestTitle: {
    type: String,
    required: true,
  },
  requestQuery: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

const HrRequest = mongoose.model('HrRequest', hrRequestSchema);
export default HrRequest;
