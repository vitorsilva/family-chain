import crypto from 'crypto';

  function generateKey(): string {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits
  }

  console.log('🔑 Generated Encryption Key:');
  console.log(generateKey());
  console.log('\n📋 Add this to your .env file:');
  console.log(`ENCRYPTION_KEY=${generateKey()}`);
  console.log('\n⚠️  NEVER commit this key to git!');
  console.log('⚠️  Store it securely - if lost, encrypted data is unrecoverable!');   