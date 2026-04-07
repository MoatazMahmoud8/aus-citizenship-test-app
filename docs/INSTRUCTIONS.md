# ACE Aus Citizenship App - Update & Release Instructions

## Overview
This document outlines the process for releasing updates to the ACE Aus Citizenship app. All updates must follow this checklist before pushing to production.

---

## Monthly Update Schedule
- **Release Frequency**: Monthly updates
- **Release Day**: Every 1st of the month (or next business day)
- **Announcement**: Update announcement on homepage with month and year
- **Format**: "April 2026 Update", "May 2026 Update", etc.

---

## Pre-Release Checklist ✓

Before pushing any update, verify the following:

### 1. **Questions & Content**
- [ ] All 150 citizenship questions are verified and accurate
- [ ] No duplicate questions exist
- [ ] Questions follow exam format (Question/Answer structure)
- [ ] Content matches latest official Australian Citizenship Test materials
- [ ] Questions are organized by category

### 2. **App Features**
- [ ] All features are tested on both Android and iOS
- [ ] No broken links or missing resources
- [ ] Privacy policy is accessible and up-to-date
- [ ] Contact email is correct (support@jsmglobal.xyz)

### 3. **Homepage Updates**
- [ ] Homepage displays current month update (e.g., "April 2026 Update")
- [ ] **"Questions last updated"** text in `app/(tabs)/index.tsx` is set to the current month (search for `lastUpdatedDate`)
- [ ] Update date is visible to users
- [ ] All links are working correctly

### 4. **Compliance & Regulations**
- [ ] Privacy Policy page is accessible at: https://jsmglobal.xyz/privacy.html
- [ ] Terms and Conditions are present (if required)
- [ ] App complies with EU Geo-blocking Regulation (if applicable)
- [ ] Google Play Console requirements are met
- [ ] Android 15 deprecated APIs have been addressed (see ANDROID_15_DEPRECATIONS.md)
- [ ] App targets latest Android SDK (API 35+)
- [ ] No deprecation warnings in Google Play Console
- [ ] In-app rating prompt is working correctly (shows after 2 passed quizzes)

### 5. **Code Review (CRITICAL)**
- [ ] All React hooks (`useEffect`, `useState`, `useCallback`, etc.) are imported from `'react'`, **NEVER from `'react-native'`**
- [ ] No async calls at module level (outside components) — use `useEffect` instead
- [ ] All async/await calls have `.catch()` or try/catch error handling
- [ ] `SplashScreen.preventAutoHideAsync()` is called at module level, `hideAsync()` inside `useEffect`
- [ ] No new native plugins added to `app.json` without testing on a real device first
- [ ] `app.json` plugins list matches the last working build (currently: expo-router, expo-font, expo-asset)
- [ ] No `edgeToEdgeEnabled` or `expo-navigation-bar` plugin in `app.json` (caused crash in v45-v47)
- [ ] Before building: `git status` is clean (no untracked AAB files — delete `aab/` folder before building)

### 6. **Testing**
- [ ] Manual testing completed on Android
- [ ] Manual testing completed on iOS (Testflight/beta)
- [ ] No critical bugs or errors
- [ ] Performance testing completed
- [ ] **Install the AAB/APK on a real phone and verify the app opens without crashing**

### 7. **Documentation**
- [ ] CHANGELOG.md is updated with new changes
- [ ] Version number is incremented
- [ ] Release notes are written

---

## Release Process

### Step 1: Update Version Number
```
Update in app configuration:
- Version: X.Y.Z (semantic versioning)
- Build number: Increment by 1
```

### Step 2: Update Homepage
Add the current month display to the landing page:
```html
<p class="update-badge">April 2026 Update</p>
```

### Step 3: Verify Content
- Run through all 150 questions
- Check for duplicates
- Verify question accuracy

### Step 4: Commit Changes
```bash
git add .
git commit -m "Release: April 2026 Update - [description of changes]"
```

### Step 5: Push to GitHub
```bash
git push origin gh-pages
```

### Step 6: Update Google Play Console
1. Go to Google Play Console
2. Upload new APK/AAB
3. Update app description with latest features
4. Add release notes
5. Review all requirements
6. Submit for review

### Step 7: Monitor Approval
- Track approval status in Google Play Console
- Respond to any feedback from Google
- Ensure privacy policy is accessible

---

## Important URLs
- **Website**: https://jsmglobal.xyz/
- **Privacy Policy**: https://jsmglobal.xyz/privacy.html
- **Android App**: https://play.google.com/store/apps/details?id=xyz.jsmglobal.ace
- **Contact Email**: support@jsmglobal.xyz
- **Documentation**: docs/INSTRUCTIONS.md
- **Android 15 Fix Guide**: docs/ANDROID_15_DEPRECATIONS.md

---

## Version History
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | April 1, 2026 | Initial Release - 150 Questions |
| 1.0.1 | April 1, 2026 | Crash fix + In-app rating prompt |
| 1.0.1 | April 7, 2026 | Fix critical startup crash (useEffect wrong import) — v48 |

---

## Known Crash Causes (Lessons Learned)

### April 7, 2026 — App crash on startup (v45, v46, v47 rejected by Google Play)
**Root Cause**: `useEffect` was imported from `'react-native'` instead of `'react'` in `app/_layout.tsx`. This caused an immediate crash because `useEffect` does not exist as an export of `react-native`.

**Additional factors**:
- `SplashScreen.hideAsync()` was called at module level (before component mounted)
- `expo-navigation-bar` plugin and `edgeToEdgeEnabled: true` were added to `app.json` — these native config changes were NOT present in the last working build (v42) and may have contributed to crashes on some devices

**How it happened**: When fixing Android 15 deprecated APIs, `useEffect` was added to the import from `react-native` (which already had `Platform`), rather than importing it separately from `react`.

**Prevention rules**:
1. **ALWAYS** import React hooks from `'react'`: `import React, { useEffect, useState } from 'react'`
2. **NEVER** import hooks from `'react-native'` — only import components/APIs from there: `import { Platform, View, Text } from 'react-native'`
3. **NEVER** add new native plugins to `app.json` without testing on a real device
4. **ALWAYS** compare `app.json` with the last working build before submitting
5. **ALWAYS** test the built AAB on a real phone before uploading to Google Play

---

## Notes
- All updates must be reviewed against this checklist
- Monthly cadence ensures regular feature improvements and bug fixes
- Keep version numbers consistent across mobile apps and website
- Document all changes in CHANGELOG.md
- **Delete the `aab/` folder before running `eas build`** to avoid dirty git errors

---

**Last Updated**: April 7, 2026
**Next Review**: May 1, 2026
