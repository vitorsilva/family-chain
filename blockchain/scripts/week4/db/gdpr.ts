  import pool from './connection.js';
  import { getSecureMember } from './secure-members.js';


  /**
   * Export all user data (GDPR Right to Portability)
   */
  export async function exportUserData(memberId: number) {
    try {
      // 1. Get profile (with decrypted sensitive data)
      const profile = await getSecureMember(memberId);
      if (!profile) {
        throw new Error(`Member ${memberId} not found`);
      }

      // 2. Get accounts
      const accountsResult = await pool.query(
        'SELECT * FROM accounts WHERE member_id = $1',
        [memberId]
      );

      // 3. Get transactions
      const transactionsResult = await pool.query(
        `SELECT t.*, le.entry_type, le.balance_before, le.balance_after
         FROM transactions t
         LEFT JOIN ledger_entries le ON t.id = le.transaction_id
         WHERE t.from_account_id IN (SELECT id FROM accounts WHERE member_id = $1)      
            OR t.to_account_id IN (SELECT id FROM accounts WHERE member_id = $1)        
         ORDER BY t.created_at DESC`,
        [memberId]
      );

      // 4. Get audit logs
      const auditLogsResult = await pool.query(
        'SELECT * FROM audit_log WHERE changed_by = $1 ORDER BY created_at DESC',       
        [memberId]
      );

      return {
        exportedAt: new Date().toISOString(),
        profile: profile,
        accounts: accountsResult.rows,
        transactions: transactionsResult.rows,
        auditLogs: auditLogsResult.rows,
        notice: 'This export contains all personal data stored in the FamilyChain system.',
        gdprCompliance: {
          rightExercised: 'Right to Data Portability (GDPR Article 20)',
          dataController: 'FamilyChain',
          contact: 'privacy@familychain.local'
        }
      };
    } catch (err) {
      throw new Error(`Failed to export user data: ${err instanceof Error ?
  err.message : 'Unknown error'}`);
    }
  }  

  
  /**
   * Anonymize user data (GDPR Right to be Forgotten)
   *
   * Note: We preserve financial transactions for legal compliance (7-10 years
  retention)
   * but anonymize the user's identity.
   */
  export async function anonymizeUserData(memberId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Check if user exists
      const checkResult = await client.query(
        'SELECT id, name FROM family_members WHERE id = $1',
        [memberId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error(`Member ${memberId} not found`);
      }

      const originalName = checkResult.rows[0].name;

      // 2. Anonymize profile (keep ID for referential integrity)
      await client.query(
        `UPDATE family_members
         SET name = $1,
             email = $2,
             wallet_address = NULL,
             iban_encrypted = NULL,
             nif_encrypted = NULL
         WHERE id = $3`,
        [`Deleted User ${memberId}`, `deleted_${memberId}@familychain.local`,
  memberId]
      );

      // 3. Delete audit logs (personal activity history)
      const auditDeleteResult = await client.query(
        'DELETE FROM audit_log WHERE changed_by = $1',
        [memberId]
      );

      // 4. Note: Financial transactions are PRESERVED (legal requirement)
      // They remain in the database but are now linked to "Deleted User"
      // This satisfies both GDPR (right to be forgotten) and financial regulations     

      await client.query('COMMIT');

      return {
        success: true,
        memberId: memberId,
        originalName: originalName,
        message: 'User data anonymized successfully',
        details: {
          profileAnonymized: true,
          auditLogsDeleted: auditDeleteResult.rowCount,
          transactionsPreserved: true,
          reason: 'Financial transactions retained for legal compliance (7-10 year requirement)'
        },
        gdprCompliance: {
          rightExercised: 'Right to Erasure/Right to be Forgotten (GDPR Article 17)',
          method: 'Anonymization (preserves data integrity while removing PII)',        
          dataController: 'FamilyChain'
        }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }