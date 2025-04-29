require('dotenv').config({ path: '../config/.env' });

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../model/user');

const dbUrl = process.env.MONGO_URL_TEST || process.env.DB_URL || 'mongodb://127.0.0.1:27017/testdb';

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  while (!mongoose.connection.db) {
    await new Promise(res => setTimeout(res, 100));
  }
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Registration and Login', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'testpass',
    number: 1234567890,
    avatar: {
      public_id: "test_public_id",
      url: "http://test-avatar-url.com/avatar.png"
    }
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v2/user/create-user')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/activate/i);
  });

  it('should not activate a user with the same email twice', async () => {
    // 1. Register user and get activation token
    const res1 = await request(app)
      .post('/api/v2/user/create-user')
      .send(testUser);
    expect(res1.statusCode).toBe(201);

    // 2. Extract activation token from the backend (simulate what the backend does)
    const jwt = require('jsonwebtoken');
    const activationToken = jwt.sign(testUser, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });

    // 3. Activate user
    const res2 = await request(app)
      .post('/api/v2/user/activation')
      .send({ activation_token: activationToken });
    expect(res2.statusCode).toBe(201);

    // 4. Try to activate again with the same token (should fail)
    const res3 = await request(app)
      .post('/api/v2/user/activation')
      .send({ activation_token: activationToken });
    expect(res3.statusCode).toBe(400);
    expect(res3.body.message).toMatch(/already exists/i);
  });

  it('should not login before activation', async () => {
    await request(app).post('/api/v2/user/create-user').send(testUser);
    const res = await request(app)
      .post('/api/v2/user/login-user')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(400);
  });

  it('should not login with invalid email', async () => {
    // Register and activate user
    const jwt = require('jsonwebtoken');
    await request(app).post('/api/v2/user/create-user').send(testUser);
    const activationToken = jwt.sign(testUser, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    await request(app).post('/api/v2/user/activation').send({ activation_token: activationToken });

    // Try to login with wrong email
    const res = await request(app)
      .post('/api/v2/user/login-user')
      .send({ email: 'wrongemail@example.com', password: testUser.password });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/doesn't exists/i);
  });

  it('should not login with invalid password', async () => {
    // Register and activate user
    const jwt = require('jsonwebtoken');
    await request(app).post('/api/v2/user/create-user').send(testUser);
    const activationToken = jwt.sign(testUser, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    await request(app).post('/api/v2/user/activation').send({ activation_token: activationToken });

    // Try to login with wrong password
    const res = await request(app)
      .post('/api/v2/user/login-user')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/correct information/i);
  });

  // You can add activation and login test if you mock activation token logic
}); 