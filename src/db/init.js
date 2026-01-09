const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const config = require('../config');

async function initializeDatabase() {
  const client = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: 'postgres', // Connect to default postgres database first
    ssl: config.db.ssl
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();

    // Create database if it doesn't exist
    console.log(`Creating database '${config.db.name}' if it doesn't exist...`);
    await client.query(`CREATE DATABASE "${config.db.name}"`);

    console.log('Database created successfully!');
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`Database '${config.db.name}' already exists.`);
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }

  // Now connect to the specific database and run schema
  const dbClient = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    ssl: config.db.ssl
  });

  try {
    console.log(`Connecting to database '${config.db.name}'...`);
    await dbClient.connect();

    console.log('Running database schema...');
    const schemaPath = path.join(__dirname, 'init.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await dbClient.query(schema);

    console.log('Database schema initialized successfully!');
  } finally {
    await dbClient.end();
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
