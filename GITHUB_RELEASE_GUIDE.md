# How to Create GitHub Release for MoneyMate v1.0.0

This guide explains how to upload the APK builder package to GitHub Releases so users can download it directly.

---

## Step 1: Go to GitHub Releases

1. Open your browser and go to:
   https://github.com/chandra77-coder/money-handler/releases

2. You should see the v1.0.0 tag we just created

---

## Step 2: Create Release from Tag

1. Click on the v1.0.0 tag
2. Click "Create release from tag" button
3. Fill in the release details:

**Release Title**: `MoneyMate v1.0.0 - Personal Finance Tracker`

**Description**: Copy and paste the content from RELEASE_NOTES_v1.0.0.md

---

## Step 3: Upload APK Builder Package

1. In the "Attach binaries by dropping them here or selecting them" section
2. Click to select files
3. Navigate to: `/home/ubuntu/moneymate-apk-release/`
4. Select: `moneymate-v1.0.0-apk-builder.tar.gz`
5. Upload the file

---

## Step 4: Publish Release

1. Click "Publish release" button
2. Release will be live!

---

## What Users Will See

After publishing, users will see:
- Release title and description
- Download link for `moneymate-v1.0.0-apk-builder.tar.gz`
- Quick start instructions
- All features listed

---

## Download Link Format

Once published, users can download from:
```
https://github.com/chandra77-coder/money-handler/releases/download/v1.0.0/moneymate-v1.0.0-apk-builder.tar.gz
```

---

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Create release with file
gh release create v1.0.0 \
  /home/ubuntu/moneymate-apk-release/moneymate-v1.0.0-apk-builder.tar.gz \
  --title "MoneyMate v1.0.0 - Personal Finance Tracker" \
  --notes-file RELEASE_NOTES_v1.0.0.md
```

---

## Verification

After publishing, verify:
1. Go to: https://github.com/chandra77-coder/money-handler/releases
2. You should see v1.0.0 with download link
3. Click download to verify it works
4. Extract and verify contents

---

## What's in the Package

Users will download `moneymate-v1.0.0-apk-builder.tar.gz` which contains:

```
moneymate-v1.0.0-apk-builder/
├── dist/              # Web assets
├── android/           # Android platform
├── QUICK_BUILD.sh     # Automated build script
└── README.md          # Build instructions
```

---

## User Instructions After Download

Users will:
1. Download the package
2. Extract it
3. Run `./QUICK_BUILD.sh`
4. Transfer APK to Android device
5. Install and use

---

## That's It!

Once you publish the release, MoneyMate will be officially available for download on GitHub!

---

**Next Steps**:
1. Go to: https://github.com/chandra77-coder/money-handler/releases
2. Click on v1.0.0 tag
3. Click "Create release from tag"
4. Upload the APK builder package
5. Publish!
