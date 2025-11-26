# Deployment Guide: Vercel + Supabase

This guide will walk you through deploying your ReadHub to Vercel with a Supabase PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)

## Step 1: Push Code to GitHub

1. If you haven't already, initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/readhub.git
   git push -u origin main
   ```

## Step 2: Set Up Supabase Database

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Click "New Project"

2. **Create New Project**
   - Enter project name: `readhub`
   - Enter a database password (save this securely!)
   - Choose a region closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for project setup

3. **Get Database Connection String**
   - In your Supabase project dashboard, go to **Settings** → **Database**
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
   - Replace `[YOUR-PASSWORD]` with the password you set when creating the project
   - Save this connection string - you'll need it for Vercel

4. **Run Database Migrations**
   - In Supabase dashboard, go to **SQL Editor**
   - Click "New query"
   - You can run migrations manually, OR:
   - Use Prisma Migrate (recommended):
     ```bash
     # Set your DATABASE_URL temporarily
     export DATABASE_URL="your-supabase-connection-string"
     npx prisma migrate deploy
     ```
   - Or use Prisma Studio to verify tables are created:
     ```bash
     DATABASE_URL="your-supabase-connection-string" npx prisma studio
     ```

## Step 3: Deploy to Vercel

1. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your `readhub` repository
   - Click "Import"

2. **Configure Build Settings**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `readhub` (if your repo has this folder)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables**
   Before deploying, add these environment variables in Vercel:
   
   Click "Environment Variables" and add:
   
   | Variable | Value | Notes |
   |----------|-------|-------|
   | `DATABASE_URL` | Your Supabase connection string | From Step 2 |
   | `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Generate a new one for production |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Will be your Vercel URL after first deploy |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | From Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | From Google Cloud Console |
   | `GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID | From GitHub Developer Settings |
   | `GITHUB_CLIENT_SECRET` | Your GitHub OAuth Client Secret | From GitHub Developer Settings |

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Note your deployment URL (e.g., `https://readhub.vercel.app`)

## Step 4: Update OAuth Callback URLs

After deployment, you need to update your OAuth apps with the production callback URLs.

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
6. Click "Save"

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://your-app.vercel.app/api/auth/callback/github
   ```
4. Click "Update application"

## Step 5: Update NEXTAUTH_URL in Vercel

1. Go back to Vercel dashboard
2. Go to your project → **Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` to your actual Vercel URL:
   ```
   https://your-app.vercel.app
   ```
4. Click "Save"
5. Go to **Deployments** tab
6. Click the three dots on the latest deployment → **Redeploy**

## Step 6: Verify Deployment

1. Visit your Vercel URL
2. Try signing in with Google or GitHub
3. Test adding a book
4. Test logging reading progress
5. Check the leaderboard

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct in Vercel environment variables
- Check that you replaced `[YOUR-PASSWORD]` in the connection string
- Ensure Supabase project is active (not paused)

### OAuth Not Working

- Verify callback URLs are correct in Google/GitHub OAuth settings
- Check `NEXTAUTH_URL` matches your Vercel domain exactly
- Ensure `NEXTAUTH_SECRET` is set in Vercel

### Build Failures

- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel auto-detects, but you can set it in `package.json`)

### Migration Issues

- If tables don't exist, run migrations manually in Supabase SQL Editor
- Or use Prisma Migrate with your production DATABASE_URL

## Post-Deployment

### Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and OAuth callback URLs with new domain

### Monitoring

- Vercel provides analytics and logs in the dashboard
- Supabase dashboard shows database usage and performance

## Cost

Both Vercel and Supabase have generous free tiers:
- **Vercel**: Free for personal projects (unlimited deployments)
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth, unlimited API requests

This setup should be completely free for a personal project!

