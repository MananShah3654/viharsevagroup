# Screenshots Requirements for Play Store

## Required Screenshots

### ✅ Phone Screenshots (Required)
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Aspect Ratio**: 16:9 or 9:16
- **Min Resolution**: 320px (shortest side)
- **Max Resolution**: 3840px (longest side)
- **Format**: PNG or JPG (24-bit)

### ✅ Tablet Screenshots (Optional but Recommended)
- **7-inch Tablet**: Minimum 1024x600
- **10-inch Tablet**: Minimum 1280x800
- **Format**: PNG or JPG

## How to Take Screenshots

### Method 1: Using Android Device

1. **Run your app on device**
   ```bash
   # Install app
   adb install app-release.apk
   
   # Or run from Android Studio
   ```

2. **Navigate to key screens:**
   - Home/Dashboard screen
   - Login screen
   - Main features (Vihars, Reports, etc.)
   - Charts/Graphs screen
   - Profile screen

3. **Take screenshots:**
   - **Physical buttons**: Power + Volume Down (hold for 1-2 seconds)
   - **Gesture**: Swipe down from top → Screenshot icon
   - **ADB command**: `adb shell screencap -p /sdcard/screenshot.png`

4. **Transfer to computer:**
   ```bash
   adb pull /sdcard/screenshot.png .
   ```

### Method 2: Using Android Studio Emulator

1. **Start emulator**
   ```
   Tools → Device Manager → Start emulator
   ```

2. **Run app on emulator**
   ```
   Run → Run 'app'
   ```

3. **Take screenshot**
   ```
   Click camera icon in emulator toolbar
   Or: View → Tool Windows → Logcat → Screenshot icon
   ```

4. **Save screenshots**
   - Screenshots saved automatically
   - Location: Usually in `android/app/captures/`

### Method 3: Using ADB Command Line

```bash
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# Pull to computer
adb pull /sdcard/screenshot.png screenshot1.png

# Repeat for multiple screens
```

## Recommended Screenshots (8 Total)

### 1. Splash Screen / Loading
- Shows app logo
- Professional first impression

### 2. Login Screen
- Shows authentication
- Clean, simple interface

### 3. Dashboard / Home Screen
- Main navigation
- Key features visible

### 4. All Vihars Screen
- Shows content listing
- Grid/List view

### 5. Vihar Details / Charts
- Shows "Vihar Trends" chart
- "User Growth" chart
- "Top Routes" chart
- Demonstrates data visualization

### 6. Reports Screen
- Shows reports/analytics
- Data presentation

### 7. Profile Screen
- User profile
- Settings/options

### 8. Menu / Settings
- Shows app menu
- Additional features

## Screenshot Editing Tips

### ✅ Do's:
- Use actual app screenshots
- Show real content (not placeholders)
- Ensure text is readable
- Show key features
- Use consistent device frame (optional)
- Add device frame for professional look (optional)

### ❌ Don'ts:
- Don't use mockups or designs
- Don't add fake content
- Don't blur sensitive information incorrectly
- Don't use outdated screenshots
- Don't show error screens
- Don't include personal/sensitive data

## Screenshot Specifications

### Standard Phone Sizes:
- **1080x1920** (Full HD) - Most common
- **1440x2560** (2K) - High-end devices
- **720x1280** (HD) - Budget devices

### Recommended Size:
- **1080x1920** (9:16 aspect ratio)
- Works for all devices
- Good quality

## Device Frame (Optional)

You can add device frames for professional look:

### Tools:
- **Screenshots.pro** (online)
- **MockUPhone** (online)
- **Device Frames** (Android Studio plugin)
- **Figma** (design tool)

### Steps:
1. Take screenshot
2. Upload to tool
3. Select device frame
4. Download framed screenshot

## Upload to Play Store

1. **Go to Play Console**
   - Store presence → Store listing

2. **Upload Screenshots**
   - Click "Add phone screenshots"
   - Upload 2-8 images
   - Drag to reorder (first is featured)

3. **Add Tablet Screenshots** (Optional)
   - Click "Add tablet screenshots"
   - Upload tablet versions

4. **Save**

## Quick Checklist

- [ ] At least 2 phone screenshots
- [ ] Screenshots show actual app
- [ ] Text is readable
- [ ] Key features visible
- [ ] No sensitive data shown
- [ ] Screenshots are recent
- [ ] Proper aspect ratio (9:16 or 16:9)
- [ ] Good quality (at least 1080px height)
- [ ] First screenshot is best one (featured)

## Example Screenshot Order

1. **Splash Screen** (First impression)
2. **Dashboard** (Main screen)
3. **Vihars List** (Content)
4. **Charts** (Data visualization)
5. **Reports** (Analytics)
6. **Profile** (User features)
7. **Menu** (Navigation)

---

**Pro Tip**: Take screenshots on a real device for best quality and realistic look!

