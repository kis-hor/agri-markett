const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Shop = require('../model/shop');
const Product = require('../model/product');

const dbUrl = process.env.MONGO_URL_TEST || 'mongodb://127.0.0.1:27017/testdb';

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
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
  await Shop.deleteMany({});
  await Product.deleteMany({});
});

describe('Product Creation', () => {
  it('should allow a seller to create a product', async () => {
    // 1. Create a shop (seller)
    const shop = await Shop.create({
      name: 'Test Shop',
      email: 'shop@example.com',
      password: 'testpass',
      address: '123 Main St',
      phoneNumber: 1234567890,
      profilePhoto: { public_id: 'test', url: 'http://test.com/profile.jpg' },
      citizenshipPhoto: { public_id: 'test', url: 'http://test.com/citizen.jpg' },
      zipCode: 12345
    });

    // 2. Prepare product data
    const productData = {
      name: 'Test Product',
      description: 'A product for testing',
      category: 'Test Category',
      tags: 'test,product',
      originalPrice: 100,
      discountPrice: 80,
      stock: 10,
      shopId: shop._id.toString(),
      images: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' // mock base64
      ]
    };

    // 3. Create product
    const res = await request(app)
      .post('/api/v2/product/create-product')
      .send(productData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe(productData.name);

    // 4. Check product in DB
    const product = await Product.findOne({ name: productData.name });
    expect(product).not.toBeNull();
    expect(product.shopId).toBe(shop._id.toString());
  });

  it('should not create a product with missing required fields', async () => {
    // Create a shop for valid shopId
    const shop = await Shop.create({
      name: 'Test Shop',
      email: 'shop2@example.com',
      password: 'testpass',
      address: '123 Main St',
      phoneNumber: 1234567890,
      profilePhoto: { public_id: 'test', url: 'http://test.com/profile.jpg' },
      citizenshipPhoto: { public_id: 'test', url: 'http://test.com/citizen.jpg' },
      zipCode: 12345
    });

    // Missing name and discountPrice
    const incompleteProduct = {
      description: 'Missing name and price',
      category: 'Test Category',
      stock: 10,
      shopId: shop._id.toString(),
      images: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
      ]
    };

    const res = await request(app)
      .post('/api/v2/product/create-product')
      .send(incompleteProduct);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a product with an invalid shopId', async () => {
    const productData = {
      name: 'Invalid Shop Product',
      description: 'A product with invalid shopId',
      category: 'Test Category',
      tags: 'test,product',
      originalPrice: 100,
      discountPrice: 80,
      stock: 10,
      shopId: new mongoose.Types.ObjectId().toString(), // random, not in DB
      images: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
      ]
    };

    const res = await request(app)
      .post('/api/v2/product/create-product')
      .send(productData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/shop id is invalid/i);
  });
}); 