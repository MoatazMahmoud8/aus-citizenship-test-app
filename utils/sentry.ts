/**
 * Sentry crash reporting configuration.
 *
 * Setup steps:
 * 1. Sign up at https://sentry.io (free tier: 5k events/month)
 * 2. Create a new React Native project, copy your DSN
 * 3. Set SENTRY_DSN env var or paste it below
 * 4. Run: npx expo install @sentry/react-native
 * 5. Add to app.json `plugins`: ["@sentry/react-native/expo"]
 * 6. (Optional) Configure source maps with EAS Build:
 *    npx @sentry/wizard@latest -i reactNative
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN =
  (Constants.expoConfig?.extra?.sentryDsn as string | undefined) ||
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  ''; // ← paste your DSN here as fallback

export const initSentry = () => {
  if (!SENTRY_DSN) {
    if (__DEV__) console.warn('[Sentry] No DSN configured, skipping init');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    enabled: !__DEV__, // Only report crashes in production
    tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.expoConfig?.version || 'unknown',
    dist: String(
      Constants.expoConfig?.ios?.buildNumber ||
        Constants.expoConfig?.android?.versionCode ||
        '0'
    ),
    beforeSend(event) {
      // Strip PII
      if (event.user) delete event.user.email;
      return event;
    },
  });
};

export const captureException = (
  error: unknown,
  context?: Record<string, any>
) => {
  if (__DEV__) console.error('[Sentry]', error, context);
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const addBreadcrumb = (message: string, category = 'app', data?: Record<string, any>) => {
  Sentry.addBreadcrumb({ message, category, data, level: 'info' });
};

export const setUserContext = (id: string | null) => {
  Sentry.setUser(id ? { id } : null);
};

export { Sentry };
