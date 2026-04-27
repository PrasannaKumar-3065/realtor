-- ============================================================================
-- India Real Estate Showcase - Data Migration Script
-- ============================================================================
-- This file contains SQL statements to migrate JSON data from the
-- server/data directory into the PostgreSQL database tables
-- Run this AFTER schema-migrations.sql has been executed

-- ============================================================================
-- PRITHVI REAL ESTATE - Data Insertion
-- ============================================================================

-- Store the agency ID for reference
WITH agency_data AS (
  SELECT id FROM agencies WHERE agency_key = 'prithvi'
)

-- Insert Founder for Prithvi
INSERT INTO founders (agency_id, name, title, experience, address, phone, email, team_size, bio, created_at, updated_at)
SELECT 
  (SELECT id FROM agencies WHERE agency_key = 'prithvi'),
  'Subbulakshmi Saravanan',
  'Founder & CEO',
  '12+ Years',
  'No. 5, Kamarajar Salai, Anna Nagar, Madurai – 625 020',
  '+91 98421 00000',
  'subbulakshmi@prithvirealestate.in',
  12,
  'Subbulakshmi Saravanan established Prithvi Real Estate in 2012 with a commitment to eco-friendly and sustainable property development in Madurai and surrounding Tamil Nadu districts. With a background in land surveying and legal consultation, she brings unmatched expertise in DTCP approvals, agricultural land deals, and rural-to-urban plot development.',
  NOW(),
  NOW()
ON CONFLICT DO NOTHING;

-- Insert Agents for Prithvi
INSERT INTO agents (agent_id, agency_id, name, role, phone, email, bio, specialization, status, created_at, updated_at)
SELECT 
  'ag-1',
  (SELECT id FROM agencies WHERE agency_key = 'prithvi'),
  'Karthik Murugan',
  'Senior Property Advisor',
  '+91 98421 00001',
  'karthik@prithvirealestate.in',
  'Specialist in agricultural and residential land across Madurai district.',
  'Agricultural & Residential Land',
  'active',
  NOW(),
  NOW()
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO agents (agent_id, agency_id, name, role, phone, email, bio, specialization, status, created_at, updated_at)
SELECT 
  'ag-2',
  (SELECT id FROM agencies WHERE agency_key = 'prithvi'),
  'Radha Selvam',
  'Legal & Documentation Head',
  '+91 98421 00002',
  'radha@prithvirealestate.in',
  'Expert in DTCP approvals, patta transfers, and property registration.',
  'Legal & Documentation',
  'active',
  NOW(),
  NOW()
ON CONFLICT (agent_id) DO NOTHING;

-- Insert Contacts for Prithvi
INSERT INTO contacts (contact_id, agency_id, label, phone_number, contact_type, is_primary, created_at, updated_at)
VALUES 
  ('pc-1', (SELECT id FROM agencies WHERE agency_key = 'prithvi'), 'Main Office', '+91 98421 00000', 'Office', true, NOW(), NOW()),
  ('pc-2', (SELECT id FROM agencies WHERE agency_key = 'prithvi'), 'WhatsApp', '+91 98421 00000', 'WhatsApp', false, NOW(), NOW()),
  ('pc-3', (SELECT id FROM agencies WHERE agency_key = 'prithvi'), 'Sales', '+91 98421 00001', 'Sales', false, NOW(), NOW())
ON CONFLICT (contact_id) DO NOTHING;

-- Insert Sample Properties for Prithvi - DTCP Approved Residential Plot
INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, bedrooms, bathrooms, area, property_type,
  ownership, sale_type, project_name, status, featured, views, leads_count,
  image_urls, features, landmarks, nearby_places, tags, created_at, updated_at
)
SELECT
  'prithvi-1',
  (SELECT id FROM agencies WHERE agency_key = 'prithvi'),
  'DTCP Approved Residential Plot – T.Vadipatti',
  'DTCP approved residential plot in a lush gated layout with tree-lined roads, underground drainage, and clear titles. Ideal for building your dream home or investment.\n\nKey Features:\n• DTCP Approved Layout\n• Clear Title Deed\n• Underground drainage\n• Black top roads\n• 24/7 water supply',
  1200000,
  'T.Vadipatti, Madurai',
  'Madurai',
  9.9898,
  78.0748,
  0,
  0,
  2400.00,
  'Residential Plots',
  'Clear Title',
  'Direct Sale',
  'Green Valley Layout',
  'Available',
  true,
  4,
  4,
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80"]'::jsonb,
  '["DTCP Approved", "Clear Title Deed", "Underground drainage", "Black top roads", "24/7 water supply"]'::jsonb,
  '["School", "Hospital", "Bank", "Bus Stop"]'::jsonb,
  '["T.Vadipatti town center – 2 km", "Madurai city center – 22 km", "Schools – 1 km"]'::jsonb,
  '["DTCP Approved", "Clear Title", "Gated Layout", "40×60", "Residential"]'::jsonb,
  NOW(),
  NOW()
ON CONFLICT (property_id) DO NOTHING;

-- Insert more properties for Prithvi
INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, area, property_type, status, featured, created_at, updated_at
)
SELECT
  'prithvi-2',
  (SELECT id FROM agencies WHERE agency_key = 'prithvi'),
  'Agricultural Land – Alanganallur',
  'Premium agricultural land with excellent irrigation facility. Perfect for farming, dairy, or organic cultivation. Near highway for easy transportation.',
  800000,
  'Alanganallur, Madurai',
  'Madurai',
  9.8500,
  78.2500,
  50000.00,
  'Farm / Agricultural Land',
  'Available',
  false,
  NOW(),
  NOW()
ON CONFLICT (property_id) DO NOTHING;

