import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { Colors } from '../constants/theme';

// Prevent auto-hide so we control when splash is dismissed
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash once layout is mounted
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
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
    </>
  );
}
