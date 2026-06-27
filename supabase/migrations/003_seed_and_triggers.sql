-- Seed data for initial setup

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('app_name', '{"name": "SwiftShip"}', 'Application name'),
  ('pricing', '{"base_price": 5.99, "per_kg": 2.50, "same_day_multiplier": 1.5, "international_multiplier": 2.0}', 'Pricing configuration'),
  ('supported_countries', '["US", "CA", "MX", "UK", "DE", "FR", "ES", "IT", "AU", "JP"]', 'Supported shipping countries'),
  ('delivery_hours', '{"start": "08:00", "end": "20:00"}', 'Default delivery hours');

-- Create trigger for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, status, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer',
    'active',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  );
  
  -- Create customer record for new users
  INSERT INTO customers (profile_id, wallet_balance)
  VALUES (NEW.id, 0);
  
  -- Create wallet record
  INSERT INTO wallets (user_id, balance, currency)
  VALUES (NEW.id, 0, 'USD');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  record_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    record_id := NEW.id::TEXT;
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, record_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    record_id := OLD.id::TEXT;
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, record_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    record_id := OLD.id::TEXT;
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, record_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shipment status changes
CREATE OR REPLACE FUNCTION notify_shipment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert tracking event when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO tracking_events (shipment_id, status, location, description)
    VALUES (
      NEW.id,
      NEW.status,
      NEW.delivery_address,
      'Shipment status updated to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_shipment_status_change
  AFTER UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION notify_shipment_status_change();