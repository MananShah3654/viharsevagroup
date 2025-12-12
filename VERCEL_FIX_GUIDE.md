# Vercel Backend API Not Working - Permanent Fix

## Problem
- `/ping` and `/api/*` endpoints not working on live domain
- Getting 405 errors or endpoints not found
- Backend serverless function not being built/deployed

## Root Cause
Vercel needs explicit configuration to:
1. Detect and build Python serverless functions
2. Install Python dependencies
3. Route requests correctly to the function

## Solution Applied

### 1. Added `functions` configuration in `vercel.json`
This tells Vercel to:
- Build the Python function at `backend/api/index.py`
- Include all backend files needed for the function
- Auto-detect Python runtime

### 2. Added `requirements.txt` in `backend/api/` directory
Vercel looks for `requirements.txt` in the same directory as the Python function to install dependencies.

### 3. Verified handler export
The `backend/api/index.py` file exports the `handler` which Vercel uses to invoke the function.

## Testing After Deployment

1. **Test ping endpoint:**
   ```
   https://naranpuraviharsevagroup.com/ping
   ```
   Should return: `{"message": "pong", "timestamp": "..."}`

2. **Test health endpoint:**
   ```
   https://naranpuraviharsevagroup.com/health
   ```
   Should return MongoDB connection status

3. **Test API endpoint:**
   ```
   https://naranpuraviharsevagroup.com/api/ping
   ```
   Should return: `{"message": "pong", "timestamp": "..."}`

4. **Test login (in browser console):**
   ```javascript
   fetch('/api/ping').then(r => r.json()).then(console.log)
   ```

## If Still Not Working

### Check Vercel Deployment Logs:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check "Function Logs" for errors

### Common Issues:

1. **Python dependencies not installing:**
   - Check if `backend/api/requirements.txt` exists
   - Verify all dependencies are listed
   - Check deployment logs for pip install errors

2. **Function not found:**
   - Verify `backend/api/index.py` exists
   - Check that `handler` is exported
   - Verify `functions` config in `vercel.json`

3. **Import errors:**
   - Check that `backend/server.py` is accessible
   - Verify path in `backend/api/index.py` is correct
   - Check deployment logs for import errors

4. **Environment variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Ensure these are set:
     - `MONGO_URL`
     - `DB_NAME`
     - `JWT_SECRET_KEY`
     - `CORS_ORIGINS` (optional)

## Alternative: Deploy Backend Separately

If Vercel serverless functions continue to have issues, consider deploying backend separately on:
- **Railway** (recommended - $5/month free credit)
- **Render** (free tier, spins down after inactivity)
- **Fly.io** (free tier)

Then update frontend `REACT_APP_BACKEND_URL` environment variable in Vercel.

