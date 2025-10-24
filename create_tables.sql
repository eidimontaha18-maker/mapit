-- Create customer table
CREATE TABLE IF NOT EXISTS customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create map table
CREATE TABLE IF NOT EXISTS map (
    map_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    map_data JSONB,
    map_bounds JSONB,
    active BOOLEAN DEFAULT true,
    country VARCHAR(100),
    map_codes TEXT[]
);

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_map_active ON map(active);
CREATE INDEX IF NOT EXISTS idx_map_country ON map(country);

-- Add comment for documentation
COMMENT ON TABLE customer IS 'Stores customer information for the MapIt application';
COMMENT ON TABLE map IS 'Stores map data created by customers';
