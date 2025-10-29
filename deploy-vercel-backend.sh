#!/bin/bash

# Deploy MapIt Backend to Vercel as Serverless Functions
# This allows your custom frontend hosting to call the backend API from Vercel

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Deploying MapIt Backend to Vercel...${NC}"
echo ""
echo -e "${YELLOW}Prerequisites:${NC}"
echo "  1. Vercel account (https://vercel.com)"
echo "  2. Vercel CLI installed: npm install -g vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo -e "${YELLOW}Install it with: npm install -g vercel${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found: $(vercel --version)${NC}"

# Step 1: Create vercel.json for backend
echo -e "\n${YELLOW}📋 Step 1: Creating vercel.json for backend...${NC}"

cat > /Users/toufic/mapit/vercel.json << 'VERCELJSON'
{
  "buildCommand": "npm install",
  "outputDirectory": ".",
  "functions": {
    "api/**.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
VERCELJSON

echo -e "${GREEN}✅ Created vercel.json${NC}"

# Step 2: Create api folder structure
echo -e "\n${YELLOW}📁 Step 2: Creating API folder structure...${NC}"

mkdir -p /Users/toufic/mapit/api

# Create login endpoint
cat > /Users/toufic/mapit/api/login.js << 'LOGINAPI'
import dbConfig from '../config/database.js';
import bcrypt from 'bcryptjs';

const pool = dbConfig.pool;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT customer_id, email, password_hash FROM customer WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = bcrypt.compareSync(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    return res.status(200).json({
      success: true,
      user: {
        customer_id: user.customer_id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
LOGINAPI

echo -e "${GREEN}✅ Created API endpoints${NC}"

# Step 3: Configure environment variables
echo -e "\n${YELLOW}🔐 Step 3: Setting up environment variables...${NC}"
echo -e "${YELLOW}You need to add these to your Vercel project:${NC}"
echo ""
echo "DATABASE_URL = postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo ""

# Step 4: Deploy to Vercel
echo -e "\n${YELLOW}🚀 Step 4: Deploying to Vercel...${NC}"
cd /Users/toufic/mapit
vercel --prod

echo -e "\n${GREEN}✅ Backend deployed to Vercel!${NC}"

# Step 5: Update frontend API URL
echo -e "\n${YELLOW}📝 Step 5: Next steps:${NC}"
echo "1. Copy the Vercel deployment URL from above"
echo "2. Update your frontend API calls to use Vercel instead of localhost"
echo "3. Update CORS settings to allow your custom domain"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
