# Testing API Endpoints on Live Domain

## Quick Test URLs

Test these URLs in your browser or using curl/Postman:

### 1. Health Check
```
https://naranpuraviharsevagroup.com/health
```
**Expected:** JSON response with status "healthy" and MongoDB connection info

### 2. Ping Endpoint
```
https://naranpuraviharsevagroup.com/ping
```
**Expected:** `{"message": "pong", "timestamp": "..."}`

### 3. API Health Check
```
https://naranpuraviharsevagroup.com/api/health
```
**Expected:** Same as `/health`

### 4. Login Endpoint (POST)
```
https://naranpuraviharsevagroup.com/api/auth/login
```
**Method:** POST
**Body:** 
```json
{
  "phone": "your_phone_number",
  "password": "your_password"
}
```

## Testing Methods

### Method 1: Browser Console
1. Open your website: https://naranpuraviharsevagroup.com
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Type: `fetch('/api/ping').then(r => r.json()).then(console.log)`
5. Press Enter
6. Should see: `{message: "pong", timestamp: "..."}`

### Method 2: Browser Direct URL
1. Open: https://naranpuraviharsevagroup.com/ping
2. Should see JSON response

### Method 3: Using curl (Command Line)
```bash
# Test ping
curl https://naranpuraviharsevagroup.com/ping

# Test health
curl https://naranpuraviharsevagroup.com/health

# Test login (replace with your credentials)
curl -X POST https://naranpuraviharsevagroup.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"your_phone","password":"your_password"}'
```

### Method 4: Using Postman
1. Create new request
2. URL: `https://naranpuraviharsevagroup.com/api/auth/login`
3. Method: POST
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "phone": "your_phone_number",
  "password": "your_password"
}
```

## Common Issues and Solutions

### Issue 1: 404 Not Found
**Problem:** API endpoint not found
**Solution:** 
- Check `vercel.json` rewrites are correct
- Ensure backend is deployed to Vercel
- Check Vercel deployment logs

### Issue 2: 500 Internal Server Error
**Problem:** Backend error
**Solution:**
- Check Vercel function logs
- Verify MongoDB connection
- Check environment variables in Vercel

### Issue 3: CORS Error
**Problem:** Cross-origin request blocked
**Solution:**
- Backend CORS should allow all origins (`*`)
- Check `backend/server.py` CORS configuration

### Issue 4: Network Error
**Problem:** Cannot connect to backend
**Solution:**
- Verify backend URL in browser console
- Check if API routes are working (test `/ping`)
- Ensure Vercel rewrites are configured correctly

## Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "Backend URL:" log message
   - Should show: `https://naranpuraviharsevagroup.com`

2. **Check Network Tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try to login
   - Check the failed request:
     - URL should be: `https://naranpuraviharsevagroup.com/api/auth/login`
     - Status code (404, 500, etc.)
     - Error message

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Select your project
   - Go to "Functions" tab
   - Check for errors in serverless function logs

4. **Verify Environment Variables:**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Ensure these are set:
     - `MONGO_URL`
     - `DB_NAME`
     - `JWT_SECRET_KEY`
     - `CORS_ORIGINS` (optional, defaults to `*`)

## Expected Behavior

✅ **Working:**
- `/ping` returns `{"message": "pong"}`
- `/health` returns MongoDB connection status
- `/api/auth/login` accepts POST requests with phone/password

❌ **Not Working:**
- 404 errors on API endpoints
- Network errors in browser console
- CORS errors
- 500 errors (check Vercel logs)

