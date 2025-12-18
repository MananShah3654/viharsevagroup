# Complete Android App Release Guide

## Step-by-Step: From Build to Play Store

### Phase 1: Pre-Build Preparation

#### 1.1 Update Version
**File**: `android/app/build.gradle.kts`

```kotlin
defaultConfig {
    versionCode = 1  // Increment for each release
    versionName = "1.0.0"  // User-visible version
}
```

#### 1.2 Verify Configuration
- [ ] BASE_URL is correct: `https://naranpuraviharsevagroup.com`
- [ ] Domain whitelist is correct in `network_security_config.xml`
- [ ] App icon is replaced (all mipmap folders)
- [ ] App name is correct in `strings.xml`

#### 1.3 Test App
- [ ] Test on real device
- [ ] Test all features
- [ ] Verify website loads correctly
- [ ] Check charts render properly
- [ ] Test offline handling
- [ ] Test external links

### Phase 2: Build Release

#### 2.1 Create Keystore (First Time Only)

1. **Open Android Studio**
   ```
   File → Open → Select android/ folder
   ```

2. **Generate Signed Bundle**
   ```
   Build → Generate Signed Bundle / APK
   → Android App Bundle
   → Create new keystore
   ```

3. **Fill Keystore Details**
   - **Key store path**: `android/app/release.keystore`
   - **Password**: [Create strong password - SAVE IT!]
   - **Key alias**: `viharsevagroup`
   - **Key password**: [Same or different - SAVE IT!]
   - **Validity**: 25 years
   - **Certificate info**: Your details

4. **Click OK** → Keystore created

#### 2.2 Build AAB File

1. **Generate Signed Bundle**
   ```
   Build → Generate Signed Bundle / APK
   → Android App Bundle
   → Select existing keystore (or create new)
   → Enter passwords
   → Select "release" build variant
   → Click Finish
   ```

2. **Wait for Build**
   - Build process starts
   - Takes 1-5 minutes
   - Shows progress in bottom panel

3. **Locate Output**
   - File: `android/app/release/app-release.aab`
   - Size: Usually 5-20 MB

#### 2.3 Verify Build

- [ ] AAB file exists
- [ ] File size is reasonable
- [ ] No build errors
- [ ] Build completed successfully

### Phase 3: Take Screenshots

#### 3.1 Prepare App

1. **Install on Device**
   ```bash
   adb install app-release.apk
   # Or build debug APK for screenshots
   ```

2. **Navigate to Key Screens**
   - Splash screen
   - Login screen
   - Dashboard
   - Vihars list
   - Charts (Vihar Trends, User Growth, Top Routes)
   - Reports
   - Profile

#### 3.2 Take Screenshots

**Method 1: Device Buttons**
- Hold: Power + Volume Down (1-2 seconds)
- Screenshot saved to gallery

**Method 2: ADB Command**
```bash
adb shell screencap -p /sdcard/screenshot1.png
adb pull /sdcard/screenshot1.png .
```

**Method 3: Android Studio Emulator**
- Click camera icon in emulator toolbar
- Screenshot saved automatically

#### 3.3 Required Screenshots

- [ ] At least 2 phone screenshots
- [ ] Recommended: 4-8 screenshots
- [ ] Size: 1080x1920 (9:16) or similar
- [ ] Format: PNG or JPG
- [ ] Quality: High resolution, readable text

#### 3.4 Screenshot Order (Recommended)

1. Splash Screen / Logo
2. Dashboard / Home
3. Vihars List
4. Charts (Vihar Trends)
5. Charts (User Growth)
6. Reports
7. Profile
8. Menu

### Phase 4: Create Privacy Policy

#### 4.1 Create Privacy Policy Page

1. **Use Template**
   - See `PRIVACY_POLICY.md` for template
   - Customize with your details

2. **Host on Website**
   - Create: `privacy-policy.html`
   - Upload to: `https://naranpuraviharsevagroup.com/privacy-policy.html`
   - Or: `https://naranpuraviharsevagroup.com/privacy-policy`

3. **Verify Access**
   - Open URL in browser
   - Must be publicly accessible
   - Must be HTTPS

#### 4.2 Customize Template

Update in template:
- [ ] [DATE] - Current date
- [ ] [YOUR_EMAIL] - Contact email
- [ ] [YOUR_ADDRESS] - Address (optional)
- [ ] [YEAR] - Current year
- [ ] Review content for accuracy

### Phase 5: Prepare Store Assets

#### 5.1 App Icon

