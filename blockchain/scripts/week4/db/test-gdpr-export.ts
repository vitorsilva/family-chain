  import { exportUserData } from '../db/gdpr.js';
  import { pool } from '../db/connection.js';

  async function testGDPRExport() {
    try {
      // Get first user ID
      const result = await pool.query('SELECT id, name FROM family_members LIMIT 1');   

      if (result.rows.length === 0) {
        console.log('❌ No users found');
        return;
      }

      const userId = result.rows[0].id;
      const userName = result.rows[0].name;

      console.log(`📤 Exporting GDPR data for: ${userName} (ID: ${userId})\n`);

      const exportedData = await exportUserData(userId);

      console.log('✅ GDPR Export Complete!\n');
      console.log(JSON.stringify(exportedData, null, 2));

    } catch (err) {
      console.error('❌ Error:', err);
    } finally {
      await pool.end();
    }
  }

  testGDPRExport();