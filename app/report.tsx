import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '~/components/Icon';
import { useT } from '~/i18n/useT';
import { subscribeRecentSales } from '~/lib/sales';
import { fmtTHB, fmtTHB2 } from '~/lib/money';
import type { Sale } from '~/types';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export default function ReportScreen() {
  const router = useRouter();
  const { t, isTH } = useT();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Local-time start-of-day timestamp.
  const [day, setDay] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    const off = subscribeRecentSales((items) => {
      setSales(items);
      setLoaded(true);
    });
    return off;
  }, []);

  const dayStart = day;
  const dayEnd = day + DAY_MS;

  const dayLabel = useMemo(
    () =>
      new Date(day).toLocaleDateString(isTH ? 'th-TH' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
    [day, isTH],
  );

  const report = useMemo(() => {
    const inRange = sales.filter((s) => s.createdAt >= dayStart && s.createdAt < dayEnd);
    const active = inRange.filter((s) => !s.voided);
    const voided = inRange.filter((s) => s.voided);

    const gross = active.reduce((sum, s) => sum + s.total, 0);
    const cash = active.filter((s) => s.method === 'cash').reduce((sum, s) => sum + s.total, 0);
    const qr = active.filter((s) => s.method === 'qr').reduce((sum, s) => sum + s.total, 0);

    const itemTotals = new Map<string, { name: string; thName: string; qty: number; amount: number }>();
    for (const s of active) {
      for (const i of s.items) {
        const key = i.productId;
        const cur = itemTotals.get(key) ?? { name: i.name, thName: i.thName, qty: 0, amount: 0 };
        cur.qty += i.qty;
        cur.amount += i.price * i.qty;
        itemTotals.set(key, cur);
      }
    }
    const topItems = [...itemTotals.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    return {
      gross,
      count: active.length,
      avg: active.length > 0 ? Math.round(gross / active.length) : 0,
      cash,
      qr,
      voidedCount: voided.length,
      voidedAmount: voided.reduce((sum, s) => sum + s.total, 0),
      topItems,
    };
  }, [sales, dayStart, dayEnd]);

  const today = startOfDay(new Date());
  const canGoForward = day < today;

  return (
    <View className="flex-1 bg-bg">
      <View className="h-14 px-5 flex-row items-center gap-3 bg-panel border-b border-line">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-[6px] py-2 px-2">
          <Icon name="back" size={20} color="#68615c" />
          <Text className="text-ink-2 text-[14px] font-medium">{t.back}</Text>
        </Pressable>
        <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
          {t.reportTitle}
        </Text>
      </View>

      <View className="px-6 pt-4 flex-row items-center gap-3">
        <Pressable
          onPress={() => setDay((d) => d - DAY_MS)}
          className="w-9 h-9 rounded-full bg-bg-soft items-center justify-center"
        >
          <Icon name="arrowLeft" size={18} color="#68615c" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">{t.reportDate}</Text>
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[18px] text-ink mt-[2px]">
            {dayLabel}
          </Text>
        </View>
        <Pressable
          onPress={() => canGoForward && setDay((d) => d + DAY_MS)}
          disabled={!canGoForward}
          className={`w-9 h-9 rounded-full items-center justify-center ${
            canGoForward ? 'bg-bg-soft' : 'bg-bg-soft opacity-30'
          }`}
        >
          <Icon name="arrowRight" size={18} color="#68615c" />
        </Pressable>
      </View>

      {!loaded ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, gap: 18 }}>
          <View className="bg-panel rounded-[20px] border border-line p-6 items-center">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.reportSubGross}
            </Text>
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[42px] text-ink mt-1">
              {fmtTHB2(report.gross)}
            </Text>
            <Text className="text-ink-3 text-[12px] mt-1">
              {report.count} · {t.reportSubCount.toLowerCase()}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <StatCard label={t.reportSubCount} value={String(report.count)} />
            <StatCard label={t.reportSubAvg} value={fmtTHB(report.avg)} />
            <StatCard label={t.reportSubVoided} value={String(report.voidedCount)} muted />
          </View>

          <View className="flex-row gap-3">
            <StatCard label={t.reportSubCash} value={fmtTHB(report.cash)} accent="#355e4c" />
            <StatCard label={t.reportSubQr} value={fmtTHB(report.qr)} accent="#7a1a37" />
          </View>

          <View className="bg-panel rounded-[20px] border border-line p-5 gap-3">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.reportTopItems}
            </Text>
            {report.topItems.length === 0 ? (
              <Text className="text-ink-3 text-[13px]">—</Text>
            ) : (
              report.topItems.map((item, idx) => (
                <View key={item.name} className="flex-row items-center gap-3 py-1">
                  <Text className="text-ink-3 text-[11px] w-5">{idx + 1}</Text>
                  <View className="flex-1">
                    <Text className="text-ink text-[13px]">{isTH ? item.thName : item.name}</Text>
                  </View>
                  <Text className="text-ink-2 text-[12px]">×{item.qty}</Text>
                  <Text style={{ fontFamily: 'BodoniModa' }} className="text-ink text-[14px] min-w-[72px] text-right">
                    {fmtTHB(item.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: string;
  muted?: boolean;
}) {
  return (
    <View
      className={`flex-1 rounded-[16px] border border-line p-4 ${muted ? 'bg-bg-soft' : 'bg-panel'}`}
    >
      <Text className="text-ink-3 text-[11px] uppercase tracking-[0.1em]">{label}</Text>
      <Text
        style={{ fontFamily: 'BodoniModa', color: accent ?? (muted ? '#68615c' : '#1a1614') }}
        className="text-[22px] mt-1"
      >
        {value}
      </Text>
    </View>
  );
}
