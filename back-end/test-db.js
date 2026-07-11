require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('Connecting to URI:', uri);

(async () => {
  try {
    await mongoose.connect(uri, {
      retryWrites: false,
      directConnection: true,
      writeConcern: { w: 1 },
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String, createdAt: Date }));
    await TestModel.create({ name: 'smoke-test', createdAt: new Date() });

    console.log('✅ Write Successful');
  } catch (error) {
    console.error('❌ Database write failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
})();
