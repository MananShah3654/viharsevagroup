# Vihar Seva Group - Android WebView App

A production-ready Android app that wraps the Vihar Seva Group website in a secure WebView.

## Quick Start - What to Upload

**You only need to upload ONE file to Play Store:**
- `app-release.aab` (Android App Bundle)

**See `WEBVIEW_UPLOAD_GUIDE.md` for complete instructions.**

## Features

- ✅ **Play Store Safe**: Minimal permissions, HTTPS only, secure defaults
- ✅ **Secure WebView**: No file access, mixed content blocked, safe browsing enabled
- ✅ **Great UX**: Loading progress, pull-to-refresh, offline handling
- ✅ **External Links**: Opens tel:, mailto:, maps, payment apps natively
- ✅ **File Upload**: Supports file uploads from web (input type=file)
- ✅ **Session Cookies**: Supports authentication and session management

## How to Change BASE_URL

1. **Update MainActivity.kt**:
   ```kotlin
   private const val BASE_URL = "https://your-new-domain.com"
   ```

2. **Update network_security_config.xml**:
   ```xml
   <domain includeSubdomains="true">your-new-domain.com</domain>
   <domain includeSubdomains="true">www.your-new-domain.com</domain>
   ```

3. **Update AndroidManifest.xml** (deep links):
   ```xml
   <data android:scheme="https" android:host="your-new-domain.com" />
   ```

## Allowed Domains

The app only loads content from these domains:
- `naranpuraviharsevagroup.com`
- `www.naranpuraviharsevagroup.com`

To add more domains, update:
1. `MainActivity.ALLOWED_DOMAINS`
2. `network_security_config.xml`
3. `AndroidManifest.xml` (for deep links)

## Policy Notes

### Security Settings
- **Mixed Content**: `NEVER_ALLOW` - Blocks HTTP resources on HTTPS pages
- **File Access**: `DISABLED` - No access to file system except user-initiated uploads
- **Cleartext Traffic**: `BLOCKED` - Only HTTPS connections allowed
- **Safe Browsing**: `ENABLED` - Google's safe browsing protection

### Permissions
- **INTERNET**: Required for WebView to load web content
- **ACCESS_NETWORK_STATE**: Used to detect offline state
- **No other permissions** - Play Store safe

### Third-Party Cookies
- Currently **ENABLED** (common requirement for login/auth flows)
- To disable: Set `thirdPartyCookiesEnabled = false` in `MainActivity.kt`

## Building

1. Open project in Android Studio
2. Sync Gradle files
3. Build → Make Project
4. Run on device/emulator

## Release Build

1. Build → Generate Signed Bundle / APK
2. Use the provided ProGuard rules
3. Test thoroughly before publishing

## Analytics (Optional)

Analytics stubs are included but **OFF by default** for privacy. To enable:
1. Add Firebase/analytics dependency
2. Initialize in `ViharSevaGroupApplication.kt`
3. Update privacy policy

## Troubleshooting

### SSL Errors
- Check that your website has valid SSL certificate
- Ensure domain matches in `network_security_config.xml`

### File Upload Not Working
- Check that FileProvider is configured correctly
- Ensure `file_paths.xml` includes required directories

### External Links Not Opening
- Check `handleExternalLink()` in `MainActivity.kt`
- Add new schemes/domains as needed

## License

Copyright © 2024 Vihar Seva Group

