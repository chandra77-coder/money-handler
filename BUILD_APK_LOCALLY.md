# MoneyMate - Build APK on Your Local Machine

**Important**: The APK must be built on your local computer because it requires Android SDK and Java compiler.

This guide will help you build the MoneyMate APK on your own machine.

---

## 📋 Prerequisites

Before you start, install these on your computer:

### 1. Node.js (v16 or higher)
- **Download**: https://nodejs.org/
- **Verify**: `node --version`

### 2. Java Development Kit (JDK) 11 or 17
- **Download**: https://www.oracle.com/java/technologies/downloads/
- **Verify**: `java -version`

### 3. Android SDK
- **Option A**: Download Android Studio (includes SDK)
  - https://developer.android.com/studio
  - Install and open Android Studio
  - Go to SDK Manager and install:
    - Android SDK Platform 33 (API 33)
    - Android SDK Build-Tools 33
    - Android Emulator (optional)

- **Option B**: Download Command-line tools only
  - https://developer.android.com/studio/command-line-tools
  - Extract and set ANDROID_HOME environment variable

### 4. Set Environment Variables

**Windows**:
```
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17
PATH = Add both bin folders
```

**Mac/Linux**:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/libexec/java_home -v 17
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

---

## 🚀 Build Steps

### Step 1: Clone Repository
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

### Step 4: Copy to Android
```bash
npx cap copy android
```

### Step 5: Build APK
```bash
cd android
./gradlew assembleDebug
cd ..
```

### Step 6: Find Your APK
The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Install on Phone

### Method 1: USB Transfer
1. Connect Android phone via USB
2. Copy `app-debug.apk` to phone
3. Open file manager on phone
4. Tap APK file
5. Tap "Install"

### Method 2: ADB (Android Debug Bridge)
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 3: Email/Cloud
1. Email APK to yourself
2. Download on phone
3. Tap to install

---

## 🔧 Troubleshooting

### Error: "SDK location not found"
```bash
# Create local.properties file
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

### Error: "Gradle build failed"
```bash
cd android
./gradlew wrapper --gradle-version latest
cd ..
```

### Error: "Java version mismatch"
```bash
# Use JDK 17
export JAVA_HOME=/path/to/jdk-17
```

### Build takes too long
```bash
# Increase memory
export GRADLE_OPTS="-Xmx2048m"
```

---

## 📊 Build Information

| Property | Value |
|----------|-------|
| **App Name** | MoneyMate |
| **Package** | com.rmtelecom.moneymate |
| **Version** | 1.0.0 |
| **Min Android** | 5.0 (API 21) |
| **Target Android** | 13 (API 33) |
| **Build Time** | 5-15 minutes |
| **APK Size** | 10-20 MB |

---

## ✅ Verification

After building, verify the APK:
```bash
# Check file exists
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Check file size (should be 10-20 MB)
file android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎉 Next Steps

1. Build the APK on your computer
2. Transfer to Android phone
3. Install the app
4. Start tracking your finances!

---

**Need Help?**
- See README.md for more information
- Check GitHub Issues: https://github.com/chandra77-coder/money-handler/issues

---

**Happy tracking! 💰**
