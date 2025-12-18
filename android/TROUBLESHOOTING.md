# Troubleshooting Guide

## Website Not Loading Properly

### Issue: Charts/React Components Not Rendering

**Symptoms:**
- Text appears but charts don't render
- "Vihar Trends", "User Growth", "Top Routes" show as text only
- Page looks broken or incomplete

**Solutions:**

1. **Check JavaScript is Enabled**
   - Already enabled in `MainActivity.kt`
   - Verify: `javaScriptEnabled = true`

2. **Check Network Security Config**
   - Ensure your domain is in `network_security_config.xml`
   - Check SSL certificate is valid

3. **Enable Debug Logging**
   - Check Logcat for errors
   - Look for "WebView" tag messages
   - Check for JavaScript errors

4. **Clear Cache and Reload**
   - Use menu → Clear Cache & Cookies
   - Or uninstall and reinstall app

5. **Check User Agent**
   - Some sites block custom user agents
   - Current setting uses default Chrome user agent
   - If issues persist, try removing user agent modification

### Issue: Blank Screen

**Solutions:**

1. **Check Internet Connection**
   - Verify device has internet
   - Check if website loads in browser

2. **Check BASE_URL**
   - Verify URL is correct in `MainActivity.kt`
   - Ensure URL includes `https://`
   - Test URL in browser first

3. **Check Domain Whitelist**
   - Verify domain in `network_security_config.xml`
   - Check `ALLOWED_DOMAINS` in `MainActivity.kt`

4. **Enable Debug Mode**
   - Add this to `MainActivity.kt` in `setupWebView()`:
   ```kotlin
   if (BuildConfig.DEBUG) {
       WebView.setWebContentsDebuggingEnabled(true)
   }
   ```

### Issue: SSL Errors

**Solutions:**

1. **Verify SSL Certificate**
   - Check website has valid SSL
   - Test in browser first

2. **Check Network Security Config**
   - Ensure domain is whitelisted
   - Verify `cleartextTrafficPermitted="false"`

### Issue: Charts Not Loading (Recharts)

**Solutions:**

1. **Enable Hardware Acceleration**
   - Already enabled: `webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null)`

2. **Check JavaScript Console**
   - Enable WebView debugging (see above)
   - Check for JavaScript errors in Logcat

3. **Verify React App Loads**
   - Check if React components mount
   - Verify API calls succeed

4. **Check CORS/Network Issues**
   - Ensure API endpoints are accessible
   - Check if API calls are blocked

### Debug Steps

1. **Enable WebView Debugging**
   Add to `MainActivity.kt`:
   ```kotlin
   if (BuildConfig.DEBUG) {
       WebView.setWebContentsDebuggingEnabled(true)
   }
   ```

2. **Check Logcat**
   ```bash
   adb logcat | grep -E "WebView|chromium|Console"
   ```

3. **Test in Chrome DevTools**
   - Enable debugging (step 1)
   - Open `chrome://inspect` in Chrome
   - Inspect WebView

4. **Test URL in Browser**
   - Open same URL in Chrome
   - Compare behavior
   - Check browser console for errors

### Common Fixes

**Fix 1: Add WebView Debugging**
```kotlin
// In setupWebView(), after webView settings
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

**Fix 2: Force Reload on Error**
```kotlin
// In onReceivedError handler
webView.reload()
```

**Fix 3: Add Retry Logic**
```kotlin
private var retryCount = 0
private fun loadUrlWithRetry(url: String) {
    if (retryCount < 3) {
        webView.loadUrl(url)
        retryCount++
    } else {
        showOfflineScreen()
    }
}
```

### Testing Checklist

- [ ] Website loads in browser
- [ ] SSL certificate is valid
- [ ] Domain is in whitelist
- [ ] JavaScript enabled
- [ ] Network available
- [ ] No console errors
- [ ] Charts render in browser
- [ ] API calls work in browser

### Still Not Working?

1. **Check Website Compatibility**
   - Test in Chrome mobile browser
   - Compare behavior

2. **Check WebView Version**
   - Update WebView in Play Store
   - Some features require newer WebView

3. **Check Device**
   - Test on different device
   - Check Android version (min: API 24)

4. **Contact Support**
   - Provide Logcat logs
   - Include device info
   - Describe exact issue

