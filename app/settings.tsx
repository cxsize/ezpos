import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '~/components/Icon';
import { useSettings, ACCENTS, type AccentKey } from '~/state/settings';
import { useSession } from '~/state/session';
import { useT } from '~/i18n/useT';
import { scanPrinters, type BleDevice } from '~/hardware/printer';

export default function Settings() {
  const router = useRouter();
  const { t } = useT();
  const { lang, accent, printerId, setLang, setAccent, setPrinterId } = useSettings();
  const signOut = useSession((s) => s.signOut);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const doScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const list = await scanPrinters();
      setDevices(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="h-14 px-5 flex-row items-center gap-3 bg-panel border-b border-line">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-[6px] py-2 px-2">
          <Icon name="back" size={20} color="#68615c" />
          <Text className="text-ink-2 text-[14px] font-medium">{t.back}</Text>
        </Pressable>
        <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
          {t.tweaksTitle}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, gap: 24 }}>
        <Section title={t.language}>
          <View className="flex-row gap-[6px] bg-bg-soft p-1 rounded-[10px] self-start">
            {(['th', 'en'] as const).map((l) => (
              <Pressable
                key={l}
                onPress={() => setLang(l)}
                className={`px-5 py-[10px] rounded-[8px] ${lang === l ? 'bg-panel' : ''}`}
              >
                <Text className={`text-[13px] ${lang === l ? 'text-ink font-medium' : 'text-ink-3'}`}>
                  {l === 'th' ? 'ไทย' : 'English'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title={t.accentColor}>
          <View className="flex-row gap-3">
            {(Object.entries(ACCENTS) as [AccentKey, (typeof ACCENTS)[AccentKey]][]).map(([k, v]) => (
              <Pressable
                key={k}
                onPress={() => setAccent(k)}
                className={`w-10 h-10 rounded-full border-2 ${accent === k ? 'border-ink' : 'border-transparent'}`}
                style={{ backgroundColor: v.primary }}
              />
            ))}
          </View>
        </Section>

        <Section title={t.hwPrinter}>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className={`w-[10px] h-[10px] rounded-full ${printerId ? 'bg-forest' : 'bg-ink-3'}`} />
              <Text className="text-ink text-[14px]">
                {printerId ? t.hwConnected : t.hwDisconnected}
              </Text>
              {printerId && (
                <Pressable onPress={() => setPrinterId(null)}>
                  <Text className="text-danger text-[12px] ml-2">{t.remove}</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={doScan}
              disabled={scanning}
              className="self-start bg-ink rounded-[12px] px-4 py-[10px] flex-row items-center gap-2"
            >
              {scanning ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="scan" size={16} color="#fff" />}
              <Text className="text-panel text-[13px] uppercase tracking-[0.08em]">
                {t.hwScanDevices}
              </Text>
            </Pressable>

            {error && <Text className="text-danger text-[12px]">{error}</Text>}

            {devices.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => setPrinterId(d.id)}
                className={`bg-panel border rounded-[12px] p-3 ${
                  printerId === d.id ? 'border-burgundy' : 'border-line'
                }`}
              >
                <Text className="text-ink text-[14px] font-medium">{d.name ?? '(unnamed)'}</Text>
                <Text className="text-ink-3 text-[11px] mt-1">{d.id}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Pressable
          onPress={() => {
            signOut();
            router.replace('/signin');
          }}
          className="self-start mt-4 bg-bg-soft rounded-[12px] px-4 py-3"
        >
          <Text className="text-ink-2 text-[13px]">{t.pinSignOut}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">{title}</Text>
      {children}
    </View>
  );
}
