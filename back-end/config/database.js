const mongoose = require('mongoose');

const maskUri = (uri) => {
  if (!uri) return 'undefined';

  try {
    const parsed = new URL(uri);
    const auth = parsed.username ? `${parsed.username}:***@` : '';
    return `${parsed.protocol}//${auth}${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return uri.replace(/\/\/([^:@]+):([^@]+)@/, '//***:***@');
  }
};

/**
 * Connect to MongoDB using direct, standalone-friendly options.
 * This prevents standalone deployments from failing on retryable-writes errors.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('Connecting to URI:', uri);

  if (!uri) {
    throw new Error('No MongoDB URI found. Set MONGO_URI or MONGODB_URI.');
  }

  const mongooseOptions = {
    retryWrites: false,
    directConnection: true,
    writeConcern: { w: 1 },
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
  };

  mongoose.connection.on('connected', () => {
    console.log('✅ [DATABASE] Mongoose connected');
    console.log(`📍 [DATABASE] URI: ${maskUri(uri)}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  [DATABASE] Mongoose disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ [DATABASE] Mongoose connection error:', error);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [DATABASE] Mongoose reconnected');
  });

  process.on('SIGINT', async () => {
    console.log('\n📴 [DATABASE] SIGINT received, closing connection...');
    await mongoose.connection.close();
    process.exit(0);
  });

  try {
    await mongoose.connect(uri, mongooseOptions);
  } catch (error) {
    console.error('❌ [DATABASE] Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;