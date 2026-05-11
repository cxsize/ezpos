import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from './Icon';
import { useT } from '~/i18n/useT';
import { useParked } from '~/state/parked';
import { useSale, totals } from '~/state/sale';
import { fmtTHB } from '~/lib/money';
import type { ParkedSale } from '~/types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ParkedModal({ visible, onClose }: Props) {
  const { t, isTH } = useT();
  const list = useParked((s) => s.list);
  const remove = useParked((s) => s.remove);
  const resume = useParked((s) => s.resume);
  const resumeFrom = useSale((s) => s.resumeFrom);
  const cartHasItems = useSale((s) => s.cart.length > 0);

  const onResume = (p: ParkedSale) => {
    if (cartHasItems) {
      // Don't silently clobber an in-progress sale. The cashier should park
      // or clear the current cart first.
      return;
    }
    const ps = resume(p.id);
    if (ps) {
      resumeFrom(ps);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/40 items-center justify-center">
        <Pressable onPress={() => {}} className="w-[520px] max-h-[80%] bg-panel rounded-[24px] border border-line p-6 gap-4">
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[22px] text-ink">
              {t.parkedSales}
            </Text>
            <Pressable onPress={onClose} className="w-9 h-9 rounded-full items-center justify-center bg-bg-soft">
              <Icon name="x" size={18} color="#68615c" />
            </Pressable>
          </View>

          {list.length === 0 ? (
            <View className="py-12 items-center gap-2">
              <View className="w-[64px] h-[64px] rounded-full bg-bg-soft items-center justify-center">
                <Icon name="receipt" size={28} stroke={1.4} color="#a39c96" />
              </View>
              <Text className="text-ink-2 text-[14px]">{t.parkedEmpty}</Text>
              <Text className="text-ink-3 text-[12px] text-center max-w-[280px]">
                {t.parkedEmptyHint}
              </Text>
            </View>
          ) : (
            <>
              {cartHasItems && (
                <View className="bg-bg-soft rounded-[10px] px-3 py-2">
                  <Text className="text-ink-3 text-[11.5px]">{t.parkedResumeBlocked}</Text>
                </View>
              )}
              <ScrollView className="max-h-[420px]" contentContainerStyle={{ gap: 10 }}>
                {list.map((p) => {
                  const { total, count } = totals(p.cart, p.discount);
                  const when = new Date(p.createdAt);
                  const timeStr = when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const preview = p.cart
                    .slice(0, 3)
                    .map((c) => `${c.qty}× ${isTH ? c.thName : c.name}`)
                    .join(', ');
                  const moreCount = p.cart.length - 3;
                  return (
                    <View
                      key={p.id}
                      className="bg-bg-soft rounded-[14px] p-4 gap-2 border border-line"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-ink-3 text-[11px] uppercase tracking-[0.1em]">
                          {timeStr} · {p.cashierName}
                        </Text>
                        <Text style={{ fontFamily: 'BodoniModa' }} className="text-[18px] text-ink">
                          {fmtTHB(total)}
                        </Text>
                      </View>
                      <Text numberOfLines={2} className="text-ink-2 text-[12.5px]">
                        {preview}
                        {moreCount > 0 ? ` +${moreCount}…` : ''}
                      </Text>
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-ink-3 text-[11px]">{t.itemsCount(count)}</Text>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => remove(p.id)}
                            className="flex-row items-center gap-[6px] px-3 py-2 rounded-[10px] bg-panel border border-line"
                          >
                            <Icon name="trash" size={14} color="#a39c96" />
                            <Text className="text-ink-3 text-[12px]">{t.remove}</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => onResume(p)}
                            disabled={cartHasItems}
                            className={`flex-row items-center gap-[6px] px-3 py-2 rounded-[10px] ${
                              cartHasItems ? 'bg-line' : 'bg-ink'
                            }`}
                          >
                            <Icon name="arrowRight" size={14} color={cartHasItems ? '#a39c96' : '#fff'} />
                            <Text className={`${cartHasItems ? 'text-ink-3' : 'text-panel'} text-[12px] uppercase tracking-[0.08em]`}>
                              {t.resume}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
