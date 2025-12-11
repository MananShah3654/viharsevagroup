# Backend Deployment Guide

**Note:** This guide is for deploying backend separately. For deploying both frontend and backend together on Vercel, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

If you need to deploy backend separately, here are deployment options:

## 🆓 Free Options Comparison

| Platform | Free Tier | Limitations | Best For |
|----------|-----------|-------------|----------|
| **Railway** | ✅ $5/month credit | Limited resources, may need to upgrade | Small to medium apps |
| **Render** | ✅ Free tier | Spins down after 15min inactivity, slow cold starts | Development/testing |
| **Fly.io** | ✅ Free tier | Limited resources, 3 shared VMs | Small apps |
| **PythonAnywhere** | ✅ Free tier | Limited to 1 web app, subdomain only | Learning/testing |
| **Replit** | ✅ Free tier | Limited resources, public by default | Prototyping |
| **Vercel** | ✅ Free tier | Serverless functions, 100GB bandwidth/month | Serverless apps |
| **Heroku** | ❌ No free tier | Paid plans only (removed free tier in 2022) | - |

---

## Option 1: Railway (Recommended - Easiest) 🆓 FREE TIER AVAILABLE

**Free Tier:** $5/month credit (usually enough for small apps)

### Steps:
1. **Sign up at [railway.app](https://railway.app)** (Free tier available)
2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
3. **Configure Service**
   - Railway will auto-detect Python
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables**
   - Go to Variables tab
   - Add:
     - `MONGO_URL`: Your MongoDB connection string
     - `DB_NAME`: `ClusterCC`
     - `JWT_SECRET_KEY`: (Generate a secure random string)
     - `CORS_ORIGINS`: `*` (or your frontend domain)
5. **Deploy**
   - Railway will automatically deploy
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

**Note:** Free tier includes $5 credit/month. For most small apps, this is sufficient. You'll only be charged if you exceed the credit.

### Update Frontend:
- If using Vercel: Backend URL is automatically detected (same domain)
- If using other frontend host: Set `REACT_APP_BACKEND_URL` = `https://your-app.railway.app`

---

## Option 2: Render 🆓 FREE TIER AVAILABLE (with limitations)

**Free Tier:** Available, but spins down after 15 minutes of inactivity (takes ~30 seconds to wake up)

### Steps:
1. **Sign up at [render.com](https://render.com)** (Free tier available)
2. **Create New Web Service**
   - Connect your GitHub repository
   - Select "Web Service"
3. **Configure**
   - **Name**: `vihar-seva-group-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
   - **Plan**: Select "Free" plan
4. **Set Environment Variables**
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: `ClusterCC`
   - `JWT_SECRET_KEY`: (Generate a secure random string)
   - `CORS_ORIGINS`: `*`
5. **Deploy**
   - Click "Create Web Service"
   - Copy the URL (e.g., `https://vihar-seva-group-api.onrender.com`)

**Note:** Free tier spins down after inactivity. First request after spin-down takes ~30 seconds. Consider upgrading to paid plan ($7/month) for always-on service.

### Update Frontend:
- If using Vercel: Backend URL is automatically detected (same domain)
- If using other frontend host: Set `REACT_APP_BACKEND_URL` = `https://vihar-seva-group-api.onrender.com`

---

## Option 3: Fly.io 🆓 FREE TIER AVAILABLE

**Free Tier:** 3 shared VMs, 3GB persistent storage

### Steps:
1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```
2. **Sign up at [fly.io](https://fly.io)** (Free tier available)
3. **Login and Create App**
   ```bash
   fly auth login
   cd backend
   fly launch
   ```
4. **Configure**
   - Follow prompts
   - Set environment variables in `fly.toml` or via CLI:
   ```bash
   fly secrets set MONGO_URL="your-mongodb-url"
   fly secrets set DB_NAME="ClusterCC"
   fly secrets set JWT_SECRET_KEY="your-secret-key"
   fly secrets set CORS_ORIGINS="*"
   ```
5. **Deploy**
   ```bash
   fly deploy
   ```

---

## Option 4: PythonAnywhere 🆓 FREE TIER AVAILABLE

**Note:** Heroku removed their free tier in November 2022. Paid plans start at $5/month.

### Steps:
1. **Install Heroku CLI** and login
2. **Create Heroku App**
   ```bash
   cd backend
   heroku create vihar-seva-group-api
   ```
3. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URL="your-mongodb-url"
   heroku config:set DB_NAME="ClusterCC"
   heroku config:set JWT_SECRET_KEY="your-secret-key"
   heroku config:set CORS_ORIGINS="*"
   ```
4. **Deploy**
   ```bash
   git push heroku main
   ```

### Update Frontend:
- If using Vercel: Backend URL is automatically detected (same domain)
- If using other frontend host: Set `REACT_APP_BACKEND_URL` = `https://vihar-seva-group-api.herokuapp.com`

---

**Free Tier:** 1 web app, subdomain only (yourusername.pythonanywhere.com), limited CPU time

### Steps:
1. **Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)** (Free tier available)
2. **Upload Files**
   - Go to Files tab
   - Upload your `backend` folder
3. **Configure Web App**
   - Go to Web tab
   - Click "Add a new web app"
   - Select "Manual configuration"
   - Python version: 3.11
4. **Set WSGI File**
   - Edit WSGI configuration file
   - Point to your `server.py`:
   ```python
   import sys
   path = '/home/yourusername/backend'
   if path not in sys.path:
       sys.path.append(path)
   
   from server import app
   application = app
   ```
5. **Set Environment Variables**
   - Add in Web app settings or in WSGI file
6. **Reload Web App**

**Note:** Free tier has limited CPU time and subdomain only. Good for testing.

---

## Option 5: Vercel 🆓 FREE TIER AVAILABLE (Serverless)

**Free Tier:** Unlimited serverless function invocations, 100GB bandwidth/month, always-on

### Steps:
1. **Sign up at [vercel.com](https://vercel.com)** (Free tier available)
2. **Install Vercel CLI** (optional, can use web interface)
   ```bash
   npm i -g vercel
   ```
3. **Deploy via Web Interface**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: Set to `backend`
   - **Framework Preset**: Select "Other" or "Python"
   - **Build Command**: Leave empty (or `pip install -r requirements.txt`)
   - **Output Directory**: Leave empty
   - Click "Deploy"

4. **Deploy via CLI** (Alternative)
   ```bash
   cd backend
   vercel login
   vercel
   ```
   - Follow the prompts
   - When asked for settings, use defaults

5. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add:
     - `MONGO_URL`: Your MongoDB connection string
     - `DB_NAME`: `ClusterCC`
     - `JWT_SECRET_KEY`: (Generate a secure random string)
     - `CORS_ORIGINS`: `*` (or your frontend domain)

6. **Redeploy**
   - After adding environment variables, redeploy
   - Go to Deployments tab > Click "Redeploy"

### Update Frontend:
- If using Vercel: Backend URL is automatically detected (same domain)
- If using other frontend host: Set `REACT_APP_BACKEND_URL` = `https://your-project.vercel.app`

**Note:** Vercel uses serverless functions, so your FastAPI app will be split into serverless functions. This works well for most APIs. The first request might have a cold start (~1-2 seconds), but subsequent requests are fast.

**Important:** Make sure you have `vercel.json` in your `backend` folder (already created).

---

## Option 6: Heroku ❌ NO FREE TIER (Paid Only)

---

## Important Notes:

### CORS Configuration:
After deployment, update CORS in `backend/server.py` to allow your frontend domain:
```python
allow_origins=[
    "https://your-frontend-domain.com",
    "https://your-custom-domain.com"
]
```

### MongoDB:
- Your MongoDB Atlas cluster should already be accessible
- Make sure your MongoDB IP whitelist includes `0.0.0.0/0` (all IPs) or the deployment platform's IPs

### Testing:
After deployment, test the backend:
```bash
curl https://your-backend-url.com/ping
curl https://your-backend-url.com/health
```

### Update Frontend:
Once backend is deployed:
- **If using Vercel**: Backend URL is automatically detected (same domain)
- **If using other frontend host**: Set `REACT_APP_BACKEND_URL` = Your deployed backend URL

---

---

## 🎯 Recommended Free Options:

### Best Overall: **Railway** 🥇
- ✅ $5/month free credit (usually enough)
- ✅ Easy setup
- ✅ Always-on service
- ✅ Good performance

### Best for Testing: **Render** 🥈
- ✅ Completely free
- ⚠️ Spins down after inactivity (slow first request)
- ✅ Good for development/testing

### Best for Learning: **PythonAnywhere** 🥉
- ✅ Completely free
- ✅ Simple setup
- ⚠️ Limited resources, subdomain only

---

## Quick Start (Railway - Recommended):

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project > Deploy from GitHub
4. Select your repo
5. Add environment variables
6. Copy the URL
7. **If using Vercel**: Backend URL is automatically detected
   **If using other frontend host**: Set `REACT_APP_BACKEND_URL` environment variable
8. Redeploy frontend

Done! 🎉

