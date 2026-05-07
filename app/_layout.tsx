import '../global.css';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// We alias Inter as "Geist" — they're both humanist geometric sans, and
// keeping the Geist name means nothing else in the codebase has to change.
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';
import { NotoSansThai_400Regular } from '@expo-google-fonts/noto-sans-thai';
import { NotoSerifThai_400Regular } from '@expo-google-fonts/noto-serif-thai';

import { ensureSignedIn } from '~/lib/firebase';
import { subscribeProducts, subscribeCoupons, loadCachedCatalog } from '~/lib/catalog';
import { flushSaleQueue } from '~/lib/sales';
import { ensureDevCashier, authenticate, DEV_CASHIER_ID, DEV_CASHIER_PIN } from '~/lib/cashiers';
import { useCatalog } from '~/state/catalog';
import { useSession } from '~/state/session';
import { colors } from '~/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

const MOCK = process.env.EXPO_PUBLIC_MOCK_HARDWARE === 'true';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist: Inter_400Regular,
    'Geist-Medium': Inter_500Medium,
    BodoniModa: BodoniModa_400Regular,
    NotoSansThai: NotoSansThai_400Regular,
    NotoSerifThai: NotoSerifThai_400Regular,
  });
  const [bootstrapped, setBootstrapped] = useState(false);
  const setProducts = useCatalog((s) => s.setProducts);
  const setCoupons = useCatalog((s) => s.setCoupons);
  const setLoaded = useCatalog((s) => s.setLoaded);
  const setOnline = useCatalog((s) => s.setOnline);
  const sessionSignIn = useSession((s) => s.signIn);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    }
  }, []);

  useEffect(() => {
    let offP: (() => void) | undefined;
    let offC: (() => void) | undefined;
    let wasOffline = false;

    (async () => {
      try {
        // Show cached catalog immediately — no network wait on startup.
        const cached = await loadCachedCatalog();
        if (cached) {
          setProducts(cached.products);
          setCoupons(cached.coupons);
          setLoaded(true);
        }

        await ensureSignedIn();

        offP = subscribeProducts(
          (p) => {
            setProducts(p);
            setLoaded(true);
          },
          (fromCache) => {
            setOnline(!fromCache);
            // Flush any sales that were saved while offline.
            if (wasOffline && !fromCache) {
              flushSaleQueue().catch(() => {});
            }
            wasOffline = fromCache;
          },
        );
        offC = subscribeCoupons(setCoupons);

        if (MOCK) {
          await ensureDevCashier();
          const cashier = await authenticate(DEV_CASHIER_ID, DEV_CASHIER_PIN);
          if (cashier) sessionSignIn(cashier);
        }
      } catch (e) {
        console.warn('Bootstrap failed:', e);
      } finally {
        setBootstrapped(true);
      }
    })();
    return () => {
      offP?.();
      offC?.();
    };
  }, [setProducts, setCoupons, setLoaded, setOnline, sessionSignIn]);

  useEffect(() => {
    if (fontsLoaded && bootstrapped) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, bootstrapped]);

  if (!fontsLoaded || !bootstrapped) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
        }}
      >
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
