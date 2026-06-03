import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { Colors } from '../constants/theme';
import AnimatedSplash from '../components/AnimatedSplash';
import ErrorBoundary from '../components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry for crash reporting
Sentry.init({
  dsn: 'https://bcea9a1f04d519835e56e0bec8c78bcd@o4511495972126720.ingest.de.sentry.io/4511495998275664',
  sendDefaultPii: true,
  enableLogs: false,
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
});

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!splashDone) {
    return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.blue,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.offWhite,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="quiz/index"
          options={{
            title: 'Practice Test',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="quiz/result"
          options={{
            title: 'Test Result',
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="study/[id]"
          options={{
            title: 'Study Guide',
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}

// Wrap with Sentry.withProfiler to enable performance monitoring
export default Sentry.withProfiler(RootLayout);
