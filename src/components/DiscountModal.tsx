import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from './Icon';
import { useT } from '~/i18n/useT';
import { useCatalog } from '~/state/catalog';
import { useSale } from '~/state/sale';
import { fmtTHB } from '~/lib/money';
import { setScanHandler, emitScan } from '~/hardware/scanner';
import type { Coupon, Discount } from '~/types';

type Mode = 'coupon' | 'manual';

export function DiscountModal() {
  const { t, isTH } = useT();
  const open = useSale((s) => s.discOpen);
  const setOpen = useSale((s) => s.setDiscOpen);
  const current = useSale((s) => s.discount);
  const setDiscount = useSale((s) => s.setDiscount);
  const coupons = useCatalog((s) => s.coupons);

  const [mode, setMode] = useState<Mode>('coupon');
  const [type, setType] = useState<'pct' | 'amt'>('pct');
  const [val, setVal] = useState('');
  const [flashCode, setFlashCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const hasCode = current.type !== 'none' && 'code' in current && current.code;
    setMode(hasCode ? 'coupon' : current.type === 'amt' || (current.type === 'pct' && current.value) ? 'manual' : 'coupon');
    setType(current.type === 'amt' ? 'amt' : 'pct');
    setVal(current.type !== 'none' ? String(current.value) : '');
    setFlashCode((hasCode && 'code' in current && current.code) || null);
  }, [open, current]);

  // While the modal is open, route scanner to coupon pick
  useEffect(() => {
    if (!open) return;
    const prev = (code: string) => {
      const c = coupons.find((x) => x.barcode === code);
      if (c) pickCoupon(c);
    };
    setScanHandler(prev);
    return () => setScanHandler(null);
  }, [open, coupons]);

  if (!open) return null;

  const apply = (d: Discount) => {
    setDiscount(d);
    setOpen(false);
  };

  const pickCoupon = (c: Coupon) => {
    setFlashCode(c.code);
    setTimeout(() => {
      apply({ type: c.type, value: c.value, code: c.code, name: isTH ? c.thName : c.name });
    }, 280);
  };

  const press = (k: string) => {
    if (k === 'back') return setVal((v) => v.slice(0, -1));
    if (k === 'clear') return setVal('');
    setVal((v) => (v + k).replace(/^0+(?=\d)/, ''));
  };

  const quick = type === 'pct' ? [5, 10, 15, 20, 50] : [20, 50, 100];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable
        onPress={() => setOpen(false)}
        className="flex-1 bg-black/40 items-center justify-center"
      >
        <Pressable onPress={() => {}} className="w-[580px] bg-panel rounded-[28px] p-5 gap-[14px]">
          <View className="flex-row justify-between items-center">
            <Text className="text-ink text-[17px] font-semibold">{t.discountTitle}</Text>
            <Pressable
              onPress={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-bg-soft items-center justify-center"
            >
              <Icon name="x" size={22} color="#68615c" />
            </Pressable>
          </View>

          <View className="flex-row gap-[6px] bg-bg-soft p-1 rounded-[12px]">
            <Pressable
              onPress={() => setMode('coupon')}
              className={`flex-1 p-[10px] rounded-[9px] items-center flex-row justify-center gap-[7px] ${
                mode === 'coupon' ? 'bg-panel' : ''
              }`}
            >
              <Icon name="percent" size={14} color={mode === 'coupon' ? '#1a1614' : '#a39c96'} />
              <Text className={`text-[13px] font-medium ${mode === 'coupon' ? 'text-ink' : 'text-ink-3'}`}>
                {t.coupons}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('manual')}
              className={`flex-1 p-[10px] rounded-[9px] items-center flex-row justify-center gap-[7px] ${
                mode === 'manual' ? 'bg-panel' : ''
              }`}
            >
              <Icon name="calc" size={14} color={mode === 'manual' ? '#1a1614' : '#a39c96'} />
              <Text className={`text-[13px] font-medium ${mode === 'manual' ? 'text-ink' : 'text-ink-3'}`}>
                {t.manualAdjust}
              </Text>
            </Pressable>
          </View>

          {mode === 'coupon' ? (
            <View className="gap-3">
              <Pressable
                onPress={() => {
                  // Simulate a random coupon scan if no real scanner is attached yet.
                  if (coupons.length > 0) emitScan(coupons[Math.floor(Math.random() * coupons.length)].barcode);
                }}
                className="flex-row items-center gap-[14px] px-[18px] py-[14px] rounded-[14px] border border-dashed border-burgundy-l bg-burgundy-ll"
              >
                <View className="w-12 h-12 rounded-[12px] bg-panel items-center justify-center">
                  <Icon name="scan" size={28} stroke={1.5} color="#7a1a37" />
                </View>
                <View className="flex-1">
                  <Text className="text-ink text-[15px] font-medium">{t.scanCoupon}</Text>
                  <Text className="text-ink-3 text-[11.5px] mt-[2px]">{t.scanCouponHint}</Text>
                </View>
              </Pressable>

              <ScrollView className="max-h-[320px]" contentContainerStyle={{ gap: 7 }}>
                {coupons.map((c) => (
                  <Pressable
                    key={c.code}
                    onPress={() => pickCoupon(c)}
                    className={`flex-row items-center gap-[14px] px-4 py-3 bg-panel rounded-[12px] border ${
                      flashCode === c.code ? 'border-burgundy bg-burgundy-ll' : 'border-line'
                    }`}
                  >
                    <View className="flex-1 gap-1">
                      <Text className="text-burgundy text-[10px] tracking-[0.16em] uppercase font-semibold">
                        {c.code}
                      </Text>
                      <Text className="text-ink text-[14px] font-medium">
                        {isTH ? c.thName : c.name}
                      </Text>
                      <Text className="text-ink-3 text-[9.5px] tracking-[0.08em]">{c.barcode}</Text>
                    </View>
                    <View className="flex-row items-baseline gap-[1px]">
                      {c.type === 'pct' ? (
                        <>
                          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[32px] text-ink">
                            {c.value}
                          </Text>
                          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[17px] text-ink-2">
                            %
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[17px] text-ink-2">
                            ฿
                          </Text>
                          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[32px] text-ink">
                            {c.value}
                          </Text>
                        </>
                      )}
                    </View>
                  </Pressable>
                ))}
                {coupons.length === 0 && (
                  <Text className="text-ink-3 text-[12px] text-center py-6">No coupons configured</Text>
                )}
              </ScrollView>

              <View className="flex-row gap-[10px]">
                <Pressable
                  onPress={() => apply({ type: 'none', value: 0 })}
                  className="flex-1 h-[50px] rounded-[12px] bg-bg-soft items-center justify-center"
                >
                  <Text className="text-ink-2 text-[14px] font-medium">{t.noCoupon}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="gap-[14px]">
              <View className="flex-row gap-[6px] bg-bg-soft p-1 rounded-[12px]">
                {(['pct', 'amt'] as const).map((x) => (
                  <Pressable
                    key={x}
                    onPress={() => setType(x)}
                    className={`flex-1 p-[10px] rounded-[9px] items-center ${type === x ? 'bg-panel' : ''}`}
                  >
                    <Text className={`text-[14px] font-medium ${type === x ? 'text-ink' : 'text-ink-3'}`}>
                      {x === 'pct' ? t.percent : t.amount}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="items-center py-4 bg-bg-soft rounded-[16px] flex-row justify-center gap-[6px]">
                <Text style={{ fontFamily: 'BodoniModa' }} className="text-[64px] text-ink">
                  {val || '0'}
                </Text>
                <Text style={{ fontFamily: 'BodoniModa' }} className="text-[36px] text-ink-3">
                  {type === 'pct' ? '%' : '฿'}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-[6px] justify-center">
                {quick.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => setVal(String(q))}
                    className="bg-panel border border-line-2 rounded-[12px] px-4 py-[10px]"
                  >
                    <Text className="text-ink text-[14px] font-medium">
                      {type === 'pct' ? `${q}%` : fmtTHB(q)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <ManualKeypad onPress={press} />
              <View className="flex-row gap-[10px]">
                <Pressable
                  onPress={() => apply({ type: 'none', value: 0 })}
                  className="flex-1 h-[50px] rounded-[12px] bg-bg-soft items-center justify-center"
                >
                  <Text className="text-ink-2 text-[14px] font-medium">{t.remove}</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    apply({ type, value: Number(val) || 0 } as Discount)
                  }
                  className="flex-1 h-[50px] rounded-[12px] bg-burgundy items-center justify-center"
                >
                  <Text className="text-panel text-[14px] font-medium">{t.apply}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ManualKeypad({ onPress }: { onPress: (k: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];
  return (
    <View className="flex-row flex-wrap gap-2">
      {keys.map((k) => {
        const muted = k === 'clear' || k === 'back';
        return (
          <Pressable
            key={k}
            onPress={() => onPress(k)}
            className={`rounded-[14px] items-center justify-center border border-line ${
              muted ? 'bg-panel-2' : 'bg-panel'
            }`}
            style={{ width: '31.5%', height: 56 }}
          >
            {k === 'back' ? (
              <Icon name="back" size={22} color="#a39c96" />
            ) : k === 'clear' ? (
              <Text className="text-ink-3 text-[16px]">C</Text>
            ) : (
              <Text style={{ fontFamily: 'BodoniModa' }} className="text-[24px] text-ink">
                {k}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
