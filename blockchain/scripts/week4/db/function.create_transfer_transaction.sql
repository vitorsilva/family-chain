  -- Create the stored procedure for double-entry transfers
  CREATE OR REPLACE FUNCTION create_transfer_transaction(
      p_from_account_id INTEGER,
      p_to_account_id INTEGER,
      p_amount NUMERIC(28, 18),
      p_description TEXT,
      p_metadata JSONB DEFAULT '{}'
  )
  RETURNS TABLE(
      transaction_id INTEGER,
      from_balance NUMERIC(28, 18),
      to_balance NUMERIC(28, 18),
      tx_timestamp TIMESTAMP
  ) AS $$
  DECLARE
      v_transaction_id INTEGER;
      v_from_balance NUMERIC(28, 18);
      v_to_balance NUMERIC(28, 18);
      v_new_from_balance NUMERIC(28, 18);
      v_new_to_balance NUMERIC(28, 18);
      v_currency VARCHAR(10);
      v_timestamp TIMESTAMP;
  BEGIN
      -- 1. Lock and get current balances
      SELECT balance, currency INTO v_from_balance, v_currency
      FROM accounts
      WHERE id = p_from_account_id
      FOR UPDATE;

      SELECT balance INTO v_to_balance
      FROM accounts
      WHERE id = p_to_account_id
      FOR UPDATE;

      -- 2. Validate accounts exist
      IF v_from_balance IS NULL OR v_to_balance IS NULL THEN
          RAISE EXCEPTION 'Account not found';
      END IF;

      -- 3. Validate sufficient balance
      IF v_from_balance < p_amount THEN
          RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_from_balance,    
   p_amount;
      END IF;

      -- 4. Calculate new balances
      v_new_from_balance := v_from_balance - p_amount;
      v_new_to_balance := v_to_balance + p_amount;

      -- 5. Create transaction record
      INSERT INTO transactions (
          from_account_id,
          to_account_id,
          amount,
          currency,
          tx_type,
          status,
          description,
          metadata
      )
      VALUES (
          p_from_account_id,
          p_to_account_id,
          p_amount,
          v_currency,
          'transfer',
          'confirmed',
          p_description,
          p_metadata
      )
      RETURNING id, created_at INTO v_transaction_id, v_timestamp;

      -- 6. Create debit ledger entry (from account)
      INSERT INTO ledger_entries (
          transaction_id,
          account_id,
          entry_type,
          amount,
          balance_before,
          balance_after
      )
      VALUES (
          v_transaction_id,
          p_from_account_id,
          'debit',
          p_amount,
          v_from_balance,
          v_new_from_balance
      );

      -- 7. Create credit ledger entry (to account)
      INSERT INTO ledger_entries (
          transaction_id,
          account_id,
          entry_type,
          amount,
          balance_before,
          balance_after
      )
      VALUES (
          v_transaction_id,
          p_to_account_id,
          'credit',
          p_amount,
          v_to_balance,
          v_new_to_balance
      );

      -- 8. Update account balances
      UPDATE accounts SET balance = v_new_from_balance WHERE id = p_from_account_id;
      UPDATE accounts SET balance = v_new_to_balance WHERE id = p_to_account_id;

      -- 9. Return result
      RETURN QUERY SELECT
          v_transaction_id,
          v_new_from_balance,
          v_new_to_balance,
          v_timestamp;
  END;
  $$ LANGUAGE plpgsql;