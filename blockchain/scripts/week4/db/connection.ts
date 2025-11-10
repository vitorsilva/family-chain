   import { Pool } from 'pg';
  import dotenv from 'dotenv';

  dotenv.config();

  // Create connection pool
  export const pool = new Pool({
    user: process.env.DB_USER || 'api_service',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'familychain',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 20,                    // Maximum pool size
    idleTimeoutMillis: 30000,   // Close idle clients after 30s
    connectionTimeoutMillis: 2000, // Fail fast if can't connect
  });

  // Admin pool (migration_service - for schema changes)
  export const adminPool = new Pool({
    user: process.env.DB_ADMIN_USER || 'migration_service',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'familychain',
    password: process.env.DB_ADMIN_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 5,  // Fewer connections for admin tasks
  });

  // Read-only pool (analytics_service - for reports)
  export const readonlyPool = new Pool({
    user: process.env.DB_READONLY_USER || 'analytics_service',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'familychain',
    password: process.env.DB_READONLY_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 10,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client (api_service):', err);
  });

  adminPool.on('error', (err) => {
    console.error('Unexpected error on idle client (admin):', err);
  });

  readonlyPool.on('error', (err) => {
    console.error('Unexpected error on idle client (readonly):', err);
  });

  // Export query function for convenience
  export const query = (text: string, params?: any[]) => pool.query(text, params);    

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing pools...');
    await pool.end();
    await adminPool.end();
    await readonlyPool.end();
    process.exit(0);
  });

  console.log('✅ PostgreSQL connected');