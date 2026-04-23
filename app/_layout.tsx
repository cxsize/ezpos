import '../global.css';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureSignedIn } from '~/lib/firebase';
import { subscribeProducts, subscribeCoupons } from '~/lib/catalog';
import { useCatalog } from '~/state/catalog';
import { colors } from '~/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
    BodoniModa: require('../assets/fonts/BodoniModa-Regular.ttf'),
    NotoSansThai: require('../assets/fonts/NotoSansThai-Regular.ttf'),
    NotoSerifThai: require('../assets/fonts/NotoSerifThai-Regular.ttf'),
  });
  const [bootstrapped, setBootstrapped] = useState(false);
  const setProducts = useCatalog((s) => s.setProducts);
  const setCoupons = useCatalog((s) => s.setCoupons);
  const setLoaded = useCatalog((s) => s.setLoaded);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  useEffect(() => {
    let offP: (() => void) | undefined;
    let offC: (() => void) | undefined;
    (async () => {
      try {
        await ensureSignedIn();
        offP = subscribeProducts((p) => {
          setProducts(p);
          setLoaded(true);
        });
        offC = subscribeCoupons(setCoupons);
      } catch (e) {
        console.warn('Firebase bootstrap failed:', e);
      } finally {
        setBootstrapped(true);
      }
    })();
    return () => {
      offP?.();
      offC?.();
    };
  }, [setProducts, setCoupons, setLoaded]);

  useEffect(() => {
    if (fontsLoaded && bootstrapped) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, bootstrapped]);

  if (!fontsLoaded || !bootstrapped) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
