  -- Create audit trigger function
  CREATE OR REPLACE FUNCTION audit_trigger_func()
  RETURNS TRIGGER AS $$
  BEGIN
      IF (TG_OP = 'DELETE') THEN
          INSERT INTO audit_log (table_name, record_id, action, old_values)
          VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
          RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
          VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
          RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO audit_log (table_name, record_id, action, new_values)
          VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
          RETURN NEW;
      END IF;
  END;
  $$ LANGUAGE plpgsql;

  -- Attach trigger to accounts table
  CREATE TRIGGER audit_accounts
  AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

  -- Attach trigger to transactions table
  CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

  -- Verify triggers were created
  SELECT
      tgname AS trigger_name,
      tgrelid::regclass AS table_name,
      tgenabled AS enabled
  FROM pg_trigger
  WHERE tgname LIKE 'audit_%'
  ORDER BY tgrelid::regclass, tgname;