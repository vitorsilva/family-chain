import { pool }  from './connection.js';
import { encrypt, decrypt } from '../encrypt/utils/encryption.js';

  export interface FamilyMember {
    id: number;
    name: string;
    email: string;
    wallet_address: string | null;
    role: 'parent' | 'child' | 'guardian';
    created_at: Date;
    iban?: string | null;  // Decrypted IBAN (not stored)
    nif?: string | null;   // Decrypted NIF (not stored)
  }

  
  /**
   * Create family member with encrypted sensitive data
   */
  export async function createSecureMember(
    name: string,
    email: string,
    walletAddress: string | null,
    role: 'parent' | 'child' | 'guardian',
    iban?: string | null,
    nif?: string | null
  ): Promise<FamilyMember> {
    // Encrypt sensitive fields BEFORE storing
    const ibanEncrypted = iban ? encrypt(iban) : null;
    const nifEncrypted = nif ? encrypt(nif) : null;

    const result = await pool.query(
      `INSERT INTO family_members (name, email, wallet_address, role, iban_encrypted, nif_encrypted)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, wallet_address, role, created_at`,
      [name, email, walletAddress, role, ibanEncrypted, nifEncrypted]
    );

    return result.rows[0];
  }

  /**
   * Get family member with decrypted sensitive data
   */
  export async function getSecureMember(memberId: number): Promise<FamilyMember | null> {
    const result = await pool.query(
      'SELECT * FROM family_members WHERE id = $1',
      [memberId]
    );

    if (result.rows.length === 0) return null;

    const member = result.rows[0];

    // Decrypt sensitive fields AFTER retrieving
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      wallet_address: member.wallet_address,
      role: member.role,
      created_at: member.created_at,
      iban: member.iban_encrypted ? decrypt(member.iban_encrypted) : null,
      nif: member.nif_encrypted ? decrypt(member.nif_encrypted) : null,
    };
  }  

  /**
   * Get all family members with decrypted data
   */
  export async function getAllSecureMembers(): Promise<FamilyMember[]> {
    const result = await pool.query('SELECT * FROM family_members ORDER BY id');

    return result.rows.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      wallet_address: member.wallet_address,
      role: member.role,
      created_at: member.created_at,
      iban: member.iban_encrypted ? decrypt(member.iban_encrypted) : null,
      nif: member.nif_encrypted ? decrypt(member.nif_encrypted) : null,
    }));
  }  

    /**
   * Update sensitive data (IBAN, NIF)
   */
  export async function updateSensitiveData(
    memberId: number,
    iban?: string | null,
    nif?: string | null
  ): Promise<void> {
    const ibanEncrypted = iban ? encrypt(iban) : null;
    const nifEncrypted = nif ? encrypt(nif) : null;

    await pool.query(
      `UPDATE family_members
       SET iban_encrypted = $1, nif_encrypted = $2
       WHERE id = $3`,
      [ibanEncrypted, nifEncrypted, memberId]
    );
  }