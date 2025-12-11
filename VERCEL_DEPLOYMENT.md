# Vercel Deployment Guide - Complete Setup

This guide will help you deploy both your **FastAPI backend** and **React frontend** to Vercel in a single project.

## 🎯 Why Vercel?

- ✅ **Free tier** with generous limits
- ✅ Deploy both frontend and backend together
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions (backend)
- ✅ Easy GitHub integration

## 📋 Prerequisites

1. GitHub account
2. Vercel account (free) - [vercel.com](https://vercel.com)
3. MongoDB Atlas account (already have this)

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure all files are committed and pushed to GitHub:
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up or log in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Select "Other" or "Create React App"
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install --legacy-peer-deps`
   - **Note**: Vercel will auto-detect the `vercel.json` configuration

4. **Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     MONGO_URL=your-mongodb-connection-string
     DB_NAME=ClusterCC
     JWT_SECRET_KEY=your-secret-key-here
     CORS_ORIGINS=*
     ```
   - Make sure to select "Production", "Preview", and "Development"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes first time)

#### Option B: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for settings:
     - Root directory: `.`
     - Build command: `cd frontend && npm install --legacy-peer-deps && npm run build`
     - Output directory: `frontend/build`

4. **Set Environment Variables**
   ```bash
   vercel env add MONGO_URL
   vercel env add DB_NAME
   vercel env add JWT_SECRET_KEY
   vercel env add CORS_ORIGINS
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🔧 Configuration Files

The following files have been created/updated:

### Root `vercel.json`
- Configures both frontend and backend
- Routes `/api/*` to backend
- Routes everything else to frontend

### `frontend/vercel.json`
- Frontend build configuration

### `backend/vercel.json`
- Backend serverless function configuration

### `backend/api/index.py`
- Serverless function entry point for FastAPI

---

## 🌐 How It Works

### URL Structure:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.vercel.app/api/*`

### Example:
- Frontend: `https://vihar-seva-group.vercel.app`
- Login API: `https://vihar-seva-group.vercel.app/api/auth/login`
- Health Check: `https://vihar-seva-group.vercel.app/api/health`

---

## ✅ Verify Deployment

### 1. Test Backend
```bash
curl https://your-project.vercel.app/api/ping
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{"message": "pong", "timestamp": "..."}
```

### 2. Test Frontend
- Open `https://your-project.vercel.app` in browser
- Check browser console (F12) - should see:
  ```
  Backend URL: https://your-project.vercel.app
  ```

### 3. Test Login
- Try logging in with your credentials
- Should work seamlessly!

---

## 🔄 Updating Your Deployment

### Automatic Updates:
- Every push to `main` branch automatically deploys
- Vercel creates preview deployments for pull requests

### Manual Redeploy:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" on latest deployment

---

## 🐛 Troubleshooting

### Backend Not Working

1. **Check Environment Variables**
   - Go to Project Settings > Environment Variables
   - Ensure all variables are set correctly

2. **Check Function Logs**
   - Go to Vercel Dashboard > Your Project > Functions
   - Check logs for errors

3. **Test API Endpoint**
   ```bash
   curl https://your-project.vercel.app/api/ping
   ```

### Frontend Not Loading

1. **Check Build Logs**
   - Go to Vercel Dashboard > Deployments
   - Click on failed deployment
   - Check build logs

2. **Verify Build Command**
   - Should be: `cd frontend && npm install --legacy-peer-deps && npm run build`

3. **Check Output Directory**
   - Should be: `frontend/build`

### CORS Errors

1. **Update CORS_ORIGINS**
   - Set to `*` for development
   - Or specific domain: `https://your-project.vercel.app`

2. **Check Backend CORS Configuration**
   - Already configured in `backend/server.py`

---

## 📝 Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `MONGO_URL` | ✅ Yes | `mongodb+srv://...` | MongoDB connection string |
| `DB_NAME` | ✅ Yes | `ClusterCC` | Database name |
| `JWT_SECRET_KEY` | ✅ Yes | `random-secret-key` | JWT signing key |
| `CORS_ORIGINS` | ⚠️ Recommended | `*` or `https://your-domain.com` | CORS allowed origins |

---

## 🎉 You're Done!

After deployment:
1. Your frontend is live at: `https://your-project.vercel.app`
2. Your backend API is at: `https://your-project.vercel.app/api/*`
3. Everything works together automatically!

### Next Steps:
- Set up custom domain (optional)
- Configure MongoDB IP whitelist to allow Vercel IPs (or use `0.0.0.0/0`)
- Test all functionality

---

## 💡 Tips

1. **MongoDB Atlas**: Make sure your MongoDB Atlas network access allows all IPs (`0.0.0.0/0`) or add Vercel's IP ranges

2. **Cold Starts**: First request to backend might take 1-2 seconds (serverless cold start), subsequent requests are fast

3. **Free Tier Limits**:
   - 100GB bandwidth/month
   - Unlimited serverless function invocations
   - 100 hours execution time/month

4. **Custom Domain**: You can add a custom domain in Vercel project settings

---

## 🆘 Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Check deployment logs in Vercel Dashboard

