-- Insert 4 dummy real estate properties

INSERT INTO properties (property_id, agency, title, description, price, location, latitude, longitude, image_urls, features, bedrooms, bathrooms, area, property_type, status, created_at, updated_at) VALUES
-- Property 1: Prithvi - Modern Apartment
('prithvi-001', 'prithvi', 'Modern Luxury Apartment in Bangalore', 'Stunning 3BHK apartment with premium amenities in the heart of Bangalore. Recently renovated with smart home features.', 7500000, 'Whitefield, Bangalore', 12.9698, 77.7499, '["https://via.placeholder.com/400?text=Luxury+Apt+1", "https://via.placeholder.com/400?text=Luxury+Apt+2"]'::jsonb, '["Swimming Pool", "Gym", "24/7 Security", "Parking", "Garden"]'::jsonb, 3, 2, 1800.00, 'apartment', 'available', NOW(), NOW()),

-- Property 2: Priya - Commercial Plot
('priya-001', 'priya', 'Commercial Plot for Retail Business', 'Prime commercial plot in prime location. Perfect for retail store or office setup. High foot traffic area.', 5200000, 'Indiranagar, Bangalore', 12.9716, 77.6412, '["https://via.placeholder.com/400?text=Commercial+Plot+1", "https://via.placeholder.com/400?text=Commercial+Plot+2"]'::jsonb, '["Corner Plot", "Good Road Access", "High Visibility", "Near Metro"]'::jsonb, 0, 0, 2500.00, 'commercial', 'available', NOW(), NOW()),

-- Property 3: Bhima - Villa with Garden
('bhima-001', 'bhima', 'Spacious Independent Villa with Garden', '5BHK independent villa with large garden and swimming pool. Gated community with excellent security and maintenance.', 12500000, 'Koramangala, Bangalore', 12.9352, 77.6245, '["https://via.placeholder.com/400?text=Villa+1", "https://via.placeholder.com/400?text=Villa+2", "https://via.placeholder.com/400?text=Villa+3"]'::jsonb, '["Swimming Pool", "Garden", "Gated Community", "Backup Power", "Home Theater"]'::jsonb, 5, 4, 4000.00, 'villa', 'available', NOW(), NOW()),

-- Property 4: Prithvi - Studio Apartment
('prithvi-002', 'prithvi', 'Affordable Studio in Tech Park', 'Compact and well-designed studio apartment perfect for working professionals. Close to tech parks and metro station.', 2800000, 'Marathahalli, Bangalore', 12.9698, 77.7499, '["https://via.placeholder.com/400?text=Studio+1", "https://via.placeholder.com/400?text=Studio+2"]'::jsonb, '["Furnished", "Gym", "Parking", "Near Metro", "Power Backup"]'::jsonb, 1, 1, 450.00, 'apartment', 'available', NOW(), NOW());

-- Verify inserted data
SELECT COUNT(*) as total_properties FROM properties;
SELECT property_id, title, price, agency FROM properties ORDER BY created_at DESC LIMIT 4;
