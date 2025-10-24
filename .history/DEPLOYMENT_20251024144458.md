# Deploying MapIt to Vercel

## Overview

Your MapIt application uses:
- **Frontend**: React + Vite (deployed to Vercel)
- **Database**: Neon PostgreSQL (already cloud-hosted)
- **Backend**: Serverless functions (Vercel API routes)

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"Add New Project"**
4. Import your `mapit` repository
5. Configure the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Add Environment Variables in Vercel

In your Vercel project settings, go to **Settings > Environment Variables** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_HOST` | `ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `neondb` |
| `DB_USER` | `neondb_owner` |
| `DB_PASSWORD` | `npg_myJ8NBtrH3xo` |

**Important**: Set these for all environments (Production, Preview, Development)

### 4. Deploy

Click **"Deploy"** and Vercel will:
1. Build your React application
2. Deploy serverless API functions
3. Connect to your Neon database

## API Endpoints (Serverless)

After deployment, your API endpoints will be:
- `https://your-app.vercel.app/api/login` - Customer login
- `https://your-app.vercel.app/api/admin/login` - Admin login
- Add more endpoints in the `/api` folder as needed

## Database Access

Your Neon PostgreSQL database is already cloud-hosted and accessible from anywhere. No additional configuration needed!

### Database Details:
- **Host**: ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech
- **Database**: neondb
- **Port**: 5432
- **SSL**: Required

## Troubleshooting

### Frontend can't connect to API
Update your API URLs in the frontend code to use relative paths:
- Change `http://127.0.0.1:3101/api/login` to `/api/login`

### Database connection fails
1. Verify environment variables in Vercel dashboard
2. Check that SSL is enabled in database connection
3. Verify Neon database is active

### Build fails
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify `vite.config.ts` is correct

## Local Development vs Production

### Local Development:
```bash
# Start backend server
npm run server

# Start frontend dev server (separate terminal)
npm run dev
```

### Production (Vercel):
- Frontend: Automatically built and deployed
- Backend: Serverless functions in `/api` folder
- Database: Neon PostgreSQL (same for local and production)

## Security Notes

⚠️ **Important**: 
1. Never commit `.env` file to GitHub
2. Store sensitive credentials only in Vercel environment variables
3. Consider implementing proper authentication tokens instead of storing passwords in plain text
4. Use bcrypt or similar for password hashing

## Next Steps

After deployment, you should:
1. Add more API endpoints as serverless functions
2. Implement proper authentication (JWT tokens)
3. Add password hashing (bcrypt)
4. Set up proper CORS policies
5. Add error monitoring (Sentry, LogRocket, etc.)

## Support

For issues with:
- **Vercel Deployment**: [Vercel Documentation](https://vercel.com/docs)
- **Neon Database**: [Neon Documentation](https://neon.tech/docs)
- **React + Vite**: [Vite Documentation](https://vitejs.dev)
