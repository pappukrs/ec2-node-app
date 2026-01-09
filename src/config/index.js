const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASS',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV',
  'PORT',
  'CORS_ORIGIN'
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

const config = {
  // Database
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: '15m',
    refreshExpiry: '7d'
  },

  // Server
  server: {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    isProduction: process.env.NODE_ENV === 'production'
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;
