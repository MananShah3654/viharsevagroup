# How to Test Backend API in Vercel

## 🔍 Quick Test Commands

Replace `your-project.vercel.app` with your actual Vercel domain.

### 1. Test Root Endpoints (Should work)
```bash
# Test ping endpoint
curl https://your-project.vercel.app/ping

# Test health endpoint
curl https://your-project.vercel.app/health
```

**Expected Response:**
```json
{"message": "pong", "timestamp": "2025-..."}
```

### 2. Test API Endpoints (Under /api)
```bash
# Test API ping (if exists)
curl https://your-project.vercel.app/api/ping

# Test login endpoint (POST)
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9429617099","password":"7488"}'
```

### 3. Test from Browser
Open these URLs in your browser:
- `https://your-project.vercel.app/ping`
- `https://your-project.vercel.app/health`
- `https://your-project.vercel.app/api/ping` (if exists)

---

## 🐛 Troubleshooting 405 Error

**405 Method Not Allowed** usually means:
1. Wrong HTTP method (using GET instead of POST, etc.)
2. Routing issue - endpoint not found
3. CORS issue (less common)

### Check 1: Verify Endpoint Exists
Look at your `backend/server.py`:
- Login endpoint: `POST /api/auth/login` ✅
- Ping endpoint: `GET /ping` ✅
- Health endpoint: `GET /health` ✅

### Check 2: Test Correct HTTP Method
```bash
# Login requires POST, not GET
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9429617099","password":"7488"}'
```

### Check 3: Check Vercel Function Logs
1. Go to Vercel Dashboard
2. Your Project → **Functions** tab
3. Click on `backend/api/index.py`
4. Check **Logs** for errors

### Check 4: Verify Routing
The issue might be that root endpoints (`/ping`, `/health`) aren't accessible because Vercel only routes `/api/*` to the backend.

---

## 🔧 Fix: Make All Endpoints Accessible

The Vercel configuration has been updated to route root endpoints (`/ping`, `/health`) to the backend.

### Updated Configuration:
- `/api/*` → Backend (all API routes)
- `/ping` → Backend (health check)
- `/health` → Backend (health check)
- Everything else → Frontend (React app)

---

## 📋 Step-by-Step Testing Guide

### Step 1: Test Basic Endpoints
```bash
# Replace with your Vercel domain
DOMAIN="https://your-project.vercel.app"

# Test ping (should work now)
curl $DOMAIN/ping

# Test health (should work now)
curl $DOMAIN/health

# Test API endpoint
curl $DOMAIN/api/ping
```

### Step 2: Test Login Endpoint
```bash
curl -X POST $DOMAIN/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9429617099","password":"7488"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {...}
}
```

### Step 3: Check Vercel Function Logs
1. Go to **Vercel Dashboard** → Your Project
2. Click **Functions** tab
3. Click on `backend/api/index.py`
4. Check **Logs** tab for any errors

### Step 4: Check Deployment Status
1. Go to **Deployments** tab
2. Check latest deployment status
3. If failed, click on it to see error logs

---

## 🐛 Common Issues & Solutions

### Issue 1: 405 Method Not Allowed
**Cause**: Wrong HTTP method or endpoint not found

**Solution**:
- Login requires `POST`, not `GET`
- Check endpoint URL is correct: `/api/auth/login`
- Verify the endpoint exists in `backend/server.py`

### Issue 2: 404 Not Found
**Cause**: Routing not working

**Solution**:
- Verify `vercel.json` has correct rewrites
- Check function exists at `backend/api/index.py`
- Redeploy after configuration changes

### Issue 3: 500 Internal Server Error
**Cause**: Backend code error or missing environment variables

**Solution**:
- Check Vercel Function Logs
- Verify all environment variables are set
- Check MongoDB connection string is correct

### Issue 4: CORS Error
**Cause**: CORS not configured correctly

**Solution**:
- Set `CORS_ORIGINS=*` in Vercel environment variables
- Or set to your specific domain

---

## ✅ Verification Checklist

- [ ] `/ping` endpoint returns `{"message": "pong", ...}`
- [ ] `/health` endpoint returns health status
- [ ] `/api/auth/login` accepts POST requests
- [ ] Vercel Function logs show no errors
- [ ] Environment variables are set correctly
- [ ] Deployment status is "Ready"

