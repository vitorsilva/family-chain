  import { encrypt, decrypt, hash } from './encryption.js';

  function testEncryption() {
    console.log('=== Testing Encryption Utility ===\n');

    // Test 1: IBAN Encryption
    console.log('📋 Test 1: IBAN Encryption');
    const iban = 'PT50123456789012345678901';
    console.log('Original IBAN:', iban);

    const encryptedIban = encrypt(iban);
    console.log('Encrypted IBAN:', encryptedIban);
    console.log('Length:', encryptedIban?.length, 'characters');

    const decryptedIban = decrypt(encryptedIban);
    console.log('Decrypted IBAN:', decryptedIban);
    console.log('Match:', iban === decryptedIban ? '✅' : '❌');

    // Test 2: NIF Encryption
    console.log('\n📋 Test 2: NIF Encryption');
    const nif = '123456789';
    console.log('Original NIF:', nif);

    const encryptedNif = encrypt(nif);
    console.log('Encrypted NIF:', encryptedNif);

    const decryptedNif = decrypt(encryptedNif);
    console.log('Decrypted NIF:', decryptedNif);
    console.log('Match:', nif === decryptedNif ? '✅' : '❌');

    // Test 3: Hashing (one-way)
    console.log('\n🔐 Test 3: Hashing');
    const password = 'MySecurePassword123!';
    console.log('Password:', password);

    const hashed = hash(password);
    console.log('Hashed:', hashed);
    console.log('Hash length:', hashed.length, 'characters');
    console.log('Same input = same hash:', hash(password) === hashed ? '✅' : '❌');    
    console.log('Cannot reverse:', '(hashing is one-way - cannot get password back)');

    // Test 4: Random IV (security test)
    console.log('\n🎲 Test 4: Random IV (Same Plaintext, Different Ciphertext)');       
    const data = 'same data';
    const enc1 = encrypt(data);
    const enc2 = encrypt(data);

    console.log('Plaintext:', data);
    console.log('Encrypted #1:', enc1);
    console.log('Encrypted #2:', enc2);
    console.log('Ciphertexts different:', enc1 !== enc2 ? '✅' : '❌');
    console.log('Both decrypt correctly:', decrypt(enc1) === decrypt(enc2) &&
  decrypt(enc1) === data ? '✅' : '❌');

    // Test 5: Null handling
    console.log('\n⚠️  Test 5: Null Handling');
    const encryptedNull = encrypt(null);
    console.log('encrypt(null):', encryptedNull);
    console.log('Returns null:', encryptedNull === null ? '✅' : '❌');

    const decryptedNull = decrypt(null);
    console.log('decrypt(null):', decryptedNull);
    console.log('Returns null:', decryptedNull === null ? '✅' : '❌');

    // Test 6: Tampering detection
    console.log('\n🚨 Test 6: Tampering Detection');
    const original = encrypt('Send 100 ETH');
    console.log('Original encrypted:', original);

    // Simulate tampering
    const tampered = original!.substring(0, original!.length - 5) + 'xxxxx';
    console.log('Tampered version:', tampered);

    try {
      decrypt(tampered);
      console.log('Tampering detected: ❌ FAILED - should have thrown error!');
    } catch (err) {
      console.log('Tampering detected: ✅ (threw error as expected)');
      console.log('Error message:', err instanceof Error ? err.message : 'Unknown error');
    }

    console.log('\n✅ All tests complete!');
  }

  testEncryption();