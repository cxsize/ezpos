import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '~/components/Icon';
import { useT } from '~/i18n/useT';
import { useSession } from '~/state/session';
import { isOwner } from '~/lib/cashiers';
import { subscribeRecentSales, voidSale } from '~/lib/sales';
import { printReceipt } from '~/hardware/printer';
import { fmtTHB } from '~/lib/money';
import type { Sale } from '~/types';

type Filter = 'today' | 'week' | 'all';

const DAY_MS = 24 * 60 * 60 * 1000;

export default function HistoryScreen() {
  const router = useRouter();
  const { t, isTH } = useT();
  const cashier = useSession((s) => s.cashier);
  const owner = isOwner(cashier);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('today');
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null);

  useEffect(() => {
    const off = subscribeRecentSales((items) => {
      setSales(items);
      setLoaded(true);
    });
    return off;
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return sales;
    const cutoff = Date.now() - (filter === 'today' ? DAY_MS : 7 * DAY_MS);
    const sameDay = (a: number) => {
      const d = new Date(a);
      const n = new Date();
      return d.getFullYear() === n.getFullYear()
        && d.getMonth() === n.getMonth()
        && d.getDate() === n.getDate();
    };
    return filter === 'today'
      ? sales.filter((s) => sameDay(s.createdAt))
      : sales.filter((s) => s.createdAt >= cutoff);
  }, [sales, filter]);

  return (
    <View className="flex-1 bg-bg">
      <View className="h-14 px-5 flex-row items-center gap-3 bg-panel border-b border-line">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-[6px] py-2 px-2">
          <Icon name="back" size={20} color="#68615c" />
          <Text className="text-ink-2 text-[14px] font-medium">{t.back}</Text>
        </Pressable>
        <View className="flex-1">
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
            {t.history}
          </Text>
          <Text className="text-ink-3 text-[11px] uppercase tracking-[0.08em]">{t.historySub}</Text>
        </View>
      </View>

      <View className="px-6 pt-4 flex-row gap-[6px]">
        {(['today', 'week', 'all'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`px-[14px] py-[8px] rounded-full ${filter === f ? 'bg-ink' : 'bg-bg-soft'}`}
          >
            <Text
              className={`text-[12px] uppercase tracking-[0.08em] ${
                filter === f ? 'text-panel' : 'text-ink-3'
              }`}
            >
              {f === 'today' ? t.filterToday : f === 'week' ? t.filterWeek : t.filterAll}
            </Text>
          </Pressable>
        ))}
      </View>

      {!loaded ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <View className="w-[72px] h-[72px] rounded-full bg-bg-soft items-center justify-center">
            <Icon name="receipt" size={32} stroke={1.4} color="#a39c96" />
          </View>
          <Text className="text-ink-2 text-[14px]">{t.noSales}</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, gap: 10 }}
        >
          {filtered.map((sale) => (
            <SaleRow
              key={sale.id}
              sale={sale}
              isTH={isTH}
              t={t}
              isOwner={owner}
              onVoid={() => setVoidTarget(sale)}
            />
          ))}
        </ScrollView>
      )}

      <VoidModal
        sale={voidTarget}
        onClose={() => setVoidTarget(null)}
        cashierId={cashier?.id ?? ''}
        cashierName={cashier?.name ?? ''}
      />
    </View>
  );
}

