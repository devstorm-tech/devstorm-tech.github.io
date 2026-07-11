const test = require('node:test');
const assert = require('node:assert/strict');

test('Database connection options include retryWrites: false', async () => {
  // Read the database.js file and verify it contains retryWrites: false
  const fs = require('fs');
  const path = require('path');
  
  const dbPath = path.join(__dirname, '..', 'config', 'database.js');
  const dbContent = fs.readFileSync(dbPath, 'utf-8');

  // Check that retryWrites is set to false in options
  assert.ok(
    dbContent.includes('retryWrites: false'),
    'database.js should contain "retryWrites: false" in connection options'
  );

  // Check that event listeners are present
  assert.ok(
    dbContent.includes("mongoose.connection.on('connected'"),
    'database.js should have a "connected" event listener'
  );

  assert.ok(
    dbContent.includes("mongoose.connection.on('disconnected'"),
    'database.js should have a "disconnected" event listener'
  );

  assert.ok(
    dbContent.includes("mongoose.connection.on('error'"),
    'database.js should have an "error" event listener'
  );

  assert.ok(
    dbContent.includes("mongoose.connection.on('reconnected'"),
    'database.js should have a "reconnected" event listener'
  );

  console.log('✅ All database connection configuration checks passed');
});

test('.env file includes retryWrites=false in MongoDB URI', async () => {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  assert.ok(
    envContent.includes('retryWrites=false'),
    '.env should include "retryWrites=false" in MONGODB_URI'
  );

  console.log('✅ .env file correctly configured with retryWrites=false');
});
