# Quick Start Guide

## Setup Instructions

1. **Open in Android Studio**
   - File → Open → Select the `android` folder
   - Wait for Gradle sync to complete

2. **Update BASE_URL** (if needed)
   - Open `app/src/main/java/com/viharsevagroup/webviewapp/MainActivity.kt`
   - Change `BASE_URL` constant (line ~25)

3. **Update Allowed Domains** (if needed)
   - `MainActivity.kt` - Update `ALLOWED_DOMAINS` list
   - `network_security_config.xml` - Add domain entries
   - `AndroidManifest.xml` - Update deep link hosts

4. **Add App Icon**
   - Replace `ic_launcher.png` and `ic_launcher_foreground.png` in:
     - `app/src/main/res/mipmap-mdpi/`
     - `app/src/main/res/mipmap-hdpi/`
     - `app/src/main/res/mipmap-xhdpi/`
     - `app/src/main/res/mipmap-xxhdpi/`
     - `app/src/main/res/mipmap-xxxhdpi/`

5. **Build & Run**
   - Click "Run" button or press Shift+F10
   - Select device/emulator

## Testing Checklist

- [ ] App loads website correctly
- [ ] Progress bar shows during loading
- [ ] Pull-to-refresh works
- [ ] Back button navigates WebView history
- [ ] Offline screen appears when no internet
- [ ] Retry button works when offline
- [ ] External links (tel:, mailto:) open in native apps
- [ ] File upload works (if your site has file inputs)
- [ ] Menu → Clear Cache works
- [ ] Deep links work (if configured)

## Release Checklist

- [ ] Update version code and name in `build.gradle.kts`
- [ ] Generate signed APK/Bundle
- [ ] Test on multiple devices
- [ ] Verify SSL certificate is valid
- [ ] Test offline functionality
- [ ] Review ProGuard rules
- [ ] Update app icon and splash screen
- [ ] Prepare Play Store listing

## Common Issues

**SSL Errors**: Ensure your website has valid SSL certificate

**File Upload Not Working**: Check FileProvider configuration in `AndroidManifest.xml`

**External Links Not Opening**: Check `handleExternalLink()` in `MainActivity.kt`

**App Crashes on Launch**: Check Logcat for errors, verify BASE_URL is correct

