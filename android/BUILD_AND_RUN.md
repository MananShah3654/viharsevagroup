# Build and Run Instructions

## Quick Build & Run

### Method 1: Using Android Studio (Recommended)

#### Step 1: Open Project
1. **Open Android Studio**
2. **File → Open**
3. **Select** the `android/` folder
4. **Wait** for Gradle sync to complete (may take 2-5 minutes first time)

#### Step 2: Build Project
1. **Build → Make Project** (or press `Ctrl+F9` / `Cmd+F9`)
2. **Wait** for build to complete
3. **Check** for any errors in the Build panel

#### Step 3: Run on Device/Emulator

**Option A: Physical Device**
1. **Enable USB Debugging** on your Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. **Connect device** via USB
3. **Click Run** button (▶️) or press `Shift+F10` / `Ctrl+R`
4. **Select your device** from the list
5. **Wait** for app to install and launch

**Option B: Emulator**
1. **Tools → Device Manager**
2. **Create Virtual Device** (if needed) or **Start** existing one
3. **Click Run** button (▶️)
4. **Select emulator** from the list
5. **Wait** for app to install and launch

### Method 2: Using Command Line

#### Step 1: Navigate to Project
```bash
cd android
```

#### Step 2: Build Debug APK
```bash
./gradlew assembleDebug
```

#### Step 3: Install on Device
```bash
# Connect device first, then:
adb install app/build/outputs/apk/debug/app-debug.apk
```

#### Step 4: Run App
```bash
adb shell am start -n com.viharsevagroup.webviewapp/.MainActivity
```

## Build Release Version

### For Testing Release Build

#### Step 1: Generate Signed APK
1. **Build → Generate Signed Bundle / APK**
2. **Select "APK"**
3. **Select keystore** (or create new)
4. **Enter passwords**
5. **Select "release"** build variant
6. **Click Finish**

#### Step 2: Install Release APK
```bash
adb install app/release/app-release.apk
```

## Troubleshooting Build Issues

### Issue: Gradle Sync Failed

**Solution:**
```
File → Invalidate Caches / Restart
→ Invalidate and Restart
```

### Issue: Build Errors

**Check:**
1. **SDK installed**: Tools → SDK Manager → Check Android SDK
2. **JDK configured**: File → Project Structure → SDK Location
3. **Internet connection**: Gradle needs to download dependencies

### Issue: Device Not Detected

**Solution:**
```bash
# Check if device is connected
adb devices

# If no devices, try:
adb kill-server
adb start-server
adb devices
```

### Issue: App Crashes on Launch

**Check Logcat:**
```
View → Tool Windows → Logcat
→ Filter by "AndroidRuntime" or "WebView"
→ Look for error messages
```

## Testing Checklist

After building and running:

- [ ] App launches successfully
- [ ] Splash screen appears
- [ ] Website loads: `https://naranpuraviharsevagroup.com`
- [ ] Login works
- [ ] Dashboard loads
- [ ] **Charts render** (Vihar Trends, User Growth, Top Routes)
- [ ] Navigation works
- [ ] Pull-to-refresh works
- [ ] Back button works
- [ ] Offline handling works

## Debugging Charts

If charts still don't load:

### Step 1: Check Logcat
```bash
adb logcat | grep -E "WebView|chart|recharts|svg"
```

### Step 2: Enable WebView Debugging
1. **Open Chrome** browser
2. **Go to**: `chrome://inspect`
3. **Find** your app's WebView
4. **Click "inspect"**
5. **Check Console** for errors

### Step 3: Check Network
1. **In Chrome DevTools** (from step 2)
2. **Go to Network tab**
3. **Check** if API calls succeed
4. **Verify** data is loading

## Quick Commands Reference

```bash
# Clean build
./gradlew clean

# Build debug
./gradlew assembleDebug

# Build release
./gradlew assembleRelease

# Install debug APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Install release APK
adb install app/release/app-release.apk

# Uninstall app
adb uninstall com.viharsevagroup.webviewapp

# View logs
adb logcat | grep WebView

# Clear app data
adb shell pm clear com.viharsevagroup.webviewapp
```

## Next Steps After Running

1. **Test all features**
2. **Check charts render properly**
3. **Test on different devices** (if possible)
4. **Take screenshots** for Play Store
5. **Build release version** when ready

---

**Note**: If you encounter any build errors, check the error message in Android Studio's Build panel and fix accordingly.

