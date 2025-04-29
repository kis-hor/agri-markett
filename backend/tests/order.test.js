const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../model/user');
const Shop = require('../model/shop');
const Product = require('../model/product');
const Order = require('../model/order');

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
  await User.deleteMany({});
  await Shop.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
});

describe('Order API', () => {
  let user, shop, product;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      number: 1234567890,
      avatar: { public_id: '1', url: 'url1' }
    });

    // Create a test shop
    shop = await Shop.create({
      name: 'Test Shop',
      email: 'shop@example.com',
      password: 'password123',
      address: '123 Shop St',
      phoneNumber: 1234567890,
      profilePhoto: { public_id: '1', url: 'url1' },
      citizenshipPhoto: { public_id: '2', url: 'url2' },
      zipCode: 12345
    });

    // Create a test product
    product = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      category: 'Test Category',
      tags: 'test',
      originalPrice: 100,
      discountPrice: 80,
      stock: 10,
      shopId: shop._id.toString(),
      shop: {
        _id: shop._id,
        name: shop.name
      },
      images: [{
        public_id: 'product1',
        url: 'product1_url'
      }]
    });
  });

  it('should create a new order successfully', async () => {
    const orderData = {
      cart: [{
        productId: product._id.toString(),
        quantity: 2,
        shopId: shop._id.toString(),
        name: product.name,
        discountPrice: product.discountPrice,
        images: product.images
      }],
      shippingAddress: {
        address1: '123 Main St',
        address2: 'Apt 4B',
        country: 'Country',
        city: 'City',
        zipCode: '12345'
      },
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email
      },
      totalPrice: 180, // (80 * 2) + 20 shipping
      subTotalPrice: 160, // 80 * 2
      shipping: 20, // 10% of subtotal
      paymentInfo: {
        type: 'eSewa'
      }
    };

    const res = await request(app)
      .post('/api/v2/order/create-order')
      .send(orderData);

    // Log the response for debugging
    console.log('Response:', {
      status: res.status,
      body: res.body,
      error: res.body.error
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].cart).toHaveLength(1);
    expect(res.body.orders[0].totalPrice).toBe(180);
    expect(res.body.orders[0].status).toBe('Processing');
  });

  it('should not create order with invalid product ID', async () => {
    const orderData = {
      cart: [{
        productId: 'invalid_id',
        quantity: 2,
        shopId: shop._id.toString(),
        name: product.name,
        discountPrice: product.discountPrice,
        images: product.images
      }],
      shippingAddress: {
        address1: '123 Main St',
        address2: 'Apt 4B',
        country: 'Country',
        city: 'City',
        zipCode: '12345'
      },
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email
      },
      totalPrice: 180,
      subTotalPrice: 160,
      shipping: 20,
      paymentInfo: {
        type: 'eSewa'
      }
    };

    const res = await request(app)
      .post('/api/v2/order/create-order')
      .send(orderData);

    // Log the response for debugging
    console.log('Response:', {
      status: res.status,
      body: res.body,
      error: res.body.error
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('should create order with multiple products from same shop', async () => {
    // Create another product from the same shop
    const product2 = await Product.create({
      name: 'Test Product 2',
      description: 'Test Description 2',
      category: 'Test Category',
      tags: 'test',
      originalPrice: 200,
      discountPrice: 150,
      stock: 5,
      shopId: shop._id.toString(),
      shop: {
        _id: shop._id,
        name: shop.name
      },
      images: [{
        public_id: 'product2',
        url: 'product2_url'
      }]
    });

    const orderData = {
      cart: [
        {
          productId: product._id.toString(),
          quantity: 2,
          shopId: shop._id.toString(),
          name: product.name,
          discountPrice: product.discountPrice,
          images: product.images
        },
        {
          productId: product2._id.toString(),
          quantity: 1,
          shopId: shop._id.toString(),
          name: product2.name,
          discountPrice: product2.discountPrice,
          images: product2.images
        }
      ],
      shippingAddress: {
        address1: '123 Main St',
        address2: 'Apt 4B',
        country: 'Country',
        city: 'City',
        zipCode: '12345'
      },
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email
      },
      totalPrice: 350, // (80 * 2 + 150 * 1) + 35 shipping
      subTotalPrice: 310, // 80 * 2 + 150 * 1
      shipping: 35, // 10% of subtotal
      paymentInfo: {
        type: 'eSewa'
      }
    };

    const res = await request(app)
      .post('/api/v2/order/create-order')
      .send(orderData);

    // Log the response for debugging
    console.log('Response:', {
      status: res.status,
      body: res.body,
      error: res.body.error
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].cart).toHaveLength(2);
    expect(res.body.orders[0].totalPrice).toBe(350);
  });
}); 