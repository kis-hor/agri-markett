require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URL_TEST: process.env.MONGO_URL_TEST || 'mongodb://127.0.0.1:27017/testdb',
  JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'test-key',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'test-secret',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.test.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || 'test@test.com',
  SMTP_PASS: process.env.SMTP_PASS || 'test-password',
  SMTP_FROM: process.env.SMTP_FROM || 'test@test.com',
}; 