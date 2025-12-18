# Screenshots Guide for Play Store

## Required Screenshots

### Phone Screenshots (Required)
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Aspect Ratio**: 16:9 or 9:16
- **Min Resolution**: 320px (shortest side)
- **Max Resolution**: 3840px (longest side)
- **Format**: PNG or JPG

### Tablet Screenshots (Optional but Recommended)
- **7-inch Tablet**: 1024x600 minimum
- **10-inch Tablet**: 1280x800 minimum

## How to Take Screenshots

### Method 1: Using Android Studio Emulator

1. **Start Emulator**
   ```
   Android Studio → Tools → Device Manager
   → Create/Start Virtual Device
   → Select device (e.g., Pixel 5)
   ```

2. **Install Your App**
   ```
   Run → Run 'app'
   → Select emulator
   → Wait for app to install and open
   ```

3. **Take Screenshots**
   - **Option A**: Click camera icon in emulator toolbar
   - **Option B**: Press `Ctrl + S` (Windows) or `Cmd + S` (Mac)
   - **Option C**: Use emulator menu → Screenshot

4. **Screenshots Location**
   - Saved automatically
   - Or use: `View → Tool Windows → Device File Explorer`
   - Navigate to: `/sdcard/Pictures/Screenshots/`

### Method 2: Using Physical Device

1. **Enable Developer Options**
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging**
   - Settings → Developer Options → USB Debugging

3. **Connect Device**
   - Connect via USB
   - Allow USB debugging on device

4. **Install App**
   ```bash
   adb install app-release.apk
   ```

5. **Take Screenshots**
   - Use device screenshot: Power + Volume Down
   - Or use ADB: `adb shell screencap -p /sdcard/screenshot.png`
   - Pull screenshot: `adb pull /sdcard/screenshot.png`

### Method 3: Using Android Studio Device Manager

1. **Open Device Manager**
   ```
   Tools → Device Manager
   ```

2. **Create Virtual Device**
   - Click "Create Device"
   - Select device (Pixel 5 recommended)
   - Select system image (latest Android)
   - Finish

3. **Run App**
   - Click Run button
   - Select virtual device
   - App opens in emulator

4. **Take Screenshots**
   - Click camera icon in toolbar
   - Or use menu: More → Screenshot

## Recommended Screenshots to Take

### 1. Home/Landing Page
- **What**: First screen users see
- **Why**: Shows app purpose
- **Tip**: Make sure website loads properly

### 2. Login Screen
- **What**: Authentication page
- **Why**: Shows user can log in
- **Tip**: Use demo/test account (blur sensitive data if needed)

### 3. Dashboard (User View)
- **What**: Main dashboard after login
- **Why**: Shows main functionality
- **Tip**: Show key features visible

### 4. Dashboard (Admin View) - If Applicable
- **What**: Admin dashboard with charts
- **Why**: Shows advanced features
- **Tip**: Highlight "Vihar Trends", "User Growth", "Top Routes" charts

### 5. Vihars List/Grid
- **What**: List of vihars
- **Why**: Shows content organization
- **Tip**: Show multiple items visible

### 6. Profile/Settings
- **What**: User profile page
- **Why**: Shows personalization
- **Tip**: Show key profile fields

### 7. Reports/Analytics
- **What**: Reports or analytics page
- **Why**: Shows data visualization
- **Tip**: Show charts/graphs clearly

### 8. Offline Screen (Optional)
- **What**: Offline error screen
- **Why**: Shows app handles errors gracefully
- **Tip**: Shows "Retry" button

## Screenshot Best Practices

### ✅ Do's
- ✅ Show actual app content (not placeholders)
- ✅ Use high resolution (at least 1080p)
- ✅ Show key features clearly
- ✅ Use consistent device/theme
- ✅ Show real data (or realistic demo data)
- ✅ Highlight important UI elements
- ✅ Use good lighting/contrast

### ❌ Don'ts
- ❌ Don't use placeholder text
- ❌ Don't show personal/sensitive data
- ❌ Don't use low resolution
- ❌ Don't mix different devices
- ❌ Don't show error states (unless demonstrating error handling)
- ❌ Don't use outdated UI

## Screenshot Editing (Optional)

### Tools
- **Android Studio**: Built-in screenshot tool
- **Photoshop/GIMP**: For editing
- **Figma**: For adding frames/annotations
- **Canva**: For quick edits

### Common Edits
1. **Add Device Frame** (Optional)
   - Makes screenshots look professional
   - Use tools like: Screenshot Framer, Device Frames

2. **Add Annotations** (Optional)
   - Highlight key features
   - Add callouts or arrows
   - Use sparingly

3. **Blur Sensitive Data**
   - Blur phone numbers, emails
   - Blur personal information
   - Use blur tool in image editor

## Screenshot Checklist

### Before Taking Screenshots
- [ ] App is fully functional
- [ ] Website loads correctly
- [ ] All features working
- [ ] No placeholder content
- [ ] Test data prepared (if needed)

### Screenshots to Take
- [ ] Home/Landing page
- [ ] Login screen
- [ ] Dashboard (main view)
- [ ] Content list/grid
- [ ] Profile/Settings
- [ ] Reports/Analytics (if applicable)
- [ ] Key feature screens

### After Taking Screenshots
- [ ] Check resolution (at least 1080p)
- [ ] Verify aspect ratio (16:9 or 9:16)
- [ ] Check file size (not too large)
- [ ] Remove sensitive data
- [ ] Organize files by name (screenshot1.png, screenshot2.png)

## File Naming Convention

```
screenshot-1-home.png
screenshot-2-login.png
screenshot-3-dashboard.png
screenshot-4-vihars.png
screenshot-5-profile.png
screenshot-6-reports.png
```

## Upload to Play Store

1. **Go to Play Console**
   - Store presence → Store listing

2. **Upload Screenshots**
   - Click "Add phone screenshot"
   - Upload files (drag & drop or browse)
   - Reorder by dragging

3. **Add Tablet Screenshots** (Optional)
   - Click "Add tablet screenshot"
   - Upload tablet versions

4. **Preview**
   - Check how they look in preview
   - Ensure order is correct

## Quick Screenshot Script

### Using ADB (Command Line)

```bash
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# Pull to computer
adb pull /sdcard/screenshot.png screenshot-$(date +%Y%m%d-%H%M%S).png

# Remove from device
adb shell rm /sdcard/screenshot.png
```

### Batch Screenshot Script

Save as `take_screenshots.sh`:

```bash
#!/bin/bash
for i in {1..8}; do
    echo "Taking screenshot $i..."
    adb shell screencap -p /sdcard/screenshot$i.png
    adb pull /sdcard/screenshot$i.png screenshot-$i.png
    adb shell rm /sdcard/screenshot$i.png
    sleep 2
done
echo "Done! Check screenshot-*.png files"
```

## Troubleshooting

### Issue: Screenshots are too small
**Solution**: Use higher resolution device/emulator

### Issue: Screenshots show black screen
**Solution**: Wait for app to fully load before screenshot

### Issue: Can't take screenshots
**Solution**: 
- Check device permissions
- Enable screenshot in emulator settings
- Use ADB method instead

### Issue: Screenshots are blurry
**Solution**: 
- Increase emulator resolution
- Use physical device
- Check screenshot settings

---

**Remember**: Screenshots are the first thing users see. Make them count!

