import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mapit',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function createAdminTable() {
  try {
    console.log('Creating admin table...');
    
    // Create admin table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      )
    `);
    
    console.log('Admin table created successfully!');
    
    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email)
    `);
    
    console.log('Index created successfully!');
    
    // Hash the default admin password
    const defaultPassword = '123456';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    
    // Delete existing admin first to update password
    await pool.query(`DELETE FROM admin WHERE email = $1`, ['admin@mapit.com']);
    
    // Insert default admin
    await pool.query(`
      INSERT INTO admin (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
    `, ['admin@mapit.com', hashedPassword, 'Admin', 'User']);
    
    console.log('Default admin user created!');
    console.log('Email: admin@mapit.com');
    console.log('Password: 123456');
    console.log('⚠️  IMPORTANT: Please change this password after first login!');
    
    await pool.end();
  } catch (err) {
    console.error('Error creating admin table:', err);
    await pool.end();
    process.exit(1);
  }
}

createAdminTable();
