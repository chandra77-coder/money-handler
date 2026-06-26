# MoneyMate - Android APK Build Guide

## Overview

The MoneyMate app has been configured for Android APK building using Capacitor. This guide provides step-by-step instructions to build the APK on your local machine.

---

## Prerequisites

Before building the APK, ensure you have the following installed:

### Required Software
1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Java Development Kit (JDK)** (v11 or higher)
   - Download: https://www.oracle.com/java/technologies/downloads/
   - Verify: `java -version`

3. **Android SDK** (API level 33 or higher)
   - Download: https://developer.android.com/studio
   - Install Android Studio or Android SDK Command-line Tools

4. **Gradle** (Usually included with Android SDK)
   - Verify: `gradle --version`

### Environment Variables
Set these environment variables on your system:

```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Windows (set via System Properties)
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
PATH = %ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

---

## Step-by-Step Build Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/chandra77-coder/money-handler.git
cd money-handler
```

### Step 2: Install Dependencies
```bash
npm install
npm install @capacitor/core @capacitor/android --legacy-peer-deps
npm install -g @capacitor/cli
```

### Step 3: Build Web Assets
```bash
npm run build
```

This creates the `dist/` folder with optimized web assets.

### Step 4: Initialize Capacitor (if not already done)
```bash
npx cap init moneymate com.rmtelecom.moneymate --web-dir dist
```

### Step 5: Add Android Platform (if not already done)
```bash
npx cap add android
```

### Step 6: Copy Web Assets to Android
```bash
npx cap copy android
```

### Step 7: Build the APK

#### Option A: Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
cd ..
```

The debug APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Release APK (for production)

First, create a keystore file:
```bash
keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias moneymate
```

Then build the release APK:
```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=../keystore.jks \
  -Pandroid.injected.signing.store.password=YOUR_KEYSTORE_PASSWORD \
  -Pandroid.injected.signing.key.alias=moneymate \
  -Pandroid.injected.signing.key.password=YOUR_KEY_PASSWORD
cd ..
```

The release APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Build Output

### Debug APK
- **Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size**: ~15-20 MB
- **Use Case**: Testing and development
- **Installation**: `adb install app-debug.apk`

### Release APK
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Size**: ~10-15 MB
- **Use Case**: Production deployment
- **Installation**: Direct installation or upload to Google Play Store

---

## Installation Methods

### Method 1: Direct Installation (via ADB)
```bash
# Connect Android device via USB
adb devices  # Verify device is connected

# Install APK
adb install app-debug.apk
```

### Method 2: File Transfer
1. Transfer the APK file to your Android device
2. Open file manager on device
3. Tap the APK file to install
4. Grant permissions when prompted

### Method 3: Google Play Store
1. Create a Google Play Developer account
2. Sign the APK with your keystore
3. Upload to Google Play Console
4. Configure app details and pricing
5. Submit for review

---

## Troubleshooting

### Issue: "SDK location not found"
**Solution**: Set the `ANDROID_HOME` environment variable and ensure Android SDK is installed.

```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk

# Windows
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

### Issue: "Gradle build failed"
**Solution**: Update Gradle and Android Gradle Plugin.

```bash
cd android
./gradlew wrapper --gradle-version latest
cd ..
```

### Issue: "Java version mismatch"
**Solution**: Ensure JDK 11 or higher is installed and set as default.

```bash
java -version
```

### Issue: "APK installation fails"
**Solution**: Uninstall previous version first.

```bash
adb uninstall com.rmtelecom.moneymate
adb install app-release.apk
```

### Issue: "Build takes too long"
**Solution**: Increase Gradle heap size.

```bash
export GRADLE_OPTS="-Xmx2048m"
```

---

## APK Configuration

### App Details
- **App Name**: MoneyMate
- **Package Name**: com.rmtelecom.moneymate
- **Version**: 1.0.0
- **Min SDK**: API 21 (Android 5.0)
- **Target SDK**: API 33 (Android 13)

### Permissions
The app requires the following permissions:
- `INTERNET` - For potential future features
- `WRITE_EXTERNAL_STORAGE` - For data export (optional)
- `READ_EXTERNAL_STORAGE` - For data import (optional)

### Features
- Offline-first (works without internet)
- Local data storage only
- No analytics or tracking
- No external API calls

---

## Signing the APK

### Generate Keystore
```bash
keytool -genkey -v -keystore keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias moneymate
```

### Sign APK Manually
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore keystore.jks \
  app-release-unsigned.apk moneymate
```

### Verify Signature
```bash
jarsigner -verify -verbose -certs app-release.apk
```

---

## Publishing to Google Play Store

### Step 1: Create Developer Account
- Visit: https://play.google.com/console
- Create account and pay $25 registration fee

### Step 2: Create App
- Click "Create app"
- Fill in app details
- Accept policies

### Step 3: Prepare Store Listing
- Add app title, description, screenshots
- Add privacy policy
- Set content rating
- Specify category

### Step 4: Upload APK
- Go to "Release" → "Production"
- Upload signed APK
- Set version number and release notes

### Step 5: Review and Release
- Review all details
- Submit for review
- Wait for approval (usually 24-48 hours)
- Release to production

---

## Continuous Integration (CI/CD)

### GitHub Actions Example
```yaml
name: Build APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '11'
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - run: npx cap copy android
      - run: cd android && ./gradlew assembleRelease && cd ..
      - uses: actions/upload-artifact@v2
        with:
          name: app-release.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

---

## Performance Optimization

### Reduce APK Size
```bash
# Enable ProGuard
# In android/app/build.gradle:
release {
    minifyEnabled true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}
```

### Improve Build Speed
```bash
# Parallel builds
export GRADLE_OPTS="-Xmx2048m -XX:+UseParallelGC"

# Incremental builds
./gradlew build --parallel --build-cache
```

---

## Support & Resources

- **Capacitor Docs**: https://capacitorjs.com/docs/
- **Android Docs**: https://developer.android.com/docs
- **Gradle Docs**: https://docs.gradle.org/
- **GitHub Issues**: https://github.com/chandra77-coder/money-handler/issues

---

## FAQ

**Q: Can I build the APK on Windows?**  
A: Yes, follow the same steps but use `gradlew.bat` instead of `./gradlew`

**Q: How do I update the app after release?**  
A: Increment version number in `capacitor.config.json` and rebuild

**Q: Can I use the same keystore for multiple builds?**  
A: Yes, keep the keystore file safe and reuse it for all future releases

**Q: How long does the build take?**  
A: First build: 5-10 minutes, Subsequent builds: 2-5 minutes

**Q: What's the minimum Android version supported?**  
A: Android 5.0 (API level 21)

---

## Conclusion

You now have all the information needed to build and release the MoneyMate Android APK. Follow the steps carefully and refer to the troubleshooting section if you encounter any issues.

**Happy building! 🚀**

---

**Last Updated**: June 26, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
