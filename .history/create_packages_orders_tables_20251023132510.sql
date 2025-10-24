-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    package_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    allowed_maps INTEGER NOT NULL,
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE RESTRICT
);

-- Insert default packages
INSERT INTO packages (name, price, allowed_maps, priority, active) VALUES
    ('free', 0.00, 1, 1, true),
    ('starter', 5.00, 3, 2, true),
    ('premium', 15.00, 30, 3, true)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_package_id ON orders(package_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_time ON orders(date_time);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(active);

-- Add comment descriptions
COMMENT ON TABLE packages IS 'Stores subscription packages with pricing and map limits';
COMMENT ON TABLE orders IS 'Stores customer package orders/subscriptions';
COMMENT ON COLUMN packages.allowed_maps IS 'Maximum number of maps allowed for this package';
COMMENT ON COLUMN packages.priority IS 'Display priority (lower number = higher priority)';
COMMENT ON COLUMN orders.status IS 'Order status: pending, completed, cancelled, expired';
