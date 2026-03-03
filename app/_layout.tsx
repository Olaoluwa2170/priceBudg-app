import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import AppProvider from 'providers';
import { KeyboardProvider } from 'react-native-keyboard-controller';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    ManropeExtraLight: require('../assets/fonts/Manrope-ExtraLight.ttf'),
    ManropeLight: require('../assets/fonts/Manrope-Light.ttf'),
    ManropeRegular: require('../assets/fonts/Manrope-Regular.ttf'),
    ManropeMedium: require('../assets/fonts/Manrope-Medium.ttf'),
    ManropeSemiBold: require('../assets/fonts/Manrope-SemiBold.ttf'),
    ManropeBold: require('../assets/fonts/Manrope-Bold.ttf'),
    ManropeExtraBold: require('../assets/fonts/Manrope-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return <RootLayout />;
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppProvider>
            <KeyboardProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </KeyboardProvider>
          </AppProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
