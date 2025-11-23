# Quick Deployment Checklist

Follow these steps in order to deploy your app:

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] You have a Vercel account (sign up at vercel.com)
- [ ] You have a Supabase account (sign up at supabase.com)

## 📋 Step-by-Step Actions

### 1. Supabase Setup (5 minutes)
- [ ] Create new Supabase project
- [ ] Copy database connection string
- [ ] Run migrations: `DATABASE_URL="your-connection-string" npx prisma migrate deploy`

### 2. Vercel Deployment (5 minutes)
- [ ] Import GitHub repo to Vercel
- [ ] Add environment variables (see below)
- [ ] Deploy and get your URL

### 3. OAuth Configuration (5 minutes)
- [ ] Update Google OAuth callback URL
- [ ] Update GitHub OAuth callback URL
- [ ] Update `NEXTAUTH_URL` in Vercel

## 🔑 Required Environment Variables for Vercel

Add these in Vercel → Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
NEXTAUTH_SECRET=(generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🔗 OAuth Callback URLs to Update

**Google OAuth:**
- Redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
- JavaScript Origin: `https://your-app.vercel.app`

**GitHub OAuth:**
- Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

## 📚 Full Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

