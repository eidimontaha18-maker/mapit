# PostgreSQL Database Connection for MapIt

This solution implements a complete PostgreSQL database connection interface that allows for CRUD operations (Create, Read, Update, Delete) on database tables.

## Configuration Values

The database connection is configured with the following values:

```
Server Host: 127.0.0.1
Server Port: 3000

DB URI: postgres://postgres:NewStrongPass123@localhost:5432/montaha
DB Schemas: public
DB Anonymous Role: anon

CORS Origins: http://localhost:8080, http://127.0.0.1:8080, http://localhost:5173, http://127.0.0.1:5173
CORS Max Age: 86400
```

## Files Created/Modified

1. **src/db/dbTypes.ts**: Types for database operations
2. **src/db/dbOperations.ts**: Main database operations module
3. **routes/db-routes.js**: Express API routes for database operations
4. **test-db-operations.js**: Script to test database operations
5. **public/db-manager.html**: Web interface for database management
6. **server.js**: Updated to include database routes and serve static files

## How to Use

### 1. Start the Server

```bash
node server.js
```

### 2. Test Database Connection

```bash
node test-db-operations.js
```

### 3. Use the Web Interface

Open your browser and navigate to:
```
http://localhost:3001/db-manager.html
```

### 4. API Endpoints

The following API endpoints are available for database operations:

- **GET /api/db/tables**: List all tables
- **GET /api/db/tables/:tableName**: Get all records from a table
- **GET /api/db/tables/:tableName/structure**: Get table structure
- **GET /api/db/tables/:tableName/:id**: Get a specific record by ID
- **POST /api/db/tables/:tableName**: Create a new record
- **PUT /api/db/tables/:tableName/:id**: Update a record
- **DELETE /api/db/tables/:tableName/:id**: Delete a record
- **POST /api/db/query**: Execute a custom SQL query

### 5. Using in Code

Import the database operations module in your code:

```javascript
import db from './src/db/dbOperations.js';

// Test connection
const connected = await db.testConnection();

// Get all records from a table
const customers = await db.getAll('customer');

// Get a record by ID
const customer = await db.getById('customer', 1);

// Insert a new record
const newCustomer = await db.insert('customer', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
});

// Update a record
const updatedCustomer = await db.update('customer', 1, {
  first_name: 'Jane'
});

// Delete a record
await db.remove('customer', 1);

// Execute a custom query
const result = await db.executeQuery('SELECT * FROM customer WHERE email LIKE $1', ['%example.com']);
```

## Security Notes

1. The database password is included in the connection string for demonstration purposes. In a production environment, this should be stored in environment variables or a secure configuration system.

2. The API allows execution of arbitrary SQL queries. In a production environment, this should be restricted to authorized users only.

3. Always validate and sanitize input data before using it in SQL queries to prevent SQL injection attacks.

## Troubleshooting

If you encounter connection issues:

1. Verify that PostgreSQL is running on localhost:5432
2. Check that the database 'montaha' exists
3. Verify the username and password are correct
4. Make sure the server is listening on port 3001