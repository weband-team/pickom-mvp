-- ========================================
-- PICKOM MVP - Database Seed Data
-- Created: 2025-10-20
-- Purpose: Populate database with test data
-- ========================================

-- IMPORTANT: Run this AFTER creating users in Firebase and getting their UIDs
-- Replace the placeholder UIDs below with actual Firebase UIDs

-- ========================================
-- 1. CREATE DELIVERY_TRACKING TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id SERIAL PRIMARY KEY,
  delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'picked_up', 'delivered', 'cancelled')),
  location JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_delivery ON delivery_tracking(delivery_id);
CREATE INDEX IF NOT EXISTS idx_tracking_created ON delivery_tracking(created_at DESC);

-- ========================================
-- 2. INSERT USERS
-- ========================================
-- Note: Replace 'FIREBASE_UID_X' with actual Firebase UIDs after user creation

INSERT INTO users (firebase_uid, email, name, phone, role, avatar_url, rating, total_ratings, balance, active, is_online, base_price, completed_deliveries, total_orders, about, location, created_at, updated_at)
VALUES
  -- User 1: Alice Johnson (Sender)
  ('FIREBASE_UID_ALICE', 'alice.johnson@pickom.test', 'Alice Johnson', '+48111222333', 'sender',
   'https://i.pravatar.cc/150?img=1', 0, 0, -80.00, true, false, null, 0, 3,
   'Frequent sender, verified account. I often send packages and appreciate reliable service.',
   '{"lat": 52.2297, "lng": 21.0122, "address": "Warsaw, Poland"}',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),

  -- User 2: Bob Smith (Picker)
  ('FIREBASE_UID_BOB', 'bob.smith@pickom.test', 'Bob Smith', '+48222333444', 'picker',
   'https://i.pravatar.cc/150?img=12', 5.0, 1, 45.00, true, true, 20.00, 1, 1,
   'Professional picker with 5-star rating. Fast and reliable delivery service. Specialize in electronics.',
   '{"lat": 52.2297, "lng": 21.0122, "address": "Warsaw, Poland"}',
   NOW() - INTERVAL '60 days', NOW()),

  -- User 3: Charlie Brown (Picker)
  ('FIREBASE_UID_CHARLIE', 'charlie.brown@pickom.test', 'Charlie Brown', '+48333444555', 'picker',
   'https://i.pravatar.cc/150?img=8', 5.0, 1, 15.00, true, true, 15.00, 1, 2,
   'Student picker, eco-friendly bicycle delivery. Fast service within Warsaw. Available daily.',
   '{"lat": 52.2297, "lng": 21.0122, "address": "Warsaw, Poland"}',
   NOW() - INTERVAL '45 days', NOW()),

  -- User 4: Diana Prince (Sender)
  ('FIREBASE_UID_DIANA', 'diana.prince@pickom.test', 'Diana Prince', '+48444555666', 'sender',
   'https://i.pravatar.cc/150?img=5', 0, 0, -15.00, true, false, null, 0, 2,
   'Business sender, bulk shipments. Looking for reliable partners for regular deliveries.',
   '{"lat": 54.3520, "lng": 18.6466, "address": "Gdansk, Poland"}',
   NOW() - INTERVAL '20 days', NOW()),

  -- User 5: Eve Martinez (Picker)
  ('FIREBASE_UID_EVE', 'eve.martinez@pickom.test', 'Eve Martinez', '+48555666777', 'picker',
   'https://i.pravatar.cc/150?img=9', 0, 0, 0.00, true, true, 25.00, 0, 1,
   'Express delivery specialist. Professional courier with motorbike. Tracking available.',
   '{"lat": 52.2297, "lng": 21.0122, "address": "Warsaw, Poland"}',
   NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (firebase_uid) DO NOTHING;

-- ========================================
-- 3. INSERT DELIVERIES
-- ========================================
-- Get user IDs (will be used in subsequent inserts)
-- Note: This assumes users are already created

DO $$
DECLARE
  alice_id INTEGER;
  bob_id INTEGER;
  charlie_id INTEGER;
  diana_id INTEGER;
  eve_id INTEGER;
BEGIN
  -- Get user IDs
  SELECT id INTO alice_id FROM users WHERE email = 'alice.johnson@pickom.test';
  SELECT id INTO bob_id FROM users WHERE email = 'bob.smith@pickom.test';
  SELECT id INTO charlie_id FROM users WHERE email = 'charlie.brown@pickom.test';
  SELECT id INTO diana_id FROM users WHERE email = 'diana.prince@pickom.test';
  SELECT id INTO eve_id FROM users WHERE email = 'eve.martinez@pickom.test';

  -- Delivery 1: Laptop (Completed)
  INSERT INTO deliveries (sender_id, picker_id, title, description, from_location, to_location, delivery_type, price, size, weight, status, notes, created_at, updated_at)
  VALUES (
    alice_id, bob_id,
    'Laptop Dell XPS 15',
    'Brand new laptop in original packaging. Handle with care, fragile electronics.',
    '{"lat": 52.2297, "lng": 21.0122, "address": "Marszalkowska 1, Warsaw, Poland", "city": "Warsaw"}',
    '{"lat": 50.0647, "lng": 19.9450, "address": "Rynek Glowny 1, Krakow, Poland", "city": "Krakow"}',
    'inter-city', 45.00, 'medium', 2.5, 'delivered',
    'Please call before pickup',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'
  );

  -- Delivery 2: Documents (Completed)
  INSERT INTO deliveries (sender_id, picker_id, title, description, from_location, to_location, delivery_type, price, size, weight, status, notes, created_at, updated_at)
  VALUES (
    diana_id, charlie_id,
    'Legal Documents - Urgent',
    'Important legal documents. Confidential. Signature required on delivery.',
    '{"lat": 52.2297, "lng": 21.0122, "address": "Nowy Swiat 33, Warsaw Center, Poland", "city": "Warsaw"}',
    '{"lat": 52.1806, "lng": 21.0251, "address": "Woloska 12, Warsaw Mokotow, Poland", "city": "Warsaw"}',
    'within-city', 15.00, 'small', 0.5, 'delivered',
    'Urgent delivery needed',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );

  -- Delivery 3: Gift (In Transit)
  INSERT INTO deliveries (sender_id, picker_id, title, description, from_location, to_location, delivery_type, price, size, weight, status, notes, created_at, updated_at)
  VALUES (
    alice_id, eve_id,
    'Birthday Gift - Flowers and Cake',
    'Birthday surprise! Fresh flowers and birthday cake. Time-sensitive delivery.',
    '{"lat": 52.2532, "lng": 21.0398, "address": "Targowa 56, Warsaw Praga, Poland", "city": "Warsaw"}',
    '{"lat": 52.1391, "lng": 21.0491, "address": "Pilsudskiego 54, Warsaw Ursynow, Poland", "city": "Warsaw"}',
    'within-city', 25.00, 'medium', 3.0, 'picked_up',
    'Handle with care - fragile cake!',
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
  );

  -- Delivery 4: Books (Pending offers)
  INSERT INTO deliveries (sender_id, picker_id, title, description, from_location, to_location, delivery_type, price, size, weight, status, notes, created_at, updated_at)
  VALUES (
    diana_id, NULL,
    'University Textbooks (5 books)',
    '5 university textbooks for computer science. Heavy package.',
    '{"lat": 54.3520, "lng": 18.6466, "address": "Dluga 45, Gdansk, Poland", "city": "Gdansk"}',
    '{"lat": 52.2297, "lng": 21.0122, "address": "Krakowskie Przedmiescie 26, Warsaw, Poland", "city": "Warsaw"}',
    'inter-city', 60.00, 'large', 5.0, 'pending',
    'Books for university student',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  );

  -- Delivery 5: Groceries (Accepted)
  INSERT INTO deliveries (sender_id, picker_id, title, description, from_location, to_location, delivery_type, price, size, weight, status, notes, created_at, updated_at)
  VALUES (
    alice_id, charlie_id,
    'Fresh Groceries from Organic Market',
    'Fresh organic vegetables and fruits from local market.',
    '{"lat": 52.2402, "lng": 20.9185, "address": "Powstancow Slaskich 104, Warsaw Bemowo, Poland", "city": "Warsaw"}',
    '{"lat": 52.2401, "lng": 20.9802, "address": "Wolska 137, Warsaw Wola, Poland", "city": "Warsaw"}',
    'within-city', 20.00, 'medium', 4.0, 'accepted',
    'Please keep cool',
    NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes'
  );

END $$;

-- ========================================
-- 4. INSERT OFFERS
-- ========================================
DO $$
DECLARE
  bob_id INTEGER;
  eve_id INTEGER;
  delivery4_id INTEGER;
BEGIN
  SELECT id INTO bob_id FROM users WHERE email = 'bob.smith@pickom.test';
  SELECT id INTO eve_id FROM users WHERE email = 'eve.martinez@pickom.test';
  SELECT id INTO delivery4_id FROM deliveries WHERE title = 'University Textbooks (5 books)';

  -- Offer 1: Bob for Books
  INSERT INTO offers (delivery_id, picker_id, price, message, status, created_at)
  VALUES (
    delivery4_id, bob_id, 55.00,
    'I''m heading to Warsaw tomorrow, can deliver safely!',
    'pending', NOW() - INTERVAL '12 hours'
  );

  -- Offer 2: Eve for Books
  INSERT INTO offers (delivery_id, picker_id, price, message, status, created_at)
  VALUES (
    delivery4_id, eve_id, 60.00,
    'Professional courier with tracking, delivery within 24h',
    'pending', NOW() - INTERVAL '6 hours'
  );

END $$;

-- ========================================
-- 5. INSERT TRACKING UPDATES
-- ========================================
DO $$
DECLARE
  delivery1_id INTEGER;
  delivery2_id INTEGER;
  delivery3_id INTEGER;
BEGIN
  SELECT id INTO delivery1_id FROM deliveries WHERE title = 'Laptop Dell XPS 15';
  SELECT id INTO delivery2_id FROM deliveries WHERE title = 'Legal Documents - Urgent';
  SELECT id INTO delivery3_id FROM deliveries WHERE title = 'Birthday Gift - Flowers and Cake';

  -- Tracking for Delivery 1 (Laptop) - Completed
  INSERT INTO delivery_tracking (delivery_id, status, location, notes, created_at) VALUES
    (delivery1_id, 'pending', NULL, 'Delivery request created', NOW() - INTERVAL '5 days'),
    (delivery1_id, 'accepted', NULL, 'Bob Smith accepted the delivery', NOW() - INTERVAL '5 days' + INTERVAL '1 hour 30 minutes'),
    (delivery1_id, 'picked_up', '{"lat": 52.2297, "lng": 21.0122}', 'Package picked up from sender', NOW() - INTERVAL '5 days' + INTERVAL '4 hours'),
    (delivery1_id, 'delivered', '{"lat": 50.0647, "lng": 19.9450}', 'Successfully delivered to recipient', NOW() - INTERVAL '3 days');

  -- Tracking for Delivery 2 (Documents) - Completed
  INSERT INTO delivery_tracking (delivery_id, status, location, notes, created_at) VALUES
    (delivery2_id, 'pending', NULL, 'Delivery request created', NOW() - INTERVAL '2 days'),
    (delivery2_id, 'accepted', NULL, 'Charlie Brown accepted', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
    (delivery2_id, 'picked_up', '{"lat": 52.2297, "lng": 21.0122}', 'Documents picked up', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    (delivery2_id, 'delivered', '{"lat": 52.1806, "lng": 21.0251}', 'Documents delivered and signed', NOW() - INTERVAL '2 days' + INTERVAL '2 hours 30 minutes');

  -- Tracking for Delivery 3 (Gift) - In Transit
  INSERT INTO delivery_tracking (delivery_id, status, location, notes, created_at) VALUES
    (delivery3_id, 'pending', NULL, 'Birthday gift delivery requested', NOW() - INTERVAL '2 hours'),
    (delivery3_id, 'accepted', NULL, 'Eve Martinez accepted', NOW() - INTERVAL '1 hour 30 minutes'),
    (delivery3_id, 'picked_up', '{"lat": 52.2532, "lng": 21.0398}', 'Gift picked up from florist', NOW() - INTERVAL '1 hour');

END $$;

-- ========================================
-- 6. INSERT RATINGS
-- ========================================
DO $$
DECLARE
  alice_id INTEGER;
  diana_id INTEGER;
  bob_id INTEGER;
  charlie_id INTEGER;
  delivery1_id INTEGER;
  delivery2_id INTEGER;
BEGIN
  SELECT id INTO alice_id FROM users WHERE email = 'alice.johnson@pickom.test';
  SELECT id INTO diana_id FROM users WHERE email = 'diana.prince@pickom.test';
  SELECT id INTO bob_id FROM users WHERE email = 'bob.smith@pickom.test';
  SELECT id INTO charlie_id FROM users WHERE email = 'charlie.brown@pickom.test';
  SELECT id INTO delivery1_id FROM deliveries WHERE title = 'Laptop Dell XPS 15';
  SELECT id INTO delivery2_id FROM deliveries WHERE title = 'Legal Documents - Urgent';

  -- Rating 1: Alice rates Bob for Laptop delivery
  INSERT INTO ratings (from_user_id, to_user_id, delivery_id, rating, comment, created_at)
  VALUES (
    alice_id, bob_id, delivery1_id, 5.0,
    'Excellent service! Laptop arrived safely and on time. Highly recommend Bob!',
    NOW() - INTERVAL '3 days'
  );

  -- Rating 2: Diana rates Charlie for Documents
  INSERT INTO ratings (from_user_id, to_user_id, delivery_id, rating, comment, created_at)
  VALUES (
    diana_id, charlie_id, delivery2_id, 5.0,
    'Super fast delivery! Documents arrived within 2 hours. Thank you!',
    NOW() - INTERVAL '2 days'
  );

END $$;

-- ========================================
-- 7. INSERT PAYMENTS
-- ========================================
DO $$
DECLARE
  alice_id INTEGER;
  diana_id INTEGER;
  bob_id INTEGER;
  charlie_id INTEGER;
  delivery1_id INTEGER;
  delivery2_id INTEGER;
BEGIN
  SELECT id INTO alice_id FROM users WHERE email = 'alice.johnson@pickom.test';
  SELECT id INTO diana_id FROM users WHERE email = 'diana.prince@pickom.test';
  SELECT id INTO bob_id FROM users WHERE email = 'bob.smith@pickom.test';
  SELECT id INTO charlie_id FROM users WHERE email = 'charlie.brown@pickom.test';
  SELECT id INTO delivery1_id FROM deliveries WHERE title = 'Laptop Dell XPS 15';
  SELECT id INTO delivery2_id FROM deliveries WHERE title = 'Legal Documents - Urgent';

  -- Payment 1: Alice to Bob for Laptop
  INSERT INTO payments (from_user_id, to_user_id, delivery_id, amount, status, method, created_at)
  VALUES (
    alice_id, bob_id, delivery1_id, 45.00, 'completed', 'card',
    NOW() - INTERVAL '3 days'
  );

  -- Payment 2: Diana to Charlie for Documents
  INSERT INTO payments (from_user_id, to_user_id, delivery_id, amount, status, method, created_at)
  VALUES (
    diana_id, charlie_id, delivery2_id, 15.00, 'completed', 'cash',
    NOW() - INTERVAL '2 days'
  );

END $$;

-- ========================================
-- 8. INSERT NOTIFICATIONS
-- ========================================
DO $$
DECLARE
  alice_id INTEGER;
  bob_id INTEGER;
  diana_id INTEGER;
  delivery1_id INTEGER;
  delivery3_id INTEGER;
  delivery4_id INTEGER;
BEGIN
  SELECT id INTO alice_id FROM users WHERE email = 'alice.johnson@pickom.test';
  SELECT id INTO bob_id FROM users WHERE email = 'bob.smith@pickom.test';
  SELECT id INTO diana_id FROM users WHERE email = 'diana.prince@pickom.test';
  SELECT id INTO delivery1_id FROM deliveries WHERE title = 'Laptop Dell XPS 15';
  SELECT id INTO delivery3_id FROM deliveries WHERE title = 'Birthday Gift - Flowers and Cake';
  SELECT id INTO delivery4_id FROM deliveries WHERE title = 'University Textbooks (5 books)';

  -- Notifications for Alice
  INSERT INTO notifications (user_id, title, message, type, read, related_delivery_id, created_at) VALUES
    (alice_id, 'Delivery Completed', 'Your delivery "Laptop Dell XPS 15" has been delivered!', 'status_update', true, delivery1_id, NOW() - INTERVAL '3 days'),
    (alice_id, 'Offer Accepted', 'Bob Smith accepted your delivery request', 'offer_accepted', true, delivery1_id, NOW() - INTERVAL '5 days'),
    (alice_id, 'In Transit', 'Your delivery "Gift Package" is on the way', 'status_update', false, delivery3_id, NOW() - INTERVAL '1 hour');

  -- Notifications for Bob
  INSERT INTO notifications (user_id, title, message, type, read, related_delivery_id, created_at) VALUES
    (bob_id, 'New Delivery Available', 'New delivery request available in Warsaw-Krakow route', 'new_delivery', true, NULL, NOW() - INTERVAL '5 days'),
    (bob_id, 'Payment Received', 'Payment received: 45.00 PLN for Delivery #1', 'status_update', true, delivery1_id, NOW() - INTERVAL '3 days');

  -- Notifications for Diana
  INSERT INTO notifications (user_id, title, message, type, read, related_delivery_id, created_at) VALUES
    (diana_id, 'New Offers', '2 new offers for your Books delivery', 'offer_received', false, delivery4_id, NOW() - INTERVAL '6 hours');

END $$;

-- ========================================
-- 9. VERIFY DATA
-- ========================================
-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'delivery_tracking', COUNT(*) FROM delivery_tracking
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- ========================================
-- SEED COMPLETED
-- ========================================
-- Next steps:
-- 1. Create Firebase users with credentials from SEED_DATA_CREDENTIALS.md
-- 2. Replace FIREBASE_UID_X placeholders with actual UIDs
-- 3. Re-run this script
-- 4. Test login and data display in frontend
