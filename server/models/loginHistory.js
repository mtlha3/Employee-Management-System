const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true
  },
  login_time: {
    type: Date,
    default: Date.now,
  },
  ip_address: {
    type: String,
    maxlength: 100,
  },
  user_agent: {
    type: String,
  },
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

module.exports = LoginHistory;
