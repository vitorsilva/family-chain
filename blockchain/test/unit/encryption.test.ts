  import { expect } from 'chai';
  import { encrypt, decrypt, hash, generateKey } from  '../../scripts/week4/encrypt/utils/encryption.js';

  describe('Encryption Utility', function () {

    describe('encrypt() and decrypt()', function () {

      it('should encrypt and decrypt IBAN correctly', function () {
        const iban = 'PT50123456789012345678901';

        const encrypted = encrypt(iban);
        const decrypted = decrypt(encrypted);

        expect(encrypted).to.not.be.null;
        expect(encrypted).to.not.equal(iban); // Encrypted should be different
        expect(decrypted).to.equal(iban);      // Decrypted should match original       
      });

      it('should encrypt and decrypt NIF correctly', function () {
        const nif = '123456789';

        const encrypted = encrypt(nif);
        const decrypted = decrypt(encrypted);

        expect(encrypted).to.not.be.null;
        expect(decrypted).to.equal(nif);
      });

      it('should produce different ciphertext for same plaintext (random IV)',
  function () {
        const data = 'same data';

        const encrypted1 = encrypt(data);
        const encrypted2 = encrypt(data);

        // Different ciphertext
        expect(encrypted1).to.not.equal(encrypted2);

        // But both decrypt to same value
        expect(decrypt(encrypted1)).to.equal(data);
        expect(decrypt(encrypted2)).to.equal(data);
      });

      it('should handle null values', function () {
        expect(encrypt(null)).to.be.null;
        expect(encrypt(undefined)).to.be.null;
        expect(decrypt(null)).to.be.null;
        expect(decrypt(undefined)).to.be.null;
      });

      it('should handle empty strings', function () {
        const encrypted = encrypt('');
        const decrypted = decrypt(encrypted);

        expect(decrypted).to.equal('');
      });

      it('should detect tampering (GCM authentication)', function () {
        const original = encrypt('Send 100 ETH');

        // Tamper with the encrypted data
        const tampered = original!.substring(0, original!.length - 5) + 'xxxxx';        

        // Should throw error when decrypting tampered data
        expect(() => decrypt(tampered)).to.throw(/Decryption failed/);
      });

      it('should encrypt different data types', function () {
        const testCases = [
          'PT50123456789012345678901',  // IBAN
          '123456789',                   // NIF
          'user@example.com',            // Email
          'A very long string with special characters: !@#$%^&*()',
          '€100.50',                     // Currency symbol
        ];

        testCases.forEach(testCase => {
          const encrypted = encrypt(testCase);
          const decrypted = decrypt(encrypted);
          expect(decrypted).to.equal(testCase, `Failed for: ${testCase}`);
        });
      });
    });

    describe('hash()', function () {

      it('should produce consistent hash for same input', function () {
        const password = 'MySecurePassword123!';

        const hash1 = hash(password);
        const hash2 = hash(password);

        expect(hash1).to.equal(hash2);
        expect(hash1).to.have.length(64); // SHA-256 produces 64 hex characters
      });

      it('should produce different hashes for different inputs', function () {
        const hash1 = hash('password1');
        const hash2 = hash('password2');

        expect(hash1).to.not.equal(hash2);
      });

      it('should be irreversible (one-way)', function () {
        const password = 'MyPassword';
        const hashed = hash(password);

        // There's no unhash() function - hashing is one-way
        // We just verify the hash is deterministic
        expect(hash(password)).to.equal(hashed);
      });

      it('should handle empty string', function () {
        const hashed = hash('');
        expect(hashed).to.have.length(64);
      });
    });

    describe('generateKey()', function () {

      it('should generate valid 256-bit key (64 hex characters)', function () {
        const key = generateKey();

        expect(key).to.have.length(64);
        expect(key).to.match(/^[0-9a-f]{64}$/); // Valid hex string
      });

      it('should generate different keys each time', function () {
        const key1 = generateKey();
        const key2 = generateKey();

        expect(key1).to.not.equal(key2);
      });

      it('should generate keys that work for encryption', function () {
        // Note: This test doesn't actually change the ENCRYPTION_KEY,
        // it just verifies the format is correct for a key
        const key = generateKey();

        // Verify it's a valid hex string that could be used as a key
        const keyBuffer = Buffer.from(key, 'hex');
        expect(keyBuffer.length).to.equal(32); // 32 bytes = 256 bits
      });
    });

    describe('Edge Cases', function () {

      it('should handle very long strings', function () {
        const longString = 'A'.repeat(10000);

        const encrypted = encrypt(longString);
        const decrypted = decrypt(encrypted);

        expect(decrypted).to.equal(longString);
      });

      it('should handle unicode characters', function () {
        const unicode = '你好世界 🌍 Привет мир';

        const encrypted = encrypt(unicode);
        const decrypted = decrypt(encrypted);

        expect(decrypted).to.equal(unicode);
      });

      it('should handle newlines and special characters', function () {
        const multiline = 'Line 1\nLine 2\tTabbed\r\nWindows line ending';

        const encrypted = encrypt(multiline);
        const decrypted = decrypt(encrypted);

        expect(decrypted).to.equal(multiline);
      });
    });
  });