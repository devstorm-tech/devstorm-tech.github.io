const mongoose = require('mongoose');

const EmployeeRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Examples: "CEO", "Back-end Manager", "Front-end Team Leader", "HR Employee"
  },
  department: {
    type: String,
    required: true,
    enum: ['corporate', 'front-end', 'back-end', 'sales', 'hr', 'pr'],
    lowercase: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['ceo', 'manager', 'team_leader', 'employee'],
    lowercase: true,
    trim: true
  },
  tier: {
    type: Number,
    required: true,
    // 0 = CEO, 1 = Manager, 2 = Team Leader, 3 = Employee
    enum: [0, 1, 2, 3]
  },
  permissions: {
    type: [String],
    default: []
    // e.g., ['manage_tasks', 'view_salaries', 'approve_leaves']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmployeeRole', EmployeeRoleSchema);