import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { Colors } from '../constants/theme';

// Hide splash immediately — no need to keep it around
SplashScreen.hideAsync();

// Set navigation bar colors using the modern API (avoids deprecated Android 15 APIs)
if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync('#FFFFFF');
  NavigationBar.setButtonStyleAsync('dark');
}

export default function RootLayout() {

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
