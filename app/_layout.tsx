import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { Colors } from '../constants/theme';
import AnimatedSplash from '../components/AnimatedSplash';
import ErrorBoundary from '../components/ErrorBoundary';
// TODO: Configure Sentry with environment variables (NOT hardcoded DSN)
// import * as Sentry from '@sentry/react-native';
// Sentry.init({
//   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
//   sendDefaultPii: false,
//   enableLogs: false,
//   tracesSampleRate: 0.5,
// });

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

export default RootLayout;
