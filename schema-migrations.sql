-- ============================================================================
-- India Real Estate Showcase - Complete Database Schema
-- ============================================================================
-- This file contains all table definitions and initial data for the 
-- real estate platform supporting multiple agencies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Agencies Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  agency_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'prithvi', 'priya', 'bhima'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Founders/Site Info Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS founders (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  experience VARCHAR(255),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  team_size INTEGER,
  bio TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Site Info Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_info (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  about TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT,
  social_media JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Agents Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(100) NOT NULL UNIQUE,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  bio TEXT,
  image_url VARCHAR(500),
  specialization VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Properties Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  property_id VARCHAR(255) NOT NULL UNIQUE,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2),
  location VARCHAR(500),
  city VARCHAR(100),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  image_urls JSONB, -- Array of image URLs
  features JSONB,   -- Array of features
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10, 2),
  property_type VARCHAR(50), -- 'apartment', 'villa', 'commercial', 'plot', etc.
  ownership VARCHAR(100),
  sale_type VARCHAR(100),
  project_name VARCHAR(255),
  landmarks JSONB,  -- Array of nearby landmarks
  nearby_places JSONB, -- Array of nearby places
  tags JSONB,       -- Array of tags
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'sold', 'hold', etc.
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  youtube_links JSONB, -- Array of YouTube video links
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Contacts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  contact_id VARCHAR(100) NOT NULL UNIQUE,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  label VARCHAR(100),
  phone_number VARCHAR(20) NOT NULL,
  contact_type VARCHAR(50), -- 'Office', 'WhatsApp', 'Sales', 'Support', etc.
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Leads Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(100) NOT NULL UNIQUE,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  message TEXT,
  property_id VARCHAR(255) REFERENCES properties(property_id) ON DELETE SET NULL,
  property_title VARCHAR(500),
  source VARCHAR(50), -- 'form', 'visit', 'call', etc.
  score INTEGER DEFAULT 10,
  temperature VARCHAR(20), -- 'cold', 'warm', 'hot'
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'followup', 'qualified', 'lost', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Bookings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(100) NOT NULL UNIQUE,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id VARCHAR(100) REFERENCES leads(lead_id) ON DELETE SET NULL,
  property_id VARCHAR(255) NOT NULL REFERENCES properties(property_id) ON DELETE RESTRICT,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  booking_amount DECIMAL(12, 2),
  booking_date DATE,
  scheduled_visit_date TIMESTAMP,
  booking_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Reviews/Ratings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  review_id VARCHAR(100) NOT NULL UNIQUE,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  property_id VARCHAR(255) REFERENCES properties(property_id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  review_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- View Tracking Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_views (
  id SERIAL PRIMARY KEY,
  property_id VARCHAR(255) NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  viewer_ip VARCHAR(50),
  viewer_email VARCHAR(255),
  view_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Create Indexes for Better Query Performance
-- ============================================================================
CREATE INDEX idx_properties_agency_status ON properties(agency_id, status);
CREATE INDEX idx_leads_agency_temperature ON leads(agency_id, temperature);
CREATE INDEX idx_bookings_agency_property ON bookings(agency_id, property_id);
CREATE INDEX idx_contacts_agency ON contacts(agency_id);

-- ============================================================================
-- Insert Initial Agency Data
-- ============================================================================
INSERT INTO agencies (agency_key, name) VALUES
('prithvi', 'Prithvi Real Estate'),
('priya', 'Priya Real Estate'),
('bhima', 'Bhima Real Estate')
ON CONFLICT (agency_key) DO NOTHING;

-- ============================================================================
-- Insert Founders Data
-- ============================================================================
INSERT INTO founders (agency_id, name, title, experience, address, phone, email, team_size, bio) 
SELECT id, 'Subbulakshmi Saravanan', 'Founder & CEO', '12+ Years', 
  'No. 5, Kamarajar Salai, Anna Nagar, Madurai – 625 020', 
  '+91 98421 00000', 'subbulakshmi@prithvirealestate.in', 12,
  'Subbulakshmi Saravanan established Prithvi Real Estate in 2012 with a commitment to eco-friendly and sustainable property development in Madurai and surrounding Tamil Nadu districts.'
FROM agencies WHERE agency_key = 'prithvi'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert Agents Data for Prithvi
-- ============================================================================
INSERT INTO agents (agent_id, agency_id, name, role, phone, email, bio, specialization) 
SELECT CONCAT('ag-prithvi-1-', FLOOR(RANDOM() * 1000)), a.id, 'Karthik Murugan', 'Senior Property Advisor', 
  '+91 98421 00001', 'karthik@prithvirealestate.in', 
  'Specialist in agricultural and residential land across Madurai district.', 'Agricultural & Residential Land'
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO agents (agent_id, agency_id, name, role, phone, email, bio, specialization) 
SELECT CONCAT('ag-prithvi-2-', FLOOR(RANDOM() * 1000)), a.id, 'Radha Selvam', 'Legal & Documentation Head', 
  '+91 98421 00002', 'radha@prithvirealestate.in', 
  'Expert in DTCP approvals, patta transfers, and property registration.', 'Legal & Documentation'
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (agent_id) DO NOTHING;

-- ============================================================================
-- Insert Contacts Data for Prithvi
-- ============================================================================
INSERT INTO contacts (contact_id, agency_id, label, phone_number, contact_type, is_primary)
SELECT CONCAT('pc-prithvi-1-', FLOOR(RANDOM() * 1000)), a.id, 'Main Office', '+91 98421 00000', 'Office', true
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (contact_id) DO NOTHING;

INSERT INTO contacts (contact_id, agency_id, label, phone_number, contact_type)
SELECT CONCAT('pc-prithvi-2-', FLOOR(RANDOM() * 1000)), a.id, 'WhatsApp', '+91 98421 00000', 'WhatsApp'
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (contact_id) DO NOTHING;

INSERT INTO contacts (contact_id, agency_id, label, phone_number, contact_type)
SELECT CONCAT('pc-prithvi-3-', FLOOR(RANDOM() * 1000)), a.id, 'Sales', '+91 98421 00001', 'Sales'
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (contact_id) DO NOTHING;

-- ============================================================================
-- Insert Sample Properties Data for Prithvi
-- ============================================================================
INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city, 
  latitude, longitude, bedrooms, bathrooms, area, property_type, 
  status, featured, views, leads_count
)
SELECT 'prithvi-001', a.id, 
  'Modern Luxury Apartment in Bangalore', 
  'Stunning 3BHK apartment with premium amenities in the heart of Bangalore. Recently renovated with smart home features.',
  7500000, 'Whitefield, Bangalore', 'Bangalore', 12.9698, 77.7499,
  3, 2, 1800.00, 'apartment', 'available', true, 0, 0
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, bedrooms, bathrooms, area, property_type,
  status, featured, views, leads_count
)
SELECT 'prithvi-002', a.id,
  'Commercial Plot for Retail Business',
  'Prime commercial plot in prime location. Perfect for retail store or office setup. High foot traffic area.',
  5200000, 'Indiranagar, Bangalore', 'Bangalore', 12.9716, 77.6412,
  0, 0, 2500.00, 'commercial', 'available', false, 0, 0
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, bedrooms, bathrooms, area, property_type,
  status, featured, views, leads_count
)
SELECT 'prithvi-003', a.id,
  'Spacious Independent Villa with Garden',
  '5BHK independent villa with large garden and swimming pool. Gated community with excellent security and maintenance.',
  12500000, 'Koramangala, Bangalore', 'Bangalore', 12.9352, 77.6245,
  5, 4, 4000.00, 'villa', 'available', true, 0, 0
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO properties (
  property_id, agency_id, title, description, price, location, city,
  latitude, longitude, bedrooms, bathrooms, area, property_type,
  status, featured, views, leads_count
)
SELECT 'prithvi-004', a.id,
  'Affordable Studio in Tech Park',
  'Compact and well-designed studio apartment perfect for working professionals. Close to tech parks and metro station.',
  2800000, 'Marathahalli, Bangalore', 'Bangalore', 12.9698, 77.7499,
  1, 1, 450.00, 'apartment', 'available', false, 0, 0
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (property_id) DO NOTHING;

-- ============================================================================
-- Insert Sample Leads Data
-- ============================================================================
INSERT INTO leads (lead_id, agency_id, name, phone, email, message, property_id, property_title, source, score, temperature, status)
SELECT CONCAT('lead-', FLOOR(RANDOM() * 999999)), a.id, 'Hot Visitor', '9000000001', '', 'urgent visit today', 'prithvi-001', 'Modern Luxury Apartment', 'form', 40, 'warm', 'new'
FROM agencies a WHERE a.agency_key = 'prithvi'
ON CONFLICT (lead_id) DO NOTHING;

-- ============================================================================
-- Verify Schema Creation
-- ============================================================================
SELECT 'Schema created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
