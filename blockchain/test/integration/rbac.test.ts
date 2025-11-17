  import { expect } from 'chai';
  import { pool, adminPool, readonlyPool } from  '../../scripts/week4/db/connection.js';

  describe('Role-Based Access Control (RBAC)', function () {
    this.timeout(10000);

    // Cleanup any leftover test data before all tests
    before(async function () {
      await adminPool.query(`DELETE FROM family_members WHERE email LIKE '%@test.com'`);
    });

    describe('api_service (readwrite role)', function () {
      it('should be able to SELECT data', async function () {
        const result = await pool.query('SELECT COUNT(*) FROM family_members');       
        expect(result.rows).to.have.lengthOf(1);
        expect(result.rows[0].count).to.be.a('string');
      });

      it('should be able to INSERT data', async function () {
        const result = await pool.query(
          `INSERT INTO family_members (name, email, wallet_address, role)
           VALUES ('RBAC Test User', 'rbac.test@test.com',
  '0x0000000000000000000000000000000000000001', 'parent')
           RETURNING id`
        );
        expect(result.rows).to.have.lengthOf(1);
        expect(result.rows[0].id).to.be.a('number');

        // Cleanup
        await pool.query(`DELETE FROM family_members WHERE email =
  'rbac.test@test.com'`);
      });

      it('should be able to UPDATE data', async function () {
        // Create test user
        const insertResult = await pool.query(
          `INSERT INTO family_members (name, email, wallet_address, role)
           VALUES ('Update Test', 'update@test.com',
  '0x0000000000000000000000000000000000000002', 'parent')
           RETURNING id`
        );
        const userId = insertResult.rows[0].id;

        // Update
        const updateResult = await pool.query(
          'UPDATE family_members SET name = $1 WHERE id = $2',
          ['Updated Name', userId]
        );
        expect(updateResult.rowCount).to.equal(1);

        // Cleanup
        await pool.query('DELETE FROM family_members WHERE id = $1', [userId]);       
      });

      it('should be able to DELETE data', async function () {
        // Create test user
        const insertResult = await pool.query(
          `INSERT INTO family_members (name, email, wallet_address, role)
           VALUES ('Delete Test', 'delete@test.com',
  '0x0000000000000000000000000000000000000003', 'parent')
           RETURNING id`
        );
        const userId = insertResult.rows[0].id;

        // Delete
        const deleteResult = await pool.query(
          'DELETE FROM family_members WHERE id = $1',
          [userId]
        );
        expect(deleteResult.rowCount).to.equal(1);
      });

      it('should NOT be able to CREATE TABLE', async function () {
        try {
          await pool.query('CREATE TABLE rbac_test_fail (id SERIAL PRIMARY KEY)');    
          expect.fail('api_service should not be able to create tables');
        } catch (err) {
          expect(err).to.be.an('error');
          expect((err as Error).message).to.include('permission denied');
        }
      });

      it('should NOT be able to DROP TABLE', async function () {
        try {
          await pool.query('DROP TABLE family_members');
          expect.fail('api_service should not be able to drop tables');
        } catch (err) {
          expect(err).to.be.an('error');
          const message = (err as Error).message;
          // Accept either "permission denied" or "must be owner"
          const hasPermissionError = message.includes('permission denied') || message.includes('must be owner');
          expect(hasPermissionError).to.be.true;
        }
      });
    });

    describe('analytics_service (readonly role)', function () {
      it('should be able to SELECT data', async function () {
        const result = await readonlyPool.query('SELECT COUNT(*) FROM family_members');
        expect(result.rows).to.have.lengthOf(1);
        expect(result.rows[0].count).to.be.a('string');
      });

      it('should NOT be able to INSERT data', async function () {
        try {
          await readonlyPool.query(
            `INSERT INTO family_members (name, email, wallet_address, role)
             VALUES ('Should Fail', 'fail@test.com',
  '0x0000000000000000000000000000000000000004', 'parent')`
          );
          expect.fail('analytics_service should not be able to insert');
        } catch (err) {
          expect(err).to.be.an('error');
          expect((err as Error).message).to.include('permission denied');
        }
      });

      it('should NOT be able to UPDATE data', async function () {
        try {
          await readonlyPool.query(
            'UPDATE family_members SET name = $1 WHERE id = 1',
            ['Hacked Name']
          );
          expect.fail('analytics_service should not be able to update');
        } catch (err) {
          expect(err).to.be.an('error');
          expect((err as Error).message).to.include('permission denied');
        }
      });

      it('should NOT be able to DELETE data', async function () {
        try {
          await readonlyPool.query('DELETE FROM family_members WHERE id = 1');        
          expect.fail('analytics_service should not be able to delete');
        } catch (err) {
          expect(err).to.be.an('error');
          expect((err as Error).message).to.include('permission denied');
        }
      });
    });

    describe('migration_service (admin role)', function () {
      it('should be able to CREATE TABLE', async function () {
        await adminPool.query('CREATE TABLE rbac_test_table (id SERIAL PRIMARY KEY, name TEXT)');

        // Verify table exists
        const result = await adminPool.query(
          `SELECT table_name FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'rbac_test_table'`
        );
        expect(result.rows).to.have.lengthOf(1);
      });

      it('should be able to DROP TABLE', async function () {
        await adminPool.query('DROP TABLE rbac_test_table');

        // Verify table is gone
        const result = await adminPool.query(
          `SELECT table_name FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'rbac_test_table'`
        );
        expect(result.rows).to.have.lengthOf(0);
      });

      it('should be able to ALTER TABLE', async function () {
        // Create test table
        await adminPool.query('CREATE TABLE rbac_alter_test (id SERIAL PRIMARY KEY)');

        // Alter table
        await adminPool.query('ALTER TABLE rbac_alter_test ADD COLUMN name TEXT');    

        // Verify column exists
        const result = await adminPool.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_name = 'rbac_alter_test' AND column_name = 'name'`
        );
        expect(result.rows).to.have.lengthOf(1);

        // Cleanup
        await adminPool.query('DROP TABLE rbac_alter_test');
      });

      it('should be able to INSERT, UPDATE, DELETE data', async function () {
        const insertResult = await adminPool.query(
          `INSERT INTO family_members (name, email, wallet_address, role)
           VALUES ('Admin Test', 'admin@test.com',
  '0x0000000000000000000000000000000000000005', 'parent')
           RETURNING id`
        );
        const userId = insertResult.rows[0].id;

        // Update
        await adminPool.query('UPDATE family_members SET name = $1 WHERE id = $2',    
   ['Admin Updated', userId]);

        // Delete
        const deleteResult = await adminPool.query('DELETE FROM family_members WHERE id = $1', [userId]);
        expect(deleteResult.rowCount).to.equal(1);
      });
    });

    // Close pools after all tests
    after(async function () {
      //await pool.end();
      //await adminPool.end();
      //await readonlyPool.end();
    });
  });