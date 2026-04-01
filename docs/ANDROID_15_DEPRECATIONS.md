# Android 15 Deprecation - Edge-to-Edge APIs Fix Guide

## Issue Overview
Your app uses deprecated APIs or parameters for edge-to-edge and window display in Android 15.

**Deprecated APIs:**
- `android.view.Window.getStatusBarColor`
- `android.view.Window.setStatusBarColor`
- `android.view.Window.setNavigationBarColor`
- `android.view.Window.getNavigationBarColor`
- `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES`
- `LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT`

**Affected Libraries:**
- React Native (StatusBarModule)
- Material Design (BottomSheetDialog, EdgeToEdgeUtils)
- React Native Screens
- React Native Views

---

## Solution & Fixes

### Step 1: Update React Native Dependencies
```bash
npm install react-native@latest
npm install @react-native-community/status-bar-height@latest
npm install react-native-safe-area-context@latest
```

### Step 2: Update Material Design Library
```bash
# In your build.gradle
dependencies {
    implementation 'com.google.android.material:material:1.11.0' // or latest
}
```

### Step 3: Update React Native Screens
```bash
npm install react-native-screens@latest
```

### Step 4: Migrate from Deprecated APIs

#### For StatusBar Color (React Native)
**Old Code (Deprecated):**
```java
Window window = getWindow();
window.setStatusBarColor(Color.parseColor("#FFFFFF"));
window.setNavigationBarColor(Color.parseColor("#FFFFFF"));
```

**New Code (Recommended):**
```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    getWindow().setStatusBarColor(Color.TRANSPARENT);
    getWindow().setNavigationBarColor(Color.TRANSPARENT);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
} else {
    getWindow().setStatusBarColor(Color.parseColor("#FFFFFF"));
    getWindow().setNavigationBarColor(Color.parseColor("#FFFFFF"));
}
```

#### For Edge-to-Edge Display Cutout
**Old Code (Deprecated):**
```java
window.setAttributes(new WindowManager.LayoutParams());
params.layoutInDisplayCutoutMode = 
    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
```

**New Code (Recommended - Android 10+):**
```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    WindowInsetsController insetsController = 
        view.getWindowInsetsController();
    if (insetsController != null) {
        // Handle insets properly
    }
    // Use AndroidX WindowManager for cutout handling
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
}
```

### Step 5: Update app/build.gradle
```gradle
android {
    compileSdk 35  // Target Android 15
    
    defaultConfig {
        targetSdk 35
        minSdk 21
    }
}

dependencies {
    // Use latest AndroidX libraries
    implementation 'androidx.core:core:1.13.1'
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
}
```

### Step 6: Update AndroidManifest.xml
```xml
<application
    android:usesCleartextTraffic="false"
    ...>
    
    <!-- Ensure proper activity configuration -->
    <activity
        android:name=".MainActivity"
        android:windowSoftInputMode="adjustResize"
        ...>
    </activity>
</application>
```

---

## React Native Specific Fixes

### For React Native App
Update `react-native.config.js`:
```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependency: {
    platforms: {
      android: null,
    },
  },
};
```

### Update StatusBar Component
**Old:**
```jsx
import { StatusBar } from 'react-native';

<StatusBar
  barStyle="dark-content"
  backgroundColor="#FFFFFF"
/>
```

**New (Recommended):**
```jsx
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const App = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />
      {/* Your content */}
    </SafeAreaProvider>
  );
};
```

---

## Testing Checklist

- [ ] Test on Android 15 emulator/device
- [ ] Verify StatusBar colors display correctly
- [ ] Check NavigationBar appearance
- [ ] Test edge-to-edge display with notches/cutouts
- [ ] Verify no console warnings about deprecated APIs
- [ ] Test on older Android versions (API 21+)
- [ ] Build APK with `minSdk 21` and `targetSdk 35`

---

## Google Play Console Update

After fixing these deprecations:

1. Go to Google Play Console
2. Upload new APK/AAB with updated code
3. Update Release Notes:
   ```
   - Fixed Android 15 deprecated API warnings
   - Improved edge-to-edge display handling
   - Enhanced status bar and navigation bar appearance
   ```
4. Submit for review

---

## Important Dates

- **Android 15 Full Release**: August 2024
- **Recommended Migration**: Before next app update
- **Google Play Requirements**: Apps targeting Android 15 by Q4 2024

---

## Resources

- [Android 15 Behavior Changes](https://developer.android.com/about/versions/15/behavior-changes)
- [Edge-to-Edge Best Practices](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
- [WindowCompat Reference](https://developer.android.com/reference/androidx/core/view/WindowCompat)
- [Safe Area Context React Native](https://github.com/th3rdEyeR/react-native-safe-area-context)

---

**Last Updated**: April 1, 2026  
**Status**: Action Required  
**Priority**: High (for Google Play Store compliance)
