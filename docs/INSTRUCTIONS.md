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

### 5. **Testing**
- [ ] Manual testing completed on Android
- [ ] Manual testing completed on iOS (Testflight/beta)
- [ ] No critical bugs or errors
- [ ] Performance testing completed

### 6. **Documentation**
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
| | | |

---

## Notes
- All updates must be reviewed against this checklist
- Monthly cadence ensures regular feature improvements and bug fixes
- Keep version numbers consistent across mobile apps and website
- Document all changes in CHANGELOG.md

---

**Last Updated**: April 1, 2026
**Next Review**: May 1, 2026
