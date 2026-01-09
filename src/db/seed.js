const bcrypt = require('bcrypt');
const { pool } = require('./index');
const config = require('../config');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Hash password for demo user
    const saltRounds = 12;
    const demoPassword = 'DemoPass123!';
    const hashedPassword = await bcrypt.hash(demoPassword, saltRounds);

    // Insert demo user
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, email_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['demo@example.com', hashedPassword, 'Demo', 'User', true]);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      // Create user profile
      await pool.query(`
        INSERT INTO user_profiles (user_id, bio, phone, preferences)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        userId,
        'This is a demo user account for testing purposes.',
        '+1-555-0123',
        JSON.stringify({
          theme: 'light',
          notifications: true,
          language: 'en'
        })
      ]);

      console.log('Demo user created successfully!');
      console.log('Email: demo@example.com');
      console.log('Password: DemoPass123!');
    } else {
      console.log('Demo user already exists.');
    }

    // Insert additional test users
    const testUsers = [
      { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', phone: '+1-555-0124' },
      { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', phone: '+1-555-0125' },
      { email: 'admin@example.com', firstName: 'Admin', lastName: 'User', phone: '+1-555-0126' }
    ];

    for (const testUser of testUsers) {
      const testPassword = await bcrypt.hash('TestPass123!', saltRounds);

      const testUserResult = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, email_verified)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [testUser.email, testPassword, testUser.firstName, testUser.lastName, true]);

      if (testUserResult.rows.length > 0) {
        const testUserId = testUserResult.rows[0].id;

        await pool.query(`
          INSERT INTO user_profiles (user_id, phone)
          VALUES ($1, $2)
          ON CONFLICT (user_id) DO NOTHING
        `, [testUserId, testUser.phone]);

        console.log(`Test user ${testUser.email} created successfully!`);
      }
    }

    console.log('Database seeding completed successfully!');
    console.log('\nDemo credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: DemoPass123!');
    console.log('\nTest user credentials (all use password: TestPass123!):');
    console.log('john.doe@example.com');
    console.log('jane.smith@example.com');
    console.log('admin@example.com');

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');

    // Delete all refresh tokens
    await pool.query('DELETE FROM refresh_tokens');

    // Delete all user profiles
    await pool.query('DELETE FROM user_profiles');

    // Delete all users (except keep the demo user for reference)
    await pool.query("DELETE FROM users WHERE email != 'demo@example.com'");

    console.log('Database cleaned successfully!');
  } catch (error) {
    console.error('Database cleaning failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const command = process.argv[2];

  if (command === 'clean') {
    cleanDatabase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    seedDatabase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

module.exports = { seedDatabase, cleanDatabase };
