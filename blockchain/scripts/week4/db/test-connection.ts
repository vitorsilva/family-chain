import { pool }  from './connection.js';

  async function testConnection() {
    try {
      console.log('Testing PostgreSQL connection...\n');

      // Test query
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connected!');
      console.log('Current time:', result.rows[0].now);

      // Query family members
      const members = await pool.query('SELECT name, role FROM family_members');
      console.log('\n📋 Family Members:');
      members.rows.forEach((member: any) => {
        console.log(`  - ${member.name} (${member.role})`);
      });

      console.log('\n✅ Connection test passed!');
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  }

  testConnection();