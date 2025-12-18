# Policy Notes & Compliance

## Play Store Compliance

### ✅ Permissions
- **INTERNET**: Required for WebView functionality
- **ACCESS_NETWORK_STATE**: Used for offline detection
- **No other permissions** - Safe for Play Store

### ✅ Security Settings

#### Mixed Content
- **Setting**: `MIXED_CONTENT_NEVER_ALLOW`
- **Why**: Blocks HTTP resources on HTTPS pages
- **Play Store**: Required for targetSdk 28+

#### File Access
- **allowFileAccess**: `false`
- **allowContentAccess**: `false`
- **allowFileAccessFromFileURLs**: `false`
- **allowUniversalAccessFromFileURLs**: `false`
- **Why**: Prevents malicious websites from accessing device files

#### Cleartext Traffic
- **Blocked by default** in `network_security_config.xml`
- **Why**: Play Store requires HTTPS (targetSdk 28+)
- **Exception**: Only for allowed domains with valid SSL

#### Safe Browsing
- **Enabled**: `true`
- **Why**: Google's protection against malicious sites

### ✅ Cookies

#### Third-Party Cookies
- **Currently**: `ENABLED`
- **Why**: Many authentication/login flows require it
- **To Disable**: Set `thirdPartyCookiesEnabled = false` in `MainActivity.kt`
- **Note**: Disabling may break some login flows

#### Session Cookies
- **Supported**: Yes (via `domStorageEnabled = true`)
- **Why**: Required for user sessions and authentication

### ✅ Data Privacy

#### Backup Rules
- WebView cookies and cache excluded from backup
- **File**: `backup_rules.xml`

#### Data Extraction
- WebView data excluded from device transfer
- **File**: `data_extraction_rules.xml`

### ✅ Network Security

#### Allowed Domains
- Only specified domains can be accessed
- **File**: `network_security_config.xml`
- **Why**: Prevents loading content from untrusted sources

### ⚠️ Third-Party Services

#### Analytics
- **Status**: Stubs included, OFF by default
- **Why**: Privacy-first approach
- **To Enable**: Add dependency and initialize in `Application` class
- **Note**: Must update privacy policy if enabled

#### Crash Reporting
- **Status**: Not implemented
- **To Add**: Use Firebase Crashlytics or similar
- **Note**: Must update privacy policy

## Privacy Policy Requirements

If you enable any of the following, update your privacy policy:

1. **Analytics**: Data collection, usage, retention
2. **Crash Reporting**: Error logs, device info
3. **Third-Party Cookies**: Cookie usage, tracking
4. **File Uploads**: How uploaded files are handled

## Recommended Privacy Policy Sections

1. **Data Collection**: What data is collected
2. **Data Usage**: How data is used
3. **Data Sharing**: Third-party services
4. **User Rights**: Access, deletion, opt-out
5. **Cookies**: Types of cookies used
6. **Security**: How data is protected

## Play Store Listing Requirements

1. **Privacy Policy URL**: Required if collecting data
2. **App Description**: Clear description of functionality
3. **Screenshots**: Show app functionality
4. **Content Rating**: Appropriate for your content
5. **Target Audience**: Age restrictions if applicable

## Testing for Compliance

- [ ] No unnecessary permissions requested
- [ ] HTTPS only (no cleartext traffic)
- [ ] Mixed content blocked
- [ ] File access disabled
- [ ] Safe browsing enabled
- [ ] Privacy policy linked (if needed)
- [ ] No data collection without consent

## Support

For Play Store policy questions:
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Android Security Best Practices](https://developer.android.com/training/best-security)

