-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Helper function to check if user is admin or higher
CREATE OR REPLACE FUNCTION is_admin_or_higher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'warehouse_staff', 'dispatcher')
  );
$$ LANGUAGE sql STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- DRIVERS POLICIES
-- ============================================
CREATE POLICY "drivers_select_own" ON drivers
  FOR SELECT USING (
    auth.uid() = profile_id OR 
    is_admin_or_higher() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dispatcher')
  );

CREATE POLICY "drivers_insert_own" ON drivers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "drivers_update_own" ON drivers
  FOR UPDATE USING (
    auth.uid() = profile_id OR 
    is_admin_or_higher() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dispatcher')
  );

CREATE POLICY "drivers_admin_all" ON drivers
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- CUSTOMERS POLICIES
-- ============================================
CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (
    auth.uid() = profile_id OR 
    is_admin_or_higher()
  );

CREATE POLICY "customers_insert_own" ON customers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (
    auth.uid() = profile_id OR 
    is_admin_or_higher()
  );

CREATE POLICY "customers_admin_all" ON customers
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- VEHICLES POLICIES
-- ============================================
CREATE POLICY "vehicles_select_own" ON vehicles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM drivers WHERE id = vehicles.driver_id AND profile_id = auth.uid()) OR
    is_admin_or_higher()
  );

CREATE POLICY "vehicles_insert_own" ON vehicles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE profile_id = auth.uid()) OR
    is_admin_or_higher()
  );

CREATE POLICY "vehicles_update_own" ON vehicles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM drivers WHERE id = vehicles.driver_id AND profile_id = auth.uid()) OR
    is_admin_or_higher()
  );

CREATE POLICY "vehicles_admin_all" ON vehicles
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- WAREHOUSES POLICIES
-- ============================================
CREATE POLICY "warehouses_select_all" ON warehouses
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "warehouses_admin_all" ON warehouses
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- SHIPMENTS POLICIES
-- ============================================
CREATE POLICY "shipments_select_own" ON shipments
  FOR SELECT USING (
    auth.uid() = (SELECT profile_id FROM customers WHERE id = shipments.customer_id) OR
    auth.uid() = (SELECT profile_id FROM drivers WHERE id = shipments.driver_id) OR
    is_admin_or_higher() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dispatcher')
  );

CREATE POLICY "shipments_insert_own" ON shipments
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT profile_id FROM customers WHERE id = shipments.customer_id) OR
    is_admin_or_higher()
  );

CREATE POLICY "shipments_update_own" ON shipments
  FOR UPDATE USING (
    auth.uid() = (SELECT profile_id FROM drivers WHERE id = shipments.driver_id) OR
    is_admin_or_higher() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dispatcher')
  );

CREATE POLICY "shipments_select_tracking" ON shipments
  FOR SELECT USING (tracking_number = current_setting('shipment.tracking', true)::text)
  WITH CHECK (false);

-- ============================================
-- SHIPMENT ITEMS POLICIES
-- ============================================
CREATE POLICY "shipment_items_select_own" ON shipment_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = shipment_items.shipment_id AND
        (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR
        (driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())) OR
        is_admin_or_higher()
    )
  );

CREATE POLICY "shipment_items_insert_own" ON shipment_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = shipment_items.shipment_id AND
        (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR
        is_admin_or_higher()
    )
  );

CREATE POLICY "shipment_items_update_own" ON shipment_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = shipment_items.shipment_id AND
        (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR
        is_admin_or_higher()
    )
  );

-- ============================================
-- TRACKING EVENTS POLICIES
-- ============================================
CREATE POLICY "tracking_events_select_own" ON tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = tracking_events.shipment_id AND
        (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR
        (driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())) OR
        is_admin_or_higher()
    )
  );

CREATE POLICY "tracking_events_insert_driver" ON tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = tracking_events.shipment_id AND
        (driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())) OR
        is_admin_or_higher()
    )
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_admin_or_higher() OR
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = payments.shipment_id AND
        customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "payments_insert_own" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    is_admin_or_higher()
  );

-- ============================================
-- INVOICES POLICIES
-- ============================================
CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_admin_or_higher() OR
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = invoices.shipment_id AND
        customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
    )
  );

-- ============================================
-- ADDRESSES POLICIES
-- ============================================
CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_admin_or_higher()
  );

CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- REVIEWS POLICIES
-- ============================================
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE id = reviews.shipment_id AND
        customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- WALLETS POLICIES
-- ============================================
CREATE POLICY "wallets_select_own" ON wallets
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_higher());

CREATE POLICY "wallets_update_admin" ON wallets
  FOR UPDATE USING (is_admin_or_higher());

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM wallets WHERE id = transactions.wallet_id) OR
    is_admin_or_higher()
  );

CREATE POLICY "transactions_insert_admin" ON transactions
  FOR INSERT WITH CHECK (is_admin_or_higher());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- SUPPORT TICKETS POLICIES
-- ============================================
CREATE POLICY "support_tickets_select_own" ON support_tickets
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_admin_or_higher() OR
    auth.uid() = assigned_to
  );

CREATE POLICY "support_tickets_insert_own" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_update_own" ON support_tickets
  FOR UPDATE USING (
    auth.uid() = user_id OR
    is_admin_or_higher() OR
    auth.uid() = assigned_to
  );

CREATE POLICY "support_tickets_delete_admin" ON support_tickets
  FOR DELETE USING (is_admin_or_higher());

-- ============================================
-- SETTINGS POLICIES
-- ============================================
CREATE POLICY "settings_admin_only" ON settings
  FOR ALL USING (is_admin_or_higher()) WITH CHECK (is_admin_or_higher());

-- ============================================
-- MEDIA POLICIES
-- ============================================
CREATE POLICY "media_select_own" ON media
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_admin_or_higher() OR
    bucket IN ('delivery_proofs', 'package_images') AND EXISTS (
      SELECT 1 FROM shipments 
      WHERE media.shipment_id = id AND
        customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "media_insert_own" ON media
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin_or_higher());

CREATE POLICY "media_delete_own" ON media
  FOR DELETE USING (auth.uid() = user_id OR is_admin_or_higher());