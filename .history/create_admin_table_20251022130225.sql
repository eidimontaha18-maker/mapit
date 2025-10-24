-- Create admin table for admin dashboard access
CREATE TABLE IF NOT EXISTS admin (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);

-- Add comment for documentation
COMMENT ON TABLE admin IS 'Stores admin credentials for accessing the admin dashboard';

-- Insert a default admin (password: admin123)
-- You should change this password after first login
INSERT INTO admin (email, password_hash, first_name, last_name)
VALUES ('admin@mapit.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;
