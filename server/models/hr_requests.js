const mongoose = require('mongoose');

const hrRequestSchema = new mongoose.Schema({
  request_id: {
    type: Number,
    unique: true,
    required: true,
  },
  employee_id: {
    type: String,
    required: true,
  },
  request_title: {
    type: String,
    required: true,
  },
  request_query: {
    type: String,
    required: true,
  },
  hr_response: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'resolved', 'rejected'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

hrRequestSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const Counter = mongoose.model('Counter');
  const counter = await Counter.findOneAndUpdate(
    { _id: 'hr_request_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.request_id = counter.seq;
  next();
});

const HRRequest = mongoose.model('HRRequest', hrRequestSchema);

module.exports = HRRequest;
