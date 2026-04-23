import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TopBar } from '~/components/TopBar';
import { SaleScreen } from '~/components/SaleScreen';
import { PayScreen } from '~/components/PayScreen';
import { DiscountModal } from '~/components/DiscountModal';
import { ScanCapture } from '~/components/ScanCapture';
import { Icon } from '~/components/Icon';
import { useSale } from '~/state/sale';
import { useSession } from '~/state/session';

export default function Sale() {
  const view = useSale((s) => s.view);
  const cashier = useSession((s) => s.cashier);
  const router = useRouter();

  React.useEffect(() => {
    if (!cashier) router.replace('/signin');
  }, [cashier, router]);

  return (
    <View className="flex-1 bg-bg">
      <TopBar />
      <View className="flex-1">
        {view === 'sale' ? <SaleScreen /> : <PayScreen />}
      </View>
      <DiscountModal />
      <ScanCapture />

      <Pressable
        onPress={() => router.push('/settings')}
        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-panel border border-line items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Icon name="settings" size={20} />
      </Pressable>
    </View>
  );
}
