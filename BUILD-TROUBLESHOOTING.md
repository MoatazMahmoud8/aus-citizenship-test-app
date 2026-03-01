# EAS Build Troubleshooting Guide

## Project: ACE - AU Citizenship Exam
**Package:** `xyz.jsmglobal.ace`  
**EAS Project ID:** `9fdaa0fe-9fc3-402d-88fa-85c17d00445d`  
**Owner:** `moataz.alsbak`

---

## Table of Contents
1. [Quick Build Command](#quick-build-command)
2. [Known Issues & Resolutions](#known-issues--resolutions)
3. [Pre-Build Checklist](#pre-build-checklist)
4. [Build Scripts Reference](#build-scripts-reference)
5. [Architecture Decisions](#architecture-decisions)

---

## Quick Build Command

```bash
# Recommended: use the centralized build script
node scripts/build.js

# Or manually:
eas build --platform android --profile production
```

---

## Known Issues & Resolutions

### Issue 1: Tar Extraction Fails on Parentheses in Path Names

**Severity:** CRITICAL  
**EAS Bug:** [expo/eas-cli#3057](https://github.com/expo/eas-cli/issues/3057)  
**Status:** Known open bug in EAS CLI

**Symptoms:**
- Build fails within 1-2 minutes with "Unknown error"
- Server logs show:
  ```
  tar: app/(tabs): Cannot mkdir: Permission denied
  tar: app/(tabs)/az400.tsx: Cannot open: No such file or directory
  tar -C /home/expo/workingdir/build --strip-components 1 -zxf project.tar.gz exited with non-zero code: 2
  ```

**Root Cause:**
EAS uploads the project as a tarball. When extracting on Linux servers, paths containing parentheses `()` (like expo-router's `app/(tabs)/`) cause tar to fail because parentheses are interpreted as shell glob patterns.

**Solution:**
Add `"requireCommit": true` to `eas.json` CLI config. This forces EAS to use `git archive` instead of creating the tarball itself, which properly handles special characters:

```json
{
  "cli": {
    "requireCommit": true
  }
}
```

**Important:** With `requireCommit: true`, your git working tree must be clean (all changes committed) before building. The centralized build script handles this check automatically.

---

### Issue 2: Phantom npm Dependencies

**Severity:** HIGH

**Symptoms:**
- Build fails during `npm install` phase
- Error: `npm ERR! 404 Not Found - GET https://registry.npmjs.org/react-native-worklets`

**Root Cause:**
A dependency (`react-native-worklets@0.5.1`) was listed in `package.json` but doesn't exist on npm. Without a `package-lock.json`, npm couldn't resolve it.

**Solution:**
1. Remove non-existent packages from `package.json`
2. Always maintain a `package-lock.json`:
   ```bash
   npm install   # generates/updates package-lock.json
   ```
3. Commit `package-lock.json` to git

**Prevention:**
The build script validates all dependencies exist before building.

---

### Issue 3: Local Native Build Artifacts Uploaded to EAS

**Severity:** HIGH

**Symptoms:**
- AAB uses old/wrong package name despite `app.json` being correct
- Build takes longer than expected (uploading large native folders)

**Root Cause:**
Running `expo prebuild` locally creates `android/` and `ios/` folders. When EAS finds these, it uses them instead of generating fresh native code from `app.json`, causing stale package names.

**Solution:**
Exclude native build artifacts in `.easignore`:
```
android/
ios/
```

**Prevention:**
- Never run `expo prebuild` in the project directory  
- If you must, delete `android/` and `ios/` before EAS builds
- The build script checks for and warns about local native folders

---

### Issue 4: Git Root Pointing to Wrong Directory

**Severity:** HIGH

**Symptoms:**
- EAS scans thousands of unrelated files (AppData, Desktop, etc.)
- Build fails with `EPERM` or takes extremely long to upload
- Error: `EPERM: operation not permitted, scandir 'C:\Users\...\AppData\Local\ElevatedDiagnostics'`

**Root Cause:**
A `.git` folder existed at `C:\Users\moata\` (the home directory), making the entire home directory the git root. EAS scanned everything under it.

**Solution:**
Initialize git in the correct project directory:
```bash
cd "path/to/project"
git init
```

**Prevention:**
The build script verifies the git root matches the project directory.

---

## Pre-Build Checklist

Run `node scripts/build.js --check` to automatically verify all of these:

- [ ] Git working tree is clean (no uncommitted changes)
- [ ] Git root is the project directory (not a parent)
- [ ] `package-lock.json` exists and is committed
- [ ] No local `android/` or `ios/` folders in git
- [ ] `.easignore` excludes native build artifacts
- [ ] `eas.json` has `requireCommit: true`
- [ ] `app.json` package name is correct (`xyz.jsmglobal.ace`)
- [ ] All npm dependencies resolve

---

## Build Scripts Reference

All scripts are in the `scripts/` directory:

| Script | Purpose | Usage |
|--------|---------|-------|
| `build.js` | **Main build script** — validates, builds, monitors, verifies | `node scripts/build.js` |
| `build.js --check` | Run pre-build checks only (no build) | `node scripts/build.js --check` |
| `build.js --status <id>` | Check status of an existing build | `node scripts/build.js --status <build-id>` |
| `build.js --logs <id>` | Fetch full server logs for a build | `node scripts/build.js --logs <build-id>` |
| `fetch-build-logs.js` | Standalone: fetch all log files for a build | `node scripts/fetch-build-logs.js <build-id>` |
| `check-build.js` | Standalone: quick status + error check | `node scripts/check-build.js <build-id>` |

---

## Architecture Decisions

### Why `requireCommit: true`?
Expo's default tar upload fails on paths with parentheses (a known bug). Using `requireCommit` forces `git archive`, which handles these paths correctly. The tradeoff is that all changes must be committed before building — this is enforced by our build script.

### Why `credentialsSource: "remote"`?
Keystores are managed by EAS servers, eliminating the need to store `.jks` files locally. This is safer and works across machines.

### Why `appVersionSource: "remote"` with `autoIncrement: true`?
Version codes are managed server-side by EAS, preventing conflicts when building from different machines. The `versionCode` in `app.json` is ignored in favor of the remote value.

### Why `.easignore` + `.gitignore`?
- `.gitignore` keeps the repo clean (required for `requireCommit`)
- `.easignore` ensures EAS doesn't upload unnecessary files
- Note: EAS warns about using both together, but both are needed

### Why Node 22?
Specified in `eas.json` to ensure consistent builds. EAS default Node version may differ.

---

## Debugging Failed Builds

If a build fails with "Unknown error":

1. **Get the build ID** from the EAS dashboard or CLI output
2. **Fetch server logs:**
   ```bash
   node scripts/build.js --logs <build-id>
   ```
3. **Look for these patterns:**
   - `tar: ... Cannot mkdir` → Parentheses path issue (see Issue 1)
   - `npm ERR! 404` → Missing dependency (see Issue 2)
   - `EPERM` → Git root issue (see Issue 4)
   - Old package name in logs → Local native artifacts (see Issue 3)

4. **After fixing**, always:
   ```bash
   git add -A && git commit -m "Fix: <description>"
   node scripts/build.js
   ```

---

## Contact
**JSM GLOBAL PTY LTD**  
Email: JSMglobalAU@gmail.com  
ABN: 80 676 507 607
