require('dotenv').config({ path: '../config/.env' });

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../model/user');
const Conversation = require('../model/conversation');
const Message = require('../model/message');

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
  await Conversation.deleteMany({});
  await Message.deleteMany({});
});

describe('Chat/Message API', () => {
  let user1, user2, conversation;

  beforeEach(async () => {
    user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      password: 'password1',
      number: 1111111111,
      avatar: { public_id: '1', url: 'url1' }
    });
    user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'password2',
      number: 2222222222,
      avatar: { public_id: '2', url: 'url2' }
    });
    conversation = await Conversation.create({
      members: [user1._id, user2._id]
    });
  });

  it('should send a message in a conversation', async () => {
    const messageData = {
      sender: user1._id.toString(),
      text: 'Hello, this is a test message!',
      conversationId: conversation._id.toString(),
      receiverId: user2._id.toString()
    };

    const res = await request(app)
      .post('/api/v2/message/create-new-message')
      .send(messageData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message.text).toBe(messageData.text);
    expect(res.body.message.images).toBeUndefined();

    // Check that the message is in the database
    const msg = await Message.findOne({ conversationId: conversation._id });
    expect(msg).not.toBeNull();
    expect(msg.text).toBe(messageData.text);
  });

  it('should send a message with images', async () => {
    const messageData = {
      sender: user1._id.toString(),
      text: 'Hello, this is a test message with images!',
      conversationId: conversation._id.toString(),
      images: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA', // mock base64 image
        'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUB' // mock base64 image
      ]
    };

    const res = await request(app)
      .post('/api/v2/message/create-new-message')
      .send(messageData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message.text).toBe(messageData.text);
    expect(Array.isArray(res.body.message.images)).toBe(true);
    expect(res.body.message.images.length).toBe(2);
    expect(res.body.message.images[0]).toHaveProperty('public_id');
    expect(res.body.message.images[0]).toHaveProperty('url');
  });

  it('should handle invalid conversation ID', async () => {
    const messageData = {
      sender: user1._id.toString(),
      text: 'Hello, this is a test message!',
      conversationId: 'invalid_id',
      images: []
    };

    const res = await request(app)
      .post('/api/v2/message/create-new-message')
      .send(messageData);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
}); 