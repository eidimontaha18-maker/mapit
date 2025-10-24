export const dbConfig = {
  serverHost: '127.0.0.1',
  serverPort: 3100,
  
  dbUri: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
  dbSchemas: ['public'],
  dbAnonRole: 'anon',
  
  // CORS
  serverCorsOrigins: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  serverCorsMaxAge: 86400,
};