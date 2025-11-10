 import { exportUserData, anonymizeUserData } from './gdpr.js';
  import { createSecureMember } from './secure-members.js';
  import fs from 'fs';

  async function testGDPR() {
    try {
      console.log('=== Testing GDPR Compliance Functions ===\n');

      // Create a test user
      console.log('📝 Creating test user for GDPR testing...');
      const testUser = await createSecureMember(
        'GDPR Test User',
        'gdpr.test@familychain.local',
        '0x1234567890abcdef1234567890abcdef12345678',
        'parent',
        'PT50999988887777666655544',
        '111222333'
      );
      console.log(`Created test user: ID ${testUser.id}\n`);

      // Test 1: Export user data (Right to Portability)
      console.log('📦 Test 1: Exporting user data (GDPR Right to Portability)');        
      const exportedData = await exportUserData(testUser.id);

      console.log('Exported data structure:');
      console.log('- Profile:', exportedData.profile ? '✅' : '❌');
      console.log('- Accounts:', Array.isArray(exportedData.accounts) ? '✅' : '❌');
      console.log('- Transactions:', Array.isArray(exportedData.transactions) ? '✅' : '❌');
      console.log('- Audit Logs:', Array.isArray(exportedData.auditLogs) ? '✅' : '❌');
      console.log('- Export timestamp:', exportedData.exportedAt);
      console.log('- GDPR notice:', exportedData.notice ? '✅' : '❌');

      // Save export to file
      const exportFile = `user_${testUser.id}_export.json`;
      fs.writeFileSync(exportFile, JSON.stringify(exportedData, null, 2));
      console.log(`\n💾 Export saved to: ${exportFile}`);

      // Test 2: Anonymize user data (Right to be Forgotten)
      console.log('\n🗑️  Test 2: Anonymizing user data (GDPR Right to be  Forgotten)');
      console.log('⚠️  This will anonymize the test user...');

      const anonymizeResult = await anonymizeUserData(testUser.id);

      console.log('\nAnonymization result:');
      console.log('- Success:', anonymizeResult.success ? '✅' : '❌');
      console.log('- Original name:', anonymizeResult.originalName);
      console.log('- Profile anonymized:', anonymizeResult.details.profileAnonymized    
   ? '✅' : '❌');
      console.log('- Audit logs deleted:', anonymizeResult.details.auditLogsDeleted);
      console.log('- Transactions preserved:', anonymizeResult.details.transactionsPreserved ? '✅' : '❌');
      console.log('- Reason:', anonymizeResult.details.reason);

      // Test 3: Verify anonymization in database
      console.log('\n🔍 Test 3: Verifying anonymization in database');
      try {
        const verifyExport = await exportUserData(testUser.id);
        console.log('Profile after anonymization:');
        console.log('- Name:', verifyExport.profile?.name);
        console.log('- Email:', verifyExport.profile?.email);
        console.log('- Wallet address:', verifyExport.profile?.wallet_address || 'NULL');
        console.log('- IBAN:', verifyExport.profile?.iban || 'NULL');
        console.log('- NIF:', verifyExport.profile?.nif || 'NULL');
        console.log('\nAnonymization verified:', verifyExport.profile?.name?.includes('Deleted User') ? '✅' : '❌');
      } catch (err) {
        console.log('❌ Verification failed:', err);
      }

      console.log('\n✅ GDPR compliance tests complete!');
      console.log(`\n📄 Check the exported file: ${exportFile}`);

      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  }

  testGDPR();