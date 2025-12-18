# Running App with Localhost:3000

## Quick Setup

### Step 1: Start Your Website
```bash
# In your frontend folder
cd frontend
npm start
# Website runs on http://localhost:3000
```

### Step 2: Update Android App for Localhost

The app is already configured to use `http://10.0.2.2:3000` for Android emulator.

**For Android Emulator:**
- URL: `http://10.0.2.2:3000` (already set)
- `10.0.2.2` is the emulator's way to access your computer's localhost

**For Physical Device:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet address
   ```

2. Update `MainActivity.kt`:
   ```kotlin
   private const val BASE_URL = "http://192.168.1.100:3000"  // Your computer's IP
   ```

3. Make sure your phone and computer are on the same WiFi network

### Step 3: Build and Run

**Using Gradle:**
```bash
cd android

# Build debug APK
./gradlew assembleDebug

# Install on emulator/device
adb install app/build/outputs/apk/debug/app-debug.apk

# Or run directly
./gradlew installDebug
```

**Using Android Studio:**
1. Open `android/` folder
2. Click Run (▶️)
3. Select emulator or device

## Important Notes

### Android Emulator
- Use `10.0.2.2` instead of `localhost`
- This is already configured in the code

### Physical Device
- Use your computer's IP address (e.g., `192.168.1.100`)
- Both device and computer must be on same WiFi
- Firewall might block connection - allow port 3000

### Before Release
- Change `BASE_URL` back to production URL
- Set `usesCleartextTraffic="false"` in AndroidManifest.xml
- Remove localhost from network_security_config.xml

## Testing

1. Start website: `npm start` (runs on localhost:3000)
2. Build Android app: `./gradlew assembleDebug`
3. Install: `adb install app/build/outputs/apk/debug/app-debug.apk`
4. Run app - it should load your localhost:3000 website

## Troubleshooting

**Can't connect from emulator:**
- Check website is running on localhost:3000
- Verify URL is `http://10.0.2.2:3000`

**Can't connect from physical device:**
- Check computer's IP address
- Ensure same WiFi network
- Check firewall allows port 3000
- Try disabling firewall temporarily

**Charts not loading:**
- Check website works in browser first
- Verify API calls work
- Check Chrome DevTools in WebView