- [ ] Size: 512x512 pixels
- [ ] Format: PNG (32-bit with alpha)
- [ ] Replace in: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- [ ] All sizes updated (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

#### 5.2 Feature Graphic

- [ ] Size: 1024x500 pixels
- [ ] Format: PNG or JPG
- [ ] Shows app branding/name
- [ ] Professional design

#### 5.3 App Description

**Short Description** (80 characters max):
```
Vihar Seva Group - Manage and track vihar participation, view reports and analytics.
```

**Full Description** (4000 characters max):
```
Vihar Seva Group Mobile App

The official mobile app for Vihar Seva Group, providing easy access to vihar management, participation tracking, and comprehensive reports.

Features:
• View all upcoming vihars
• Track your vihar participation
• Access detailed reports and analytics
• View interactive charts (Vihar Trends, User Growth, Top Routes)
• Manage your profile
• Secure login and authentication
• Offline support with retry functionality
• Fast and responsive interface

The app provides a seamless experience for managing vihar activities, tracking participation, and accessing important information on the go.

For support, visit: https://naranpuraviharsevagroup.com
```

### Phase 6: Upload to Play Store

#### 6.1 Create App Listing

1. **Go to Play Console**
   - https://play.google.com/console
   - Sign in with Google account

2. **Create New App**
   - Click "Create app"
   - Fill in:
     - App name: **Vihar Seva Group**
     - Default language: **English**
     - App or game: **App**
     - Free or paid: **Free**
     - Declarations: Check applicable boxes

3. **Click Create**

#### 6.2 Upload AAB File

1. **Go to Release**
   - Left menu → **Release** → **Production** (or **Testing**)

2. **Create New Release**
   - Click **Create new release**

3. **Upload AAB**
   - Click **Upload** button
   - Select: `app-release.aab`
   - Wait for upload (1-5 minutes)

4. **Add Release Notes**
   - Release name: `1.0.0`
   - Release notes:
     ```
     Initial release of Vihar Seva Group mobile app.
     Features:
     - Vihar management and tracking
     - Interactive charts and reports
     - User profile management
     - Secure authentication
     ```

5. **Save** → **Review release**

#### 6.3 Complete Store Listing

1. **Go to Store Listing**
   - Left menu → **Store presence** → **Store listing**

2. **Upload Assets**
   - **App icon**: Upload 512x512 PNG
   - **Feature graphic**: Upload 1024x500 PNG/JPG
   - **Phone screenshots**: Upload 2-8 screenshots
   - **Tablet screenshots**: Optional

3. **Add Descriptions**
   - **App name**: Vihar Seva Group
   - **Short description**: (80 chars max)
   - **Full description**: (4000 chars max)

4. **Add Privacy Policy**
   - Privacy policy URL: `https://naranpuraviharsevagroup.com/privacy-policy`
   - Or: `https://naranpuraviharsevagroup.com/privacy-policy.html`

5. **Save**

#### 6.4 Complete App Content

1. **Content Rating**
   - Go to: **App content** → **Content rating**
   - Complete questionnaire
   - Get rating certificate

2. **Target Audience**
   - Go to: **App content** → **Target audience**
   - Select age groups
   - Select content categories

3. **Data Safety** (Required)
   - Go to: **App content** → **Data safety**
   - Answer questions about data collection
   - Add privacy policy URL

#### 6.5 Submit for Review

1. **Review Checklist**
   - [ ] AAB uploaded
   - [ ] Store listing complete
   - [ ] Screenshots uploaded
   - [ ] App icon uploaded
   - [ ] Feature graphic uploaded
   - [ ] Privacy policy added
   - [ ] Content rating completed
   - [ ] Data safety completed
   - [ ] All required sections done

2. **Submit**
   - Click **Submit for review**
   - Confirm submission

3. **Wait for Review**
   - Usually 1-3 days for first review
   - You'll receive email when reviewed

### Phase 7: Post-Submission

#### 7.1 Monitor Status

- [ ] Check Play Console for status
- [ ] Respond to any review feedback
- [ ] Fix any issues if rejected

#### 7.2 After Approval

- [ ] App goes live
- [ ] Monitor user reviews
- [ ] Monitor crash reports (if enabled)
- [ ] Prepare for updates

## Complete Checklist

### Pre-Build
- [ ] Version code updated
- [ ] Version name updated
- [ ] BASE_URL verified
- [ ] Domain whitelist correct
- [ ] App icon replaced
- [ ] App tested thoroughly

### Build
- [ ] Keystore created/selected
- [ ] AAB file built successfully
- [ ] AAB file verified
- [ ] Keystore backed up securely

### Screenshots
- [ ] At least 2 screenshots taken
- [ ] Screenshots show actual app
- [ ] Text is readable
- [ ] Key features visible
- [ ] Proper size and format

### Privacy Policy
- [ ] Privacy policy created
- [ ] Hosted on website (HTTPS)
- [ ] URL accessible
- [ ] Content customized
- [ ] Date updated

### Store Assets
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (2-8)
- [ ] App description written
- [ ] Short description written

### Play Store
- [ ] App created in console
- [ ] AAB uploaded
- [ ] Store listing complete
- [ ] Privacy policy added
- [ ] Content rating done
- [ ] Data safety completed
- [ ] Submitted for review

## Quick Reference

**Files to Upload:**
1. `app-release.aab` (to Play Console)
2. App icon (512x512)
3. Feature graphic (1024x500)
4. Screenshots (2-8)
5. Privacy policy URL

**Files to Keep Secure:**
1. `release.keystore` (NEVER upload!)
2. Keystore passwords (SAVE securely!)

**Timeline:**
- Build: 5-10 minutes
- Screenshots: 10-20 minutes
- Privacy policy: 30 minutes
- Play Store setup: 1-2 hours
- Review: 1-3 days

---

**Need Help?**
- See individual guides:
  - `PLAY_STORE_SUBMISSION.md` - Detailed submission guide
  - `SCREENSHOTS_REQUIREMENTS.md` - Screenshot guide
  - `PRIVACY_POLICY.md` - Privacy policy template
  - `BUILD_CHECKLIST.md` - Build checklist

