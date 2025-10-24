# MapIt PostgreSQL Connection Guide

This project uses direct PostgreSQL connection for database access. Below is information about how the connection is configured and how to use it in your components.

## Configuration

The PostgreSQL connection is configured in `src/db/postgres.ts` with the following settings:

```
Connection String: postgres://postgres:NewStrongPass123@localhost:5432/mapit
Schema: public
```

## Server Configuration

```
Server Host: 127.0.0.1
Server Port: 3000
CORS Origins: http://localhost:8080, http://127.0.0.1:8080, http://localhost:5173, http://127.0.0.1:5173
CORS Max Age: 86400
```

## How to Use the PostgreSQL Service

The `postgresService` provides several methods for interacting with the database:

### Check Connection

```typescript
import postgresService from '../db/postgresService';

// Check if connected to the database
const isConnected = await postgresService.isConnected();
```

### Execute Custom Queries

```typescript
// Execute a custom SQL query
const results = await postgresService.executeQuery<YourType>('SELECT * FROM your_table WHERE condition = $1', [value]);
```

### Find Records

```typescript
// Find records in a table with conditions
const users = await postgresService.findAll('users', { role: 'admin' }, 10);
```

### Insert Records

```typescript
// Insert a new record
const newUser = await postgresService.insert('users', { 
  name: 'John Doe', 
  email: 'john@example.com' 
});
```

### Update Records

```typescript
// Update a record by ID
const updatedUser = await postgresService.update('users', 1, { 
  name: 'Jane Doe' 
});
```

### Delete Records

```typescript
// Delete a record by ID
const deleted = await postgresService.delete('users', 1);
```

## Database Status Component

The project includes a `DatabaseStatusComponent` that displays the current connection status with PostgreSQL.

To use this component in your pages:

```tsx
import { DatabaseStatusComponent } from './components/DatabaseStatus';

function YourComponent() {
  return (
    <div>
      <h1>Your Page</h1>
      <DatabaseStatusComponent />
      {/* Other components */}
    </div>
  );
}
```

## Setting Up the Database

Before using this application, you'll need to set up a PostgreSQL database with the following configuration:

1. Create a database named `mapit`
2. Set the username to `postgres` and password to `NewStrongPass123`
3. Ensure PostgreSQL is running on localhost:5432
4. Create any necessary tables for your application

You can modify the connection string in `src/db/postgres.ts` if you have different PostgreSQL credentials or settings.