const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EmployeeRole = require('../models/EmployeeRole');

// Load environment variables (adjust path if your .env is in the parent directory)
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const seedEmployeeRoles = async () => {
  try {
    const count = await EmployeeRole.countDocuments();
    if (count > 0) {
      console.log('🌱 [SEEDER] Employee roles already seeded. Skipping...');
      return;
    }

    const defaultRoles = [
      { title: 'CEO', department: 'corporate', level: 'ceo', tier: 0, permissions: ['all'] },
      { title: 'Front-end Manager', department: 'front-end', level: 'manager', tier: 1, permissions: ['manage_department', 'approve_leaves'] },
      { title: 'Front-end Team Leader', department: 'front-end', level: 'team_leader', tier: 2, permissions: ['assign_tasks'] },
      { title: 'Front-end Developer', department: 'front-end', level: 'employee', tier: 3, permissions: ['view_tasks'] },
      { title: 'Back-end Manager', department: 'back-end', level: 'manager', tier: 1, permissions: ['manage_department', 'approve_leaves'] },
      { title: 'Back-end Team Leader', department: 'back-end', level: 'team_leader', tier: 2, permissions: ['assign_tasks'] },
      { title: 'Back-end Developer', department: 'back-end', level: 'employee', tier: 3, permissions: ['view_tasks'] },
      { title: 'Sales Manager', department: 'sales', level: 'manager', tier: 1, permissions: ['manage_department', 'approve_leaves'] },
      { title: 'Sales Team Leader', department: 'sales', level: 'team_leader', tier: 2, permissions: ['assign_tasks'] },
      { title: 'Sales Agent', department: 'sales', level: 'employee', tier: 3, permissions: ['view_tasks'] },
      { title: 'HR Manager', department: 'hr', level: 'manager', tier: 1, permissions: ['manage_department', 'approve_leaves', 'manage_employees'] },
      { title: 'HR Specialist', department: 'hr', level: 'employee', tier: 3, permissions: ['view_tasks'] },
      { title: 'PR Manager', department: 'pr', level: 'manager', tier: 1, permissions: ['manage_department', 'approve_leaves'] },
      { title: 'PR Specialist', department: 'pr', level: 'employee', tier: 3, permissions: ['view_tasks'] }
    ];

    await EmployeeRole.insertMany(defaultRoles);
    console.log(`✅ [SEEDER] Successfully seeded ${defaultRoles.length} employee roles!`);
  } catch (error) {
    console.error('❌ [SEEDER] Error seeding employee roles:', error);
  }
};

module.exports = seedEmployeeRoles;

// --- THIS RUNS THE SEEDER DIRECTLY IF CALLED VIA CLI ---
if (require.main === module) {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devstorm_db';
  
  mongoose.connect(dbUri)
    .then(async () => {
      console.log('🔌 Connected to MongoDB for seeding...');
      await seedEmployeeRoles();
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB. Seeding done!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err);
      process.exit(1);
    });
}