  import crypto from 'crypto';
  import dotenv from 'dotenv';

  // Load environment variables
  dotenv.config();

  // Encryption configuration
  const ALGORITHM = 'aes-256-gcm';
  const IV_LENGTH = 16;          // Initialization Vector length
  const KEY_LENGTH = 32;         // 256 bits
  const AUTH_TAG_LENGTH = 16;    // Authentication tag length

  // Load and validate encryption key
  let ENCRYPTION_KEY: Buffer;
  try {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
      throw new Error('ENCRYPTION_KEY not found in environment variables');
    }

    ENCRYPTION_KEY = Buffer.from(keyHex, 'hex');

    if (ENCRYPTION_KEY.length !== KEY_LENGTH) {
      throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
    }
  } catch (err) {
    console.error('❌ ENCRYPTION_KEY not configured properly');
    throw err;
  }

  /**
   * Encrypt plaintext data using AES-256-GCM
   * @param plaintext - Data to encrypt
   * @returns Encrypted data as base64 string (contains IV + authTag + ciphertext)      
   */
  export function encrypt(plaintext: string | null | undefined): string | null {        
    if (!plaintext) return null;

    // Generate random IV for each encryption (security best practice)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher with AES-256-GCM
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag (verifies data wasn't tampered with)
    const authTag = cipher.getAuthTag();

    // Combine: IV + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);

    // Return as base64 for easy storage
    return combined.toString('base64');
  }
  
  /**
   * Decrypt data encrypted with encrypt()
   * @param encryptedData - Encrypted data (base64)
   * @returns Decrypted plaintext
   */
  export function decrypt(encryptedData: string | null | undefined): string | null {    
    if (!encryptedData) return null;

    try {
      // Decode from base64
      const combined = Buffer.from(encryptedData, 'base64');

      // Extract components
      const iv = combined.slice(0, IV_LENGTH);
      const authTag = combined.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
      const encrypted = combined.slice(IV_LENGTH + AUTH_TAG_LENGTH);

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err) {
      throw new Error(`Decryption failed: ${err instanceof Error ? err.message :        
  'Unknown error'}`);
    }
  }
  
  
  /**
   * Hash data using SHA-256 (one-way, for passwords or checksums)
   * @param data - Data to hash
   * @returns SHA-256 hash (hex string)
   */
  export function hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a random encryption key (for setup/key rotation)
   * @returns 32-byte key as hex string (64 characters)
   */
  export function generateKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  }