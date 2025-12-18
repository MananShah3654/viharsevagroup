# Build & Release Checklist

## Pre-Build Checklist

### ✅ Code Review
- [ ] All domain URLs updated correctly
- [ ] BASE_URL is correct in `MainActivity.kt`
- [ ] Network security config has correct domains
- [ ] AndroidManifest has correct deep link hosts
- [ ] No debug code left in release build
- [ ] No test/placeholder content

### ✅ Version Update
- [ ] Update `versionCode` in `build.gradle.kts` (increment by 1)
- [ ] Update `versionName` in `build.gradle.kts` (e.g., "1.0.0")
- [ ] Update release notes

### ✅ Assets
- [ ] App icons replaced in all mipmap folders
- [ ] Icons are correct size and format
- [ ] Adaptive icon configured (Android 8+)

### ✅ Testing
- [ ] App tested on Android 7.0+ (API 24+)
- [ ] App tested on different screen sizes
- [ ] Website loads correctly
- [ ] Charts render properly
- [ ] Navigation works
- [ ] Offline handling works
- [ ] External links work
- [ ] File upload works (if applicable)
- [ ] No crashes or errors

## Build Process

### Step 1: Clean Project
```
Build → Clean Project
```

### Step 2: Generate Signed Bundle
```
Build → Generate Signed Bundle / APK
→ Android App Bundle
→ Select keystore (or create new)
→ Enter passwords
→ Select "release" build variant
→ Finish
```

### Step 3: Verify Output
- [ ] File created: `android/app/release/app-release.aab`
- [ ] File size is reasonable (usually 5-20 MB)
- [ ] No build errors

### Step 4: Test AAB (Optional)
```
bundletool build-apks --bundle=app-release.aab --output=app.apks
bundletool install-apks --apks=app.apks
```

## Pre-Upload Checklist

### ✅ AAB File
- [ ] `app-release.aab` generated successfully
- [ ] File tested on device (if possible)
- [ ] Version code is correct
- [ ] Version name is correct

### ✅ Keystore
- [ ] Keystore file backed up securely
- [ ] Keystore password saved securely
- [ ] Key alias password saved securely
- [ ] Keystore NOT committed to Git

### ✅ Store Assets
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG/JPG)
- [ ] Screenshots (at least 2, phone)
- [ ] App description written
- [ ] Short description written (80 chars max)

### ✅ App Information
- [ ] App name finalized
- [ ] Privacy policy URL ready (if needed)
- [ ] Content rating questionnaire completed
- [ ] Target audience selected

## Upload Checklist

### ✅ Google Play Console
- [ ] App created in Play Console
- [ ] AAB file uploaded to Production (or Testing)
- [ ] Release notes added
- [ ] Store listing completed
- [ ] Screenshots uploaded
- [ ] App icon uploaded
- [ ] Feature graphic uploaded
- [ ] Privacy policy added (if needed)
- [ ] Content rating completed
- [ ] All required sections completed

### ✅ Final Review
- [ ] All information is correct
- [ ] No typos in descriptions
- [ ] Screenshots show actual app
- [ ] App tested one more time
- [ ] Ready to submit

## Post-Upload

### ✅ Monitor
- [ ] Check Play Console for review status
- [ ] Respond to any review feedback
- [ ] Monitor crash reports (if enabled)
- [ ] Monitor user reviews

### ✅ Update Process (For Future Releases)
1. Update version code (+1)
2. Update version name
3. Make code changes
4. Test thoroughly
5. Build new AAB
6. Upload to Play Console
7. Submit for review

## Common Issues

### Issue: Build Fails
**Solution:**
- Clean project: `Build → Clean Project`
- Invalidate caches: `File → Invalidate Caches / Restart`
- Sync Gradle: `File → Sync Project with Gradle Files`

### Issue: Keystore Not Found
**Solution:**
- Check keystore path is correct
- Ensure keystore file exists
- Create new keystore if lost (but you'll need new package name)

### Issue: Version Code Error
**Solution:**
- Ensure version code is higher than previous release
- Check in Play Console what last version code was

### Issue: AAB Too Large
**Solution:**
- Enable ProGuard (already enabled)
- Check for large assets
- Use WebP images if possible
- Remove unused resources

## File Locations Reference

```
android/
├── app/
│   ├── build.gradle.kts          # Update version here
│   ├── release/
│   │   ├── app-release.aab       # Upload this to Play Store
│   │   └── app-release.apk       # Optional, for testing
│   └── release.keystore          # Keep secure, never upload
```

## Quick Commands

### Build Release AAB
```
./gradlew bundleRelease
```

### Build Release APK
```
./gradlew assembleRelease
```

### Install APK on Device
```
adb install app-release.apk
```

---

**Remember:**
- ✅ Upload `.aab` file to Play Store
- ✅ Keep keystore secure and backed up
- ✅ Test before uploading
- ✅ Complete all store listing sections

