import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useT } from '~/i18n/useT';
import { useSettings } from '~/state/settings';
import { useSession } from '~/state/session';

export function TopBar() {
  const { t, lang } = useT();
  const setLang = useSettings((s) => s.setLang);
  const cashier = useSession((s) => s.cashier);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View className="h-14 px-[22px] flex-row items-center gap-[14px] bg-panel border-b border-line">
      <Image source={require('../../assets/logo.jpg')} className="w-7 h-7 rounded-full" />
      <Text style={{ fontFamily: 'BodoniModa' }} className="text-[17px] text-ink">
        cakethakae
      </Text>
      <Text className="text-ink-3 font-light">·</Text>
      <Text className="text-ink-3 text-[11.5px] uppercase tracking-[0.14em]">{t.brandRegister}</Text>

      <View className="flex-1" />

      <View className="flex-row items-center gap-[18px]">
        <View className="flex-row border border-line rounded-full p-[2px] bg-bg-soft">
          <Pressable onPress={() => setLang('th')} className={pill(lang === 'th')}>
            <Text className={pillText(lang === 'th')}>ไทย</Text>
          </Pressable>
          <Pressable onPress={() => setLang('en')} className={pill(lang === 'en')}>
            <Text className={pillText(lang === 'en')}>EN</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-[7px]">
          <View className="w-[5px] h-[5px] rounded-full bg-forest" />
          <Text className="text-ink-2 text-[11.5px] uppercase tracking-[0.1em]">{t.online}</Text>
        </View>

        <Text className="text-ink-3 text-[12px]">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 rounded-full bg-bg-soft items-center justify-center">
            <Text className="text-[10.5px] text-ink font-medium">
              {(cashier?.name?.[0] ?? '·').toUpperCase()}
            </Text>
          </View>
          <Text className="text-ink-2 text-[12.5px]">{cashier?.name ?? '—'}</Text>
        </View>
      </View>
    </View>
  );
}

const pill = (on: boolean) =>
  `px-[11px] py-1 rounded-full ${on ? 'bg-panel' : 'bg-transparent'}`;
const pillText = (on: boolean) =>
  `text-[11px] tracking-[0.06em] font-medium ${on ? 'text-ink' : 'text-ink-3'}`;
