  // File: scripts/db-test.js
  import pg from 'pg';
  import dotenv from 'dotenv';

  dotenv.config();

  const { Pool } = pg;

  // Create a connection pool
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'familychain',
    password: process.env.DB_PASSWORD, //'postgres',  // Replace with your postgres password
    port: 5432,
  });

    async function testConnection() {
    try {
      // Test the connection
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully!');
      console.log('Current time from database:', result.rows[0].now);

      // Query family members
      const members = await pool.query('SELECT name, role FROM family_members');      
      console.log('\n📋 Family Members:');
      members.rows.forEach(member => {
        console.log(`  - ${member.name} (${member.role})`);
      });

      // Close the pool
      await pool.end();
    } catch (err) {
      console.error('❌ Database connection error:', err instanceof Error ?
  err.message : 'Unknown error');
      process.exit(1);
    }
  }

    // Run the test 
    testConnection();