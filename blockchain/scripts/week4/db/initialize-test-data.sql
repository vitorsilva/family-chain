 -- ============================================
  -- FamilyChain Test Data Initialization
  -- ============================================
  -- Purpose: Reset database to known state for testing
  -- Usage: psql -U postgres -d familychain -f database/initialize-test-data.sql
  -- ============================================

  \echo '=== Step 1: Clearing transaction data ==='
  TRUNCATE TABLE ledger_entries CASCADE;
  TRUNCATE TABLE transactions CASCADE;
  TRUNCATE TABLE audit_log CASCADE;
  TRUNCATE TABLE blockchain_transactions CASCADE;
  TRUNCATE TABLE exchange_rates CASCADE;

  \echo '=== Step 2: Resetting account balances ==='
  UPDATE accounts SET balance =
      CASE id
          WHEN 1 THEN 10.00  -- Alice: 10 ETH
          WHEN 2 THEN 5.00   -- Bob: 5 ETH
          WHEN 3 THEN 2.00   -- Charlie: 2 ETH
          WHEN 4 THEN 1.00   -- Dana: 1 ETH
          ELSE 0.00
      END;

  \echo '=== Step 3: Creating initial deposit transactions ==='

  -- Account 1: 10 ETH initial deposit
  INSERT INTO transactions (to_account_id, amount, currency, tx_type, status, description,      
  created_at)
  VALUES (1, 10.00, 'ETH', 'initial_deposit', 'confirmed', 'Initial account funding',
  NOW());

  INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount,
  balance_before, balance_after, created_at)
  VALUES (currval('transactions_id_seq'), 1, 'credit', 10.00, 0.00, 10.00, NOW());

  -- Account 2: 5 ETH initial deposit
  INSERT INTO transactions (to_account_id, amount, currency, tx_type, status, description,      
  created_at)
  VALUES (2, 5.00, 'ETH', 'initial_deposit', 'confirmed', 'Initial account funding', NOW());    

  INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount,
  balance_before, balance_after, created_at)
  VALUES (currval('transactions_id_seq'), 2, 'credit', 5.00, 0.00, 5.00, NOW());

  -- Account 3: 2 ETH initial deposit
  INSERT INTO transactions (to_account_id, amount, currency, tx_type, status, description,      
  created_at)
  VALUES (3, 2.00, 'ETH', 'initial_deposit', 'confirmed', 'Initial account funding', NOW());    

  INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount,
  balance_before, balance_after, created_at)
  VALUES (currval('transactions_id_seq'), 3, 'credit', 2.00, 0.00, 2.00, NOW());

  -- Account 4: 1 ETH initial deposit
  INSERT INTO transactions (to_account_id, amount, currency, tx_type, status, description,      
  created_at)
  VALUES (4, 1.00, 'ETH', 'initial_deposit', 'confirmed', 'Initial account funding', NOW());    

  INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount,
  balance_before, balance_after, created_at)
  VALUES (currval('transactions_id_seq'), 4, 'credit', 1.00, 0.00, 1.00, NOW());

  \echo '=== Step 4: Verification ==='
  SELECT
      a.id,
      fm.name,
      a.account_type,
      a.balance AS actual_balance,
      COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE -le.amount END),      
  0) AS calculated_balance,
      CASE
          WHEN ABS(a.balance - COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN
  le.amount ELSE -le.amount END), 0)) < 0.00000001
          THEN '✅ Balanced'
          ELSE '❌ MISMATCH'
      END AS status
  FROM accounts a
  LEFT JOIN family_members fm ON a.member_id = fm.id
  LEFT JOIN ledger_entries le ON a.id = le.account_id
  GROUP BY a.id, fm.name, a.account_type, a.balance
  ORDER BY a.id;

  \echo ''
  \echo '=== Summary ==='
  SELECT
      COUNT(*) AS total_transactions,
      SUM(amount) AS total_initial_funding
  FROM transactions
  WHERE tx_type = 'initial_deposit';

  SELECT
      COUNT(*) AS total_ledger_entries,
      SUM(amount) AS total_credits
  FROM ledger_entries
  WHERE entry_type = 'credit';

  \echo ''
  \echo '✅ Database initialized successfully!'
  \echo 'Initial balances: Account 1 (10 ETH), Account 2 (5 ETH), Account 3 (2 ETH), Account    
   4 (1 ETH)'