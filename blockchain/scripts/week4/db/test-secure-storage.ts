  import { createSecureMember, getSecureMember, getAllSecureMembers } from
  './secure-members.js';
import { pool }  from './connection.js';


  async function testSecureStorage() {
    try {
      console.log('=== Testing Secure Storage ===\n');

      // Test 1: Create member with encrypted data
      console.log('📝 Test 1: Creating member with encrypted IBAN and NIF');
      const member = await createSecureMember(
        'Elena Test',
        'elena.test@familychain.local',
        '0x9876543210abcdef9876543210abcdef98765432',
        'parent',
        'PT50111122223333444455556',  // IBAN
        '987654321'                    // NIF
      );
      console.log('Created member:', {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role
      });

      // Test 2: Check database - should see encrypted values
      console.log('\n🔍 Test 2: Checking database (should see encrypted values)');      
      const dbResult = await pool.query(
        'SELECT id, name, iban_encrypted, nif_encrypted FROM family_members WHERE id = $1',
        [member.id]
      );
      console.log('Database row:', dbResult.rows[0]);
      console.log('IBAN encrypted length:', dbResult.rows[0].iban_encrypted?.length,    
   'characters');
      console.log('NIF encrypted length:', dbResult.rows[0].nif_encrypted?.length,      
  'characters');

      // Test 3: Retrieve and decrypt
      console.log('\n🔓 Test 3: Retrieving member with decrypted data');
      const retrieved = await getSecureMember(member.id);
      console.log('Retrieved member:', {
        id: retrieved?.id,
        name: retrieved?.name,
        iban: retrieved?.iban,      // Should be decrypted!
        nif: retrieved?.nif          // Should be decrypted!
      });
      console.log('IBAN decrypted correctly:', retrieved?.iban ===
  'PT50111122223333444455556' ? '✅' : '❌');
      console.log('NIF decrypted correctly:', retrieved?.nif === '987654321' ? '✅'     
  : '❌');

      // Test 4: Get all members (test batch decryption)
      console.log('\n📋 Test 4: Getting all members');
      const allMembers = await getAllSecureMembers();
      console.log(`Found ${allMembers.length} members`);
      console.log('Elena in list:', allMembers.some(m => m.name === 'Elena Test') ?
  '✅' : '❌');

      console.log('\n✅ Secure storage test complete!');
      console.log('\n⚠️  Important: Check PostgreSQL - IBAN and NIF should be encrypted (base64 strings)');
      console.log('Run in psql: SELECT id, name, iban_encrypted FROM family_members WHERE name = \'Elena Test\';');

      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  }

  testSecureStorage();  