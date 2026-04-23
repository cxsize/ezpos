import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '~/components/Icon';
import { createCashier } from '~/lib/cashiers';
import { useT } from '~/i18n/useT';

export default function Enroll() {
  const { t } = useT();
  const router = useRouter();
  const [name, setName] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = name.trim().length > 0 && /^\d{4}$/.test(pin1) && pin1 === pin2;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await createCashier(name, pin1);
      router.replace('/signin');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <View className="w-[480px] bg-panel rounded-[28px] border border-line p-10 gap-6">
        <View>
          <Text
            style={{ fontFamily: 'BodoniModa' }}
            className="text-[28px] text-ink"
          >
            {t.pinAddCashier}
          </Text>
          <Text className="text-ink-2 text-[13px] mt-1">{t.pinOwnerSetupSub}</Text>
        </View>

        <View className="gap-2">
          <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
            {t.pinCashierName}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="bg-panel-2 rounded-[12px] px-4 h-12 text-[16px] text-ink"
            placeholder="Ploy N."
            placeholderTextColor="#a39c96"
            autoCapitalize="words"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.pinSetPin}
            </Text>
            <TextInput
              value={pin1}
              onChangeText={(v) => setPin1(v.replace(/\D/g, '').slice(0, 4))}
              className="bg-panel-2 rounded-[12px] px-4 h-12 text-[22px] text-ink tracking-[0.3em]"
              placeholder="• • • •"
              placeholderTextColor="#a39c96"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.pinConfirmPin}
            </Text>
            <TextInput
              value={pin2}
              onChangeText={(v) => setPin2(v.replace(/\D/g, '').slice(0, 4))}
              className="bg-panel-2 rounded-[12px] px-4 h-12 text-[22px] text-ink tracking-[0.3em]"
              placeholder="• • • •"
              placeholderTextColor="#a39c96"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
          </View>
        </View>

        {pin1.length === 4 && pin2.length === 4 && pin1 !== pin2 && (
          <Text className="text-danger text-[13px]">{t.pinMismatch}</Text>
        )}
        {error && <Text className="text-danger text-[13px]">{error}</Text>}

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 h-[52px] rounded-[14px] items-center justify-center bg-bg-soft"
          >
            <Text className="text-ink-2 text-[14px]">{t.back}</Text>
          </Pressable>
          <Pressable
            onPress={submit}
            disabled={!canSubmit || busy}
            className={`flex-1 h-[52px] rounded-[14px] items-center justify-center flex-row gap-2 ${
              canSubmit && !busy ? 'bg-ink' : 'bg-line'
            }`}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check" size={16} color="#fff" />
                <Text className="text-panel text-[14px] uppercase tracking-[0.1em]">
                  {t.pinContinue}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
