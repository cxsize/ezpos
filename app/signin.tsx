import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '~/components/Icon';
import { authenticate, hasAnyCashier, listCashiers } from '~/lib/cashiers';
import { useSession } from '~/state/session';
import { useT } from '~/i18n/useT';
import type { Cashier } from '~/types';

export default function SignIn() {
  const { t } = useT();
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [selected, setSelected] = useState<Cashier | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!(await hasAnyCashier())) {
          router.replace('/enroll');
          return;
        }
        const list = await listCashiers();
        setCashiers(list);
        if (list.length === 1) setSelected(list[0]);
      } finally {
        setBusy(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (pin.length !== 4 || !selected) return;
    setBusy(true);
    (async () => {
      const c = await authenticate(selected.id, pin);
      if (c) {
        signIn(c);
        router.replace('/sale');
      } else {
        setError(t.pinWrong);
        setPin('');
      }
      setBusy(false);
    })();
  }, [pin, selected, signIn, router, t]);

  const press = (k: string) => {
    setError(null);
    if (k === 'back') return setPin((p) => p.slice(0, -1));
    if (k === 'clear') return setPin('');
    if (pin.length < 4) setPin((p) => p + k);
  };

  if (busy && cashiers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <View className="w-[720px] bg-panel rounded-[28px] border border-line p-10 flex-row gap-10">
        <View className="flex-1 gap-5">
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[34px] text-ink">
            {t.pinTitle}
          </Text>
          <Text className="text-ink-2 text-[14px]">{t.pinSub}</Text>

          <View className="gap-2">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.pinBadge}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {cashiers.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setSelected(c);
                    setPin('');
                    setError(null);
                  }}
                  className={`px-4 py-3 rounded-xl border ${
                    selected?.id === c.id ? 'border-ink bg-panel-2' : 'border-line'
                  }`}
                >
                  <Text className="text-ink text-[14px]">{c.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/enroll')}
            className="self-start mt-2 flex-row items-center gap-2"
          >
            <Icon name="plus" size={14} />
            <Text className="text-ink-2 text-[12px] uppercase tracking-[0.1em]">
              {t.pinAddCashier}
            </Text>
          </Pressable>
        </View>

        <View className="w-[280px] gap-4">
          <PinDots value={pin} />
          {error && <Text className="text-danger text-center text-[13px]">{error}</Text>}
          <Keypad onPress={press} disabled={!selected || busy} />
        </View>
      </View>
    </View>
  );
}

function PinDots({ value }: { value: string }) {
  const dots = useMemo(() => [0, 1, 2, 3], []);
  return (
    <View className="flex-row justify-center gap-4 py-4">
      {dots.map((i) => (
        <View
          key={i}
          className={`w-4 h-4 rounded-full ${value.length > i ? 'bg-ink' : 'bg-line'}`}
        />
      ))}
    </View>
  );
}

function Keypad({ onPress, disabled }: { onPress: (k: string) => void; disabled?: boolean }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];
  return (
    <View className="flex-row flex-wrap gap-2">
      {keys.map((k) => (
        <Pressable
          key={k}
          disabled={disabled}
          onPress={() => onPress(k)}
          className={`w-[calc(33.333%-6px)] h-[60px] items-center justify-center rounded-[14px] bg-panel border border-line ${
            disabled ? 'opacity-40' : ''
          }`}
          style={{ width: 80 }}
        >
          {k === 'back' ? (
            <Icon name="back" size={22} />
          ) : k === 'clear' ? (
            <Text className="text-ink-3 text-[14px] uppercase tracking-[0.1em]">C</Text>
          ) : (
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[26px] text-ink">
              {k}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