-- Insert Leads from Prithvi data
INSERT INTO leads (lead_id, agency_id, name, phone, email, message, property_id, property_title, source, score, temperature, status, created_at, updated_at)
VALUES
  ('lead-mohmvj9bcxfp4095l5', (SELECT id FROM agencies WHERE agency_key = 'prithvi'), 'Hot Visitor', '9000000001', '', 'urgent visit today', 'prithvi-1', 'DTCP Approved Residential Plot – T.Vadipatti', 'form', 40, 'warm', 'new', '2026-04-27T20:12:14.015Z'::timestamp, NOW()),
  ('lead-mohmwspv149eel11penh', (SELECT id FROM agencies WHERE agency_key = 'prithvi'), 'Hot Visitor', '9000000001', '', 'urgent visit today', 'prithvi-1', 'DTCP Approved Residential Plot – T.Vadipatti', 'visit', 110, 'hot', 'new', '2026-04-27T20:13:12.931Z'::timestamp, NOW())
ON CONFLICT (lead_id) DO NOTHING;

-- ============================================================================
-- PRIYA REAL ESTATE - Data Insertion
-- ============================================================================

INSERT INTO founders (agency_id, name, title, experience, address, phone, email, team_size, bio, created_at, updated_at)
SELECT 
  (SELECT id FROM agencies WHERE agency_key = 'priya'),
  'Priya Sharma',
  'Founder & CEO',
  '15+ Years',
  'Real Estate Business Hub, Bangalore',
  '+91 98456 00000',
  'priya@priyarealestate.in',
  18,
  'Experienced real estate professional specializing in commercial and residential properties in Bangalore.',
  NOW(),
  NOW()
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BHIMA REAL ESTATE - Data Insertion
-- ============================================================================

INSERT INTO founders (agency_id, name, title, experience, address, phone, email, team_size, bio, created_at, updated_at)
SELECT 
  (SELECT id FROM agencies WHERE agency_key = 'bhima'),
  'Bhima Kumar',
  'Founder & Managing Director',
  '20+ Years',
  'Commercial Complex, Chennai',
  '+91 98789 00000',
  'bhima@bhimarealestate.in',
  25,
  'Pioneer in high-end residential and commercial real estate with a proven track record of successful projects.',
  NOW(),
  NOW()
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert Sample Properties from different agencies
-- ============================================================================

-- Priya Real Estate - Commercial Properties
INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, area, property_type, ownership, status, featured, created_at, updated_at
)
SELECT
  'priya-001',
  (SELECT id FROM agencies WHERE agency_key = 'priya'),
  'Commercial Plot for Retail Business – Indiranagar',
  'Prime commercial plot in prime location. Perfect for retail store or office setup. High foot traffic area. Corner plot with excellent visibility.',
  5200000,
  'Indiranagar, Bangalore',
  'Bangalore',
  12.9716,
  77.6412,
  2500.00,
  'commercial',
  'Clear Title',
  'Available',
  true,
  NOW(),
  NOW()
ON CONFLICT (property_id) DO NOTHING;

-- Bhima Real Estate - Residential Properties
INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, bedrooms, bathrooms, area, property_type, status, featured, created_at, updated_at
)
SELECT
  'bhima-001',
  (SELECT id FROM agencies WHERE agency_key = 'bhima'),
  'Spacious Independent Villa with Garden – Koramangala',
  '5BHK independent villa with large garden and swimming pool. Gated community with excellent security and maintenance. Prime location near shopping centers.',
  12500000,
  'Koramangala, Bangalore',
  'Bangalore',
  12.9352,
  77.6245,
  5,
  4,
  4000.00,
  'villa',
  'Available',
  true,
  NOW(),
  NOW()
ON CONFLICT (property_id) DO NOTHING;

-- ============================================================================
-- Add Sample Reviews
-- ============================================================================

INSERT INTO reviews (review_id, agency_id, property_id, customer_name, customer_email, rating, title, comment, review_date, status, created_at, updated_at)
VALUES
  ('rv-001', (SELECT id FROM agencies WHERE agency_key = 'prithvi'), 'prithvi-1', 'Rajesh Kumar', 'rajesh@email.com', 5, 'Excellent property and amazing service!', 'The property was exactly as described. The team was very helpful and the entire process was smooth.', '2026-04-20'::date, 'approved', NOW(), NOW()),
  ('rv-002', (SELECT id FROM agencies WHERE agency_key = 'priya'), 'priya-001', 'Sunita Patel', 'sunita@email.com', 4, 'Good location and great support', 'Very satisfied with the commercial property. The location is perfect for our business.', '2026-04-22'::date, 'approved', NOW(), NOW())
ON CONFLICT (review_id) DO NOTHING;

-- ============================================================================
-- Verify Data Insertion
-- ============================================================================

SELECT 'Data migration completed successfully!' as status;

-- Show summary of data inserted
SELECT 
  (SELECT COUNT(*) FROM agencies) as total_agencies,
  (SELECT COUNT(*) FROM founders) as total_founders,
  (SELECT COUNT(*) FROM agents) as total_agents,
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM contacts) as total_contacts,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM reviews) as total_reviews;

-- ============================================================================
-- Show all agencies with their properties count
-- ============================================================================
SELECT 
  a.name as agency_name,
  COUNT(p.id) as properties_count,
  COUNT(l.id) as leads_count,
  COUNT(ag.id) as agents_count
FROM agencies a
LEFT JOIN properties p ON a.id = p.agency_id
LEFT JOIN leads l ON a.id = l.agency_id
LEFT JOIN agents ag ON a.id = ag.agency_id
GROUP BY a.id, a.name
ORDER BY a.name;