function SaleRow({
  sale,
  isTH,
  t,
  isOwner,
  onVoid,
}: {
  sale: Sale;
  isTH: boolean;
  t: ReturnType<typeof useT>['t'];
  isOwner: boolean;
  onVoid: () => void;
}) {
  const [reprintBusy, setReprintBusy] = useState(false);
  const [reprintError, setReprintError] = useState<string | null>(null);
  const when = new Date(sale.createdAt);
  const timeStr = when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = when.toLocaleDateString(isTH ? 'th-TH' : 'en-US', {
    month: 'short',
    day: '2-digit',
  });
  const voided = !!sale.voided;

  const doReprint = async () => {
    setReprintBusy(true);
    setReprintError(null);
    try {
      await printReceipt(sale, { isTH });
    } catch (e) {
      setReprintError((e as Error).message ?? t.reprintFailed);
    } finally {
      setReprintBusy(false);
    }
  };

  return (
    <View
      className={`bg-panel rounded-[16px] p-4 border border-line ${voided ? 'opacity-70' : ''}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-ink text-[14px] font-medium">{sale.receiptNo}</Text>
          <Text className="text-ink-3 text-[11px] uppercase tracking-[0.08em]">
            {dateStr} · {timeStr}
          </Text>
          {voided && (
            <View className="bg-danger/10 px-2 py-[2px] rounded">
              <Text className="text-danger text-[10px] uppercase tracking-[0.08em]">
                {t.voidBadge}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
          {fmtTHB(sale.total)}
        </Text>
      </View>

      <Text numberOfLines={2} className="text-ink-2 text-[12.5px] mb-2">
        {sale.items
          .slice(0, 4)
          .map((i) => `${i.qty}× ${isTH ? i.thName : i.name}`)
          .join(', ')}
        {sale.items.length > 4 ? ` +${sale.items.length - 4}…` : ''}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-ink-3 text-[11px]">
          {sale.cashierName} · {sale.method === 'cash' ? t.cash : t.qr}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={doReprint}
            disabled={reprintBusy}
            className="flex-row items-center gap-[6px] px-3 py-2 rounded-[10px] bg-bg-soft"
          >
            {reprintBusy ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon name="printer" size={14} color="#68615c" />
            )}
            <Text className="text-ink-2 text-[12px]">{t.reprint}</Text>
          </Pressable>
          {isOwner && !voided && (
            <Pressable
              onPress={onVoid}
              className="flex-row items-center gap-[6px] px-3 py-2 rounded-[10px] bg-danger/10"
            >
              <Icon name="x" size={14} color="#9c2335" />
              <Text className="text-danger text-[12px]">{t.voidSale}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {reprintError && (
        <Text className="text-danger text-[11px] mt-2">{reprintError}</Text>
      )}
    </View>
  );
}

function VoidModal({
  sale,
  onClose,
  cashierId,
  cashierName,
}: {
  sale: Sale | null;
  onClose: () => void;
  cashierId: string;
  cashierName: string;
}) {
  const { t } = useT();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReason('');
    setError(null);
  }, [sale?.id]);

  const submit = async () => {
    if (!sale) return;
    setBusy(true);
    setError(null);
    try {
      await voidSale(sale.id, cashierId, cashierName, reason.trim() || undefined);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={!!sale} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40 items-center justify-center px-6"
      >
        <Pressable onPress={() => {}} className="w-[460px] bg-panel rounded-[20px] border border-line p-6 gap-4">
          <View>
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[22px] text-ink">
              {t.voidConfirmTitle}
            </Text>
            <Text className="text-ink-2 text-[13px] mt-1">{t.voidConfirmSub}</Text>
          </View>

          {sale && (
            <View className="bg-bg-soft rounded-[12px] p-3 gap-1">
              <Text className="text-ink text-[13px] font-medium">{sale.receiptNo}</Text>
              <Text className="text-ink-3 text-[11px]">
                {new Date(sale.createdAt).toLocaleString()} · {fmtTHB(sale.total)}
              </Text>
            </View>
          )}

          <View className="gap-2">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.voidReason}
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={t.voidReasonPlaceholder}
              placeholderTextColor="#a39c96"
              className="bg-bg-soft rounded-[10px] px-3 h-12 text-[14px] text-ink"
            />
          </View>

          {error && <Text className="text-danger text-[12px]">{error}</Text>}

          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 h-[48px] rounded-[12px] items-center justify-center bg-bg-soft"
            >
              <Text className="text-ink-2 text-[14px]">{t.back}</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              disabled={busy}
              className={`flex-1 h-[48px] rounded-[12px] items-center justify-center flex-row gap-2 ${
                busy ? 'bg-line' : 'bg-danger'
              }`}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-panel text-[14px] font-semibold uppercase tracking-[0.08em]">
                  {t.voidSale}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
