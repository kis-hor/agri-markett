const { connectDB, clearDB, closeDB } = require('./helpers/test.setup');

// Set environment to test
process.env.NODE_ENV = 'test';

// Global setup
beforeAll(async () => {
  await connectDB();
});

// Clear database before each test
beforeEach(async () => {
  await clearDB();
});

// Global teardown
afterAll(async () => {
  await closeDB();
}); 