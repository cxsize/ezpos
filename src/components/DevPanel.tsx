// Floating dev tools — only mounts when EXPO_PUBLIC_MOCK_HARDWARE=true.
// Simulates what a Bluetooth scanner + thermal printer would do so the app
// runs in a browser or simulator without any hardware attached.

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from './Icon';
import { useCatalog } from '~/state/catalog';
import { emitScan } from '~/hardware/scanner';
import { devBus } from '~/hardware/devbus';
import { mockForceFailNextPrint } from '~/hardware/printer.mock';
import type { Sale } from '~/types';

const ENABLED = process.env.EXPO_PUBLIC_MOCK_HARDWARE === 'true';

export function DevPanel() {
  if (!ENABLED) return null;
  return <DevPanelImpl />;
}

function DevPanelImpl() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'scan' | 'print' | 'drawer'>('scan');
  const products = useCatalog((s) => s.products);
  const coupons = useCatalog((s) => s.coupons);

  const [receipts, setReceipts] = useState<Array<{ sale: Sale; lines: string[]; at: number }>>([]);
  const [drawerBlinks, setDrawerBlinks] = useState(0);

  useEffect(() => {
    const offR = devBus.on('receipt:printed', ({ sale, lines }) =>
      setReceipts((r) => [{ sale, lines, at: Date.now() }, ...r].slice(0, 20))
    );
    const offD = devBus.on('drawer:kick', () => setDrawerBlinks((n) => n + 1));
    return () => {
      offR();
      offD();
    };
  }, []);

  const latest = receipts[0];
  const sampleProducts = useMemo(() => products.slice(0, 8), [products]);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="absolute bottom-5 left-5 h-10 rounded-full px-4 bg-ink flex-row items-center gap-2"
        style={{ elevation: 6 }}
      >
        <View className="w-2 h-2 rounded-full bg-forest" />
        <Text className="text-panel text-[11px] uppercase tracking-[0.12em]">Dev</Text>
        {drawerBlinks > 0 && (
          <Text className="text-panel/70 text-[11px]">· drawer x{drawerBlinks}</Text>
        )}
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 bg-black/40">
          <Pressable
            onPress={() => {}}
            className="absolute right-0 top-0 bottom-0 w-[420px] bg-panel border-l border-line"
          >
            <View className="h-14 flex-row items-center gap-3 px-4 border-b border-line">
              <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
                Dev tools
              </Text>
              <View className="flex-1" />
              <Pressable
                onPress={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-bg-soft items-center justify-center"
              >
                <Icon name="x" size={20} color="#68615c" />
              </Pressable>
            </View>

            <View className="flex-row gap-1 p-3 bg-panel-2">
              {(['scan', 'print', 'drawer'] as const).map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setTab(k)}
                  className={`px-3 py-2 rounded-full ${tab === k ? 'bg-panel border border-line' : ''}`}
                >
                  <Text
                    className={`text-[11px] uppercase tracking-[0.08em] ${
                      tab === k ? 'text-ink' : 'text-ink-3'
                    }`}
                  >
                    {k}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tab === 'scan' && (
              <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                <Section label="Inject product scan (SKU)">
                  <View className="flex-row flex-wrap gap-2">
                    {sampleProducts.map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => emitScan(p.sku)}
                        className="bg-panel border border-line rounded-[12px] px-3 py-2"
                      >
                        <Text className="text-ink text-[12px]">{p.name}</Text>
                        <Text className="text-ink-3 text-[10px]">{p.sku}</Text>
                      </Pressable>
                    ))}
                  </View>
                </Section>
                <Section label="Inject coupon barcode">
                  <View className="gap-2">
                    {coupons.map((c) => (
                      <Pressable
                        key={c.code}
                        onPress={() => emitScan(c.barcode)}
                        className="bg-panel border border-line rounded-[12px] px-3 py-2 flex-row justify-between"
                      >
                        <View>
                          <Text className="text-ink text-[12px]">{c.name}</Text>
                          <Text className="text-ink-3 text-[10px]">{c.barcode}</Text>
                        </View>
                        <Text className="text-burgundy text-[11px] uppercase tracking-[0.12em]">
                          {c.code}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Section>
              </ScrollView>
            )}

            {tab === 'print' && (
              <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => mockForceFailNextPrint()}
                    className="flex-1 bg-bg-soft border border-line rounded-[12px] px-3 py-2"
                  >
                    <Text className="text-ink-2 text-[12px] text-center">Fail next print</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setReceipts([])}
                    className="flex-1 bg-bg-soft border border-line rounded-[12px] px-3 py-2"
                  >
                    <Text className="text-ink-2 text-[12px] text-center">Clear log</Text>
                  </Pressable>
                </View>

                {latest ? (
                  <View className="bg-panel-2 border border-line rounded-[12px] p-4">
                    <Text className="text-ink-3 text-[10px] uppercase tracking-[0.12em] mb-2">
                      Latest receipt
                    </Text>
                    <Text
                      style={{ fontFamily: 'Courier', fontSize: 11, lineHeight: 16, color: '#1a1614' }}
                      selectable
                    >
                      {latest.lines.join('\n')}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-ink-3 text-[12px] text-center py-8">No receipts yet</Text>
                )}

                {receipts.slice(1).map((r) => (
                  <View key={r.at} className="bg-panel border border-line rounded-[12px] p-3">
                    <Text className="text-ink-3 text-[11px]">
                      {new Date(r.at).toLocaleTimeString()} · {r.sale.receiptNo} · ฿{r.sale.total}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {tab === 'drawer' && (
              <View className="p-4 gap-3">
                <Text className="text-ink-3 text-[12px]">
                  Mock cash drawer kick count: {drawerBlinks}
                </Text>
                <Pressable
                  onPress={() => setDrawerBlinks(0)}
                  className="self-start bg-bg-soft border border-line rounded-[12px] px-3 py-2"
                >
                  <Text className="text-ink-2 text-[12px]">Reset count</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-ink-3 text-[10px] uppercase tracking-[0.12em]">{label}</Text>
      {children}
    </View>
  );
}
