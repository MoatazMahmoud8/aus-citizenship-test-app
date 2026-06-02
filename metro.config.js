const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// react-native-worklets ships built JS with private class fields (#field syntax).
// Hermes can't compile them, so we must ensure Metro transforms the package via Babel.
config.transformIgnorePatterns = [
  "node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|sentry-expo|@sentry|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-screens|react-native-svg|react-native-progress|react-native-safe-area-context)/)",
];

module.exports = config;
