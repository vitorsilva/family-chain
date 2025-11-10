  import { expect } from 'chai';
  import { exportUserData, anonymizeUserData } from '../../scripts/week4/db/gdpr.js';
  import { createSecureMember, getSecureMember } from '../../scripts/week4/db/secure-members.js';
  import { pool, adminPool }  from '../../scripts/week4/db/connection.js';

  describe('GDPR Compliance', function () {
    // Increase timeout for database operations
    this.timeout(10000);

    let testUserId: number;

    // Setup: Create a test user before tests
    before(async function () {
      const testUser = await createSecureMember(
        'GDPR Test User',
        'gdpr.test@familychain.local',
        '0x1234567890abcdef1234567890abcdef12345678',
        'parent',
        'PT50999988887777666655544',
        '111222333'
      );
      testUserId = testUser.id;
    });

    // Teardown: Clean up test data after all tests
    after(async function () {
      // Delete test user (even if anonymized)
      await adminPool.query('DELETE FROM family_members WHERE id = $1', [testUserId]);
      // Don't close pool - let transactions.test.ts handle it (runs last alphabetically)
    });

    describe('exportUserData()', function () {
      it('should export all user data in JSON format', async function () {
        const exportedData = await exportUserData(testUserId);

        // Verify export structure
        expect(exportedData).to.have.property('exportedAt');
        expect(exportedData).to.have.property('profile');
        expect(exportedData).to.have.property('accounts');
        expect(exportedData).to.have.property('transactions');
        expect(exportedData).to.have.property('auditLogs');
        expect(exportedData).to.have.property('notice');
        expect(exportedData).to.have.property('gdprCompliance');
      });

      it('should include profile with decrypted sensitive data', async function () {
        const exportedData = await exportUserData(testUserId);

        expect(exportedData.profile).to.not.be.null;
        expect(exportedData.profile?.name).to.equal('GDPR Test User');
        expect(exportedData.profile?.email).to.equal('gdpr.test@familychain.local');
        expect(exportedData.profile?.iban).to.equal('PT50999988887777666655544');
        expect(exportedData.profile?.nif).to.equal('111222333');
      });

      it('should include GDPR compliance metadata', async function () {
        const exportedData = await exportUserData(testUserId);

        expect(exportedData.gdprCompliance).to.have.property('rightExercised');
        expect(exportedData.gdprCompliance.rightExercised).to.include('Right to Data Portability');
        expect(exportedData.gdprCompliance).to.have.property('dataController');
        expect(exportedData.gdprCompliance).to.have.property('contact');
      });

      it('should include accounts array (even if empty)', async function () {
        const exportedData = await exportUserData(testUserId);

        expect(exportedData.accounts).to.be.an('array');
      });

      it('should include transactions array (even if empty)', async function () {
        const exportedData = await exportUserData(testUserId);

        expect(exportedData.transactions).to.be.an('array');
      });

      it('should throw error for non-existent user', async function () {
        const nonExistentId = 999999;

        try {
          await exportUserData(nonExistentId);
          expect.fail('Should have thrown error');
        } catch (err) {
          expect(err).to.be.an('error');
          expect((err as Error).message).to.include('not found');
        }
      });
    });

    describe('anonymizeUserData()', function () {
      let anonymizedUserId: number;

      // Create a separate user for anonymization tests
      beforeEach(async function () {
        const user = await createSecureMember(
          'User To Anonymize',
          'anonymize.test@familychain.local',
          '0xabcdef1234567890abcdef1234567890abcdef12',
          'child',
          'PT50111122223333444455566',
          '999888777'
        );
        anonymizedUserId = user.id;
      });

      afterEach(async function () {
        // Clean up anonymized user
        await adminPool.query('DELETE FROM family_members WHERE id = $1', [anonymizedUserId]);
      });

      it('should anonymize user profile', async function () {
        const result = await anonymizeUserData(anonymizedUserId);

        expect(result.success).to.be.true;
        expect(result.details.profileAnonymized).to.be.true;
        expect(result.originalName).to.equal('User To Anonymize');
      });

      it('should replace PII with anonymized values', async function () {
        await anonymizeUserData(anonymizedUserId);

        // Verify in database
        const member = await getSecureMember(anonymizedUserId);

        expect(member).to.not.be.null;
        expect(member?.name).to.equal(`Deleted User ${anonymizedUserId}`);
        expect(member?.email).to.equal(`deleted_${anonymizedUserId}@familychain.local`);
        expect(member?.wallet_address).to.be.null;
        expect(member?.iban).to.be.null;
        expect(member?.nif).to.be.null;
      });

      it('should delete audit logs', async function () {
        const result = await anonymizeUserData(anonymizedUserId);

        expect(result.details.auditLogsDeleted).to.be.a('number');
      });

      it('should preserve financial transactions', async function () {
        const result = await anonymizeUserData(anonymizedUserId);

        expect(result.details.transactionsPreserved).to.be.true;
        expect(result.details.reason).to.include('legal compliance');
      });

      it('should include GDPR compliance metadata', async function () {
        const result = await anonymizeUserData(anonymizedUserId);

        expect(result.gdprCompliance).to.have.property('rightExercised');
        expect(result.gdprCompliance.rightExercised).to.include('Right to Erasure');
        expect(result.gdprCompliance).to.have.property('method');
        expect(result.gdprCompliance.method).to.include('Anonymization');
      });

      it('should throw error for non-existent user', async function () {
        const nonExistentId = 999999;

        try {
          await anonymizeUserData(nonExistentId);
          expect.fail('Should have thrown error');
        } catch (err) {
          expect(err).to.be.an('error');
          expect((err as Error).message).to.include('not found');
        }
      });

      it('should be idempotent (can anonymize already anonymized user)', async function () {
        // Anonymize once
        await anonymizeUserData(anonymizedUserId);

        // Anonymize again (should not throw error)
        const result = await anonymizeUserData(anonymizedUserId);

        expect(result.success).to.be.true;
      });
    });

    describe('Data Export After Anonymization', function () {
      let userId: number;

      beforeEach(async function () {
        const user = await createSecureMember(
          'Export After Anonymize Test',
          'export.after.anonymize@familychain.local',
          '0x9999999999999999999999999999999999999999',
          'parent',
          'PT50777766665555444433322',
          '555666777'
        );
        userId = user.id;
      });

      afterEach(async function () {
        await adminPool.query('DELETE FROM family_members WHERE id = $1', [userId]);
      });

      it('should export anonymized data (not original PII)', async function () {
        // First anonymize
        await anonymizeUserData(userId);

        // Then export
        const exportedData = await exportUserData(userId);

        // Verify exported data is anonymized
        expect(exportedData.profile?.name).to.equal(`Deleted User ${userId}`);
        expect(exportedData.profile?.email).to.equal(`deleted_${userId}@familychain.local`);
        expect(exportedData.profile?.wallet_address).to.be.null;
        expect(exportedData.profile?.iban).to.be.null;
        expect(exportedData.profile?.nif).to.be.null;
      });
    });
  });