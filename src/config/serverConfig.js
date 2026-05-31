const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  SECRET_KEY: jwtSecret,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};