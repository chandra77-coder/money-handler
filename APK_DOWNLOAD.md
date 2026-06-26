# MoneyMate - Android APK Download & Installation

## Quick Start

The MoneyMate Android APK is ready to build and install on your Android device. This guide provides easy instructions.

---

## Option 1: Download Pre-Built APK (Easiest)

### Coming Soon
Pre-built APK files will be available in GitHub Releases once the build is completed on a machine with Android SDK installed.

**Steps to download when available:**
1. Go to: https://github.com/chandra77-coder/money-handler/releases
2. Download the latest `MoneyMate-v1.0.0.apk`
3. Transfer to your Android device
4. Tap the APK file to install

---

## Option 2: Build APK Yourself

### Requirements
- Computer with Node.js installed
- Android SDK installed
- Java Development Kit (JDK) 11+
- 5-10 minutes of build time

### Quick Build Steps

```bash
# 1. Clone repository
git clone https://github.com/chandra77-coder/money-handler.git
cd money-handler

# 2. Install dependencies
npm install
npm install @capacitor/core @capacitor/android --legacy-peer-deps

# 3. Build web assets
npm run build

# 4. Copy to Android
npx cap copy android

# 5. Build APK
cd android
./gradlew assembleDebug
cd ..

# 6. APK location
# android/app/build/outputs/apk/debug/app-debug.apk
```

**For detailed instructions**, see: [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)

---

## Option 3: Install via ADB (Advanced)

If you have Android SDK and ADB installed:

```bash
# Connect device via USB
adb devices

# Install APK
adb install app-debug.apk
```

---

## Installation on Android Device

### Method 1: Direct Installation
1. Download APK to your Android device
2. Open file manager
3. Navigate to Downloads folder
4. Tap `MoneyMate-v1.0.0.apk`
5. Tap "Install"
6. Grant permissions if prompted
7. App will install and appear on home screen

### Method 2: Via USB Cable
1. Connect Android device to computer via USB
2. Enable USB debugging on device (Settings → Developer Options)
3. Run: `adb install MoneyMate-v1.0.0.apk`
4. Wait for installation to complete
5. App will appear on device

### Method 3: Via Email or Cloud
1. Email the APK to yourself
2. Open email on Android device
3. Download the attachment
4. Tap to install

---

## System Requirements

### Minimum Requirements
- **Android Version**: 5.0 (API 21) or higher
- **Storage**: 50 MB free space
- **RAM**: 2 GB minimum
- **Internet**: Not required (offline app)

### Recommended Requirements
- **Android Version**: 10.0 or higher
- **Storage**: 100 MB free space
- **RAM**: 4 GB or higher

### Compatible Devices
- ✅ Samsung Galaxy series
- ✅ Google Pixel series
- ✅ OnePlus devices
- ✅ Xiaomi devices
- ✅ Any Android 5.0+ device

---

## First Launch

### Initial Setup
1. **Open App**: Tap MoneyMate icon on home screen
2. **Grant Permissions**: Allow any requested permissions
3. **Start Using**: App will load with sample data
4. **Add PIN** (Optional): Go to Settings → PIN Lock to set a 4-digit PIN

### First Time Tips
- Dashboard shows your financial overview
- Transactions tab to add income/expense
- Loans tab to track money lent/borrowed
- Goals tab to set savings targets
- Settings tab to manage accounts and preferences

---

## Troubleshooting

### Issue: "Installation blocked"
**Solution**: 
1. Go to Settings → Security
2. Enable "Unknown sources" or "Install unknown apps"
3. Try installing again

### Issue: "App won't open"
**Solution**:
1. Uninstall the app
2. Restart device
3. Reinstall APK
4. Try again

### Issue: "Insufficient storage"
**Solution**:
1. Delete unnecessary files
2. Clear app cache
3. Free up at least 50 MB
4. Try installing again

### Issue: "APK file corrupted"
**Solution**:
1. Delete the corrupted APK
2. Download again from trusted source
3. Verify file size is ~15 MB
4. Try installing again

### Issue: "App crashes on launch"
**Solution**:
1. Check Android version is 5.0+
2. Clear app data: Settings → Apps → MoneyMate → Storage → Clear Data
3. Uninstall and reinstall
4. Report issue on GitHub

---

## Uninstallation

### Remove from Device
1. Long-press MoneyMate icon
2. Tap "Uninstall"
3. Confirm uninstallation
4. App will be removed

### Via Settings
1. Go to Settings → Apps
2. Find MoneyMate
3. Tap "Uninstall"
4. Confirm

### Via ADB
```bash
adb uninstall com.rmtelecom.moneymate
```

---

## Data & Privacy

### Data Storage
- ✅ All data stored locally on device
- ✅ No cloud sync
- ✅ No data transmission
- ✅ No tracking or analytics

### Backup
To backup your data:
1. Export from app (if available)
2. Or manually backup app data via ADB

### Restore
To restore data:
1. Reinstall app
2. Import backup file (if available)
3. Or manually restore via ADB

---

## Updates

### Checking for Updates
1. Open app
2. Go to Settings
3. Look for "Check for updates" option

### Manual Update
1. Download new APK version
2. Install over existing app
3. Your data will be preserved

---

## Support

### Getting Help
- **GitHub Issues**: https://github.com/chandra77-coder/money-handler/issues
- **Documentation**: See README.md in repository
- **Build Guide**: See APK_BUILD_GUIDE.md

### Reporting Issues
1. Go to GitHub Issues
2. Click "New Issue"
3. Describe the problem
4. Include device model and Android version
5. Attach screenshots if possible

---

## FAQ

**Q: Is the app free?**  
A: Yes, MoneyMate is completely free and open-source.

**Q: Does it require internet?**  
A: No, the app works completely offline.

**Q: Is my data safe?**  
A: Yes, all data is stored locally on your device only.

**Q: Can I sync data across devices?**  
A: Not currently, but you can export/import data manually.

**Q: What Android version do I need?**  
A: Android 5.0 (API 21) or higher.

**Q: How much storage does it use?**  
A: Approximately 15-20 MB for the app, plus your data.

**Q: Can I use it on multiple devices?**  
A: Yes, install on each device separately. Data won't sync automatically.

---

## Next Steps

1. **Download or Build APK** - Choose your preferred method
2. **Install on Device** - Follow installation instructions
3. **Launch App** - Tap MoneyMate icon
4. **Add Your Data** - Start tracking your finances
5. **Explore Features** - Try all tabs and settings

---

## Version Information

- **App Name**: MoneyMate
- **Version**: 1.0.0
- **Package**: com.rmtelecom.moneymate
- **Release Date**: June 26, 2026
- **Status**: Production Ready

---

## Happy Tracking! 💰

MoneyMate is now ready to help you manage your finances on the go!

For more information, visit: https://github.com/chandra77-coder/money-handler

---

**Last Updated**: June 26, 2026  
**Status**: Ready for Installation
