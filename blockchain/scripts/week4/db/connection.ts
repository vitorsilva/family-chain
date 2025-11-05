  import pg from 'pg';
  import dotenv from 'dotenv';

  dotenv.config();

  const { Pool } = pg;

  // Create connection pool
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'familychain',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
  });

  // Test connection on startup
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err);
  });

  export default pool;