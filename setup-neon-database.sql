-- MapIt Neon Database Setup Script
-- Run this in your Neon SQL Editor

-- Create customers table (plural to match API code)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table (plural to match API code)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create maps table
CREATE TABLE IF NOT EXISTS maps (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    map_data JSONB,
    map_bounds JSONB,
    active BOOLEAN DEFAULT true,
    country VARCHAR(100)
);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    map_id INTEGER REFERENCES maps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    coordinates JSONB,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES packages(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_maps_customer ON maps(customer_id);
CREATE INDEX IF NOT EXISTS idx_maps_active ON maps(active);
CREATE INDEX IF NOT EXISTS idx_zones_map ON zones(map_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Insert a test customer (password: test123)
INSERT INTO customers (email, password, first_name, last_name)
VALUES ('test@mapit.com', 'test123', 'Test', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert a test admin (password: admin123)
INSERT INTO admins (email, password, first_name, last_name)
VALUES ('admin@mapit.com', 'admin123', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert sample packages
INSERT INTO packages (name, description, price, duration_days, features, active)
VALUES 
    ('Basic', 'Perfect for individuals', 9.99, 30, '["Up to 5 maps", "Basic zones", "Email support"]'::jsonb, true),
    ('Pro', 'For small businesses', 29.99, 30, '["Unlimited maps", "Advanced zones", "Priority support", "Export data"]'::jsonb, true),
    ('Enterprise', 'For large organizations', 99.99, 30, '["Everything in Pro", "Custom domains", "API access", "Dedicated support"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Show success message
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS customer_count FROM customers;
SELECT COUNT(*) AS admin_count FROM admins;
SELECT COUNT(*) AS package_count FROM packages;
