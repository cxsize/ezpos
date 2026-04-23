import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { Icon } from './Icon';
import { useT } from '~/i18n/useT';
import { useSale, totals } from '~/state/sale';
import { useSession } from '~/state/session';
import { useSettings } from '~/state/settings';
import { fmtTHB, fmtTHB2 } from '~/lib/money';
import { saveSale } from '~/lib/sales';
import { printReceipt, kickDrawer } from '~/hardware/printer';
import type { PayMethod, Sale } from '~/types';

export function PayScreen() {
  const { t } = useT();
  const {
    cart, discount, payStep, payMethod, cashTendered,
    backToSale, pickMethod, setCashTendered, confirmCash, completeSale, newSale,
  } = useSale();
  const { subtotal, discountAmt, total } = totals(cart, discount);

  return (
    <View className="flex-1">
      <View className="h-16 px-5 flex-row items-center gap-4 border-b border-line bg-panel">
        <Pressable onPress={backToSale} className="flex-row items-center gap-[6px] py-2 px-2">
          <Icon name="back" size={20} color="#68615c" />
          <Text className="text-ink-2 text-[14px] font-medium">{t.back}</Text>
        </Pressable>
        <Text className="flex-1 text-ink text-[16px] font-semibold">
          {payStep === 'method' && t.choosePayment}
          {payStep === 'cash' && t.cashPayment}
          {payStep === 'qr' && t.qrPayment}
          {payStep === 'drawer' && t.giveChange}
          {payStep === 'done' && t.saleComplete}
        </Text>
        <View className="flex-row items-baseline gap-[10px] px-4 py-[6px] bg-ink rounded-full">
          <Text className="text-[11.5px] text-white/50 uppercase tracking-[0.08em]">{t.total}</Text>
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[22px] text-panel">
            {fmtTHB2(total)}
          </Text>
        </View>
      </View>

      <View className="flex-1">
        {payStep === 'method' && <MethodPicker onPick={pickMethod} />}
        {payStep === 'cash' && (
          <CashPad
            total={total}
            tendered={cashTendered}
            setTendered={setCashTendered}
            onConfirm={confirmCash}
          />
        )}
        {payStep === 'qr' && <QRPay total={total} onPaid={() => completeSale('qr')} />}
        {payStep === 'drawer' && (
          <DrawerOpen
            total={total}
            tendered={cashTendered}
            onDone={() => completeSale('cash')}
          />
        )}
        {payStep === 'done' && (
          <DoneScreen
            subtotal={subtotal}
            discountAmt={discountAmt}
            total={total}
            method={payMethod!}
            onNewSale={newSale}
          />
        )}
      </View>
    </View>
  );
}

function MethodPicker({ onPick }: { onPick: (m: PayMethod) => void }) {
  const { t } = useT();
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="flex-row gap-5 max-w-[760px] w-full">
        <Pressable
          onPress={() => onPick('cash')}
          className="flex-1 bg-panel border border-line rounded-[20px] p-12 gap-[14px]"
        >
          <Icon name="cash" size={44} stroke={1.5} color="#355e4c" />
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[36px] text-ink">
            {t.cash}
          </Text>
          <Text className="text-ink-3 text-[11.5px] uppercase tracking-[0.08em]">{t.cashSub}</Text>
        </Pressable>
        <Pressable
          onPress={() => onPick('qr')}
          className="flex-1 bg-panel border border-line rounded-[20px] p-12 gap-[14px]"
        >
          <Icon name="qr" size={44} stroke={1.5} color="#7a1a37" />
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[36px] text-ink">
            {t.qr}
          </Text>
          <Text className="text-ink-3 text-[11.5px] uppercase tracking-[0.08em]">{t.qrSub}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CashPad({
  total,
  tendered,
  setTendered,
  onConfirm,
}: {
  total: number;
  tendered: string;
  setTendered: (v: string) => void;
  onConfirm: () => void;
}) {
  const { t } = useT();
  const amt = Number(tendered) || 0;
  const change = amt - total;
  const enough = amt >= total;
  const quick = useMemo(() => {
    const base: number[] = [total];
    [50, 100, 500, 1000].forEach((d) => {
      const v = Math.ceil(total / d) * d;
      if (!base.includes(v)) base.push(v);
    });
    return base.slice(0, 5);
  }, [total]);

  const press = (k: string) => {
    if (k === 'clear') return setTendered('');
    if (k === 'back') return setTendered(String(tendered).slice(0, -1));
    if (k === '00') return setTendered(String(tendered) + '00');
    setTendered(String(tendered) + k);
  };

  return (
    <View className="flex-1 p-6 flex-row gap-5">
      <View className="flex-1 gap-4">
        <View className="bg-panel border border-line rounded-[20px] p-6 gap-[6px]">
          <Row label={t.due} value={fmtTHB2(total)} />
          <View className="border-t border-line pt-3 mt-1">
            <Row
              label={t.tendered}
              value={tendered ? fmtTHB(amt) : '฿—'}
              valueStyle={{ fontFamily: 'BodoniModa', fontSize: 48, color: '#1a1614' }}
              labelEmphasize
            />
          </View>
          <View className="border-t-2 border-dashed border-line-2 pt-4 mt-[6px]">
            <Row
              label={t.change}
              value={enough ? fmtTHB2(change) : '—'}
              valueStyle={{
                fontFamily: 'BodoniModa',
                fontSize: 30,
                color: enough ? '#355e4c' : '#a39c96',
              }}
              labelEmphasize
            />
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {quick.map((v) => (
            <Pressable
              key={v}
              onPress={() => setTendered(String(v))}
              className="bg-panel border border-line-2 rounded-[12px] px-4 py-[10px]"
            >
              <Text className="text-ink text-[15px] font-medium">{fmtTHB(v)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View className="flex-1 gap-3">
        <Keypad onPress={press} />
        <Pressable
          onPress={onConfirm}
          disabled={!enough}
          className={`h-16 rounded-[16px] items-center justify-center flex-row gap-[10px] ${
            enough ? 'bg-forest' : 'bg-line-2'
          }`}
        >
          <Icon name="drawer" size={22} color={enough ? '#fff' : '#a39c96'} />
          <Text
            className={`${enough ? 'text-panel' : 'text-ink-3'} text-[16px] font-semibold`}
          >
            {t.openDrawer}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  valueStyle,
  labelEmphasize,
}: {
  label: string;
  value: string;
  valueStyle?: any;
  labelEmphasize?: boolean;
}) {
  return (
    <View className="flex-row items-baseline justify-between py-2">
      <Text className={`${labelEmphasize ? 'text-ink font-medium text-[15px]' : 'text-ink-2 text-[14px]'}`}>
        {label}
      </Text>
      <Text style={valueStyle} className="text-ink-2 text-[14px]">
        {value}
      </Text>
    </View>
  );
}

function Keypad({ onPress }: { onPress: (k: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'back'];
  return (
    <View className="flex-1 flex-row flex-wrap gap-2">
      {keys.map((k) => {
        const muted = k === '00' || k === 'back';
        return (
          <Pressable
            key={k}
            onPress={() => onPress(k)}
            className={`rounded-[14px] items-center justify-center border border-line ${
              muted ? 'bg-panel-2' : 'bg-panel'
            }`}
            style={{ width: '31.5%', height: '23%' }}
          >
            {k === 'back' ? (
              <Icon name="back" size={22} color={muted ? '#a39c96' : '#1a1614'} />
            ) : (
              <Text
                style={{ fontFamily: 'BodoniModa' }}
                className={`text-[26px] ${muted ? 'text-ink-3' : 'text-ink'}`}
              >
                {k}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function QRPay({ total, onPaid }: { total: number; onPaid: () => void }) {
  const { t } = useT();
  const [status, setStatus] = useState<'waiting' | 'paid'>('waiting');
  useEffect(() => {
    if (status === 'paid') {
      const id = setTimeout(onPaid, 900);
      return () => clearTimeout(id);
    }
  }, [status, onPaid]);

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-panel border border-line rounded-[28px] p-7 w-[420px] items-center gap-[18px]">
        <Text className="text-ink-3 text-[13px] uppercase tracking-[0.12em]">{t.promptpay}</Text>
        <Text style={{ fontFamily: 'BodoniModa' }} className="text-[42px] text-ink">
          {fmtTHB2(total)}
        </Text>
        <View
          className={`w-[260px] h-[260px] rounded-[16px] border-[10px] items-center justify-center ${
            status === 'paid' ? 'bg-forest border-forest' : 'bg-panel border-panel'
          }`}
          style={{
            shadowColor: status === 'paid' ? '#355e4c' : '#000',
            shadowOpacity: 0.2,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 10 },
          }}
        >
          {status === 'waiting' ? (
            <QRGraphic />
          ) : (
            <View className="items-center gap-[10px]">
              <Icon name="check" size={96} stroke={2.5} color="#fff" />
              <Text className="text-panel text-[14px] font-medium">{t.paymentReceived}</Text>
            </View>
          )}
        </View>
        <Text className="text-ink-3 text-[13.5px] text-center">
          {status === 'waiting' ? t.askCustomer : t.thankYou}
        </Text>
      </View>
      <Pressable
        onPress={() => setStatus('paid')}
        disabled={status === 'paid'}
        className="mt-4 bg-ink rounded-[12px] px-[22px] py-3 opacity-100"
        style={{ opacity: status === 'paid' ? 0.4 : 1 }}
      >
        <Text className="text-panel text-[13.5px]">{t.simulatePaid}</Text>
      </Pressable>
    </View>
  );
}

function QRGraphic() {
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      const on = (i * 7 + j * 13 + ((i * j) % 5)) % 3 === 0;
      if (on) cells.push(<Rect key={`${i}-${j}`} x={i * 8} y={j * 8} width={8} height={8} fill="#1f1a17" />);
    }
  }
  const corner = (x: number, y: number, key: string) => (
    <G key={key} x={x} y={y}>
      <Rect width={56} height={56} fill="#1f1a17" />
      <Rect x={8} y={8} width={40} height={40} fill="#fff" />
      <Rect x={16} y={16} width={24} height={24} fill="#1f1a17" />
    </G>
  );
  return (
    <Svg viewBox="0 0 200 200" width="100%" height="100%">
      <Rect width={200} height={200} fill="#fff" />
      {cells}
      {corner(0, 0, 'tl')}
      {corner(144, 0, 'tr')}
      {corner(0, 144, 'bl')}
    </Svg>
  );
}

function DrawerOpen({
  total,
  tendered,
  onDone,
}: {
  total: number;
  tendered: string;
  onDone: () => void;
}) {
  const { t } = useT();
  const amt = Number(tendered) || 0;
  const change = amt - total;

  useEffect(() => {
    kickDrawer().catch(() => {});
  }, []);

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-panel border border-line rounded-[28px] p-10 w-[480px] items-center gap-[18px]">
        <View className="w-24 h-24 rounded-[24px] items-center justify-center" style={{ backgroundColor: '#fdf5e1' }}>
          <Icon name="drawer" size={64} stroke={1.3} color="#c99a2b" />
        </View>
        <Text className="text-ink-3 text-[13px] uppercase tracking-[0.12em]">{t.drawerOpen}</Text>
        <View className="items-center my-2">
          <Text className="text-ink-2 text-[14px]">{t.changeDue}</Text>
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[84px] text-burgundy leading-none">
            {fmtTHB2(change)}
          </Text>
        </View>
        <View className="w-full bg-bg-soft rounded-[12px] p-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-ink-2 text-[14px]">{t.total}</Text>
            <Text className="text-ink-2 text-[14px]">{fmtTHB2(total)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-ink-2 text-[14px]">{t.cashReceived}</Text>
            <Text className="text-ink-2 text-[14px]">{fmtTHB2(amt)}</Text>
          </View>
        </View>
        <Pressable
          onPress={onDone}
          className="h-[58px] w-full rounded-[14px] bg-ink items-center justify-center flex-row gap-[10px] mt-1"
        >
          <Icon name="check" size={22} color="#fff" />
          <Text className="text-panel text-[15px] font-semibold">{t.drawerClosed}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DoneScreen({
  subtotal,
  discountAmt,
  total,
  method,
  onNewSale,
}: {
  subtotal: number;
  discountAmt: number;
  total: number;
  method: PayMethod;
  onNewSale: () => void;
}) {
  const { t, isTH } = useT();
  const { cart, discount, cashTendered } = useSale();
  const cashier = useSession((s) => s.cashier);
  const printerId = useSettings((s) => s.printerId);
  const [printStage, setPrintStage] = useState<'printing' | 'printed' | 'failed'>('printing');
  const [saveStage, setSaveStage] = useState<'saving' | 'saved' | 'failed'>('saving');

  const receiptNo = useMemo(() => 'R' + Math.floor(Math.random() * 900000 + 100000), []);
  const timestamp = useMemo(() => new Date(), []);

  useEffect(() => {
    const tendered = Number(cashTendered) || 0;
    const sale: Sale = {
      id: receiptNo,
      receiptNo,
      cashierId: cashier?.id ?? 'unknown',
      cashierName: cashier?.name ?? 'unknown',
      registerId: process.env.EXPO_PUBLIC_REGISTER_ID ?? '01',
      items: cart.map((i) => ({
        productId: i.id,
        name: i.name,
        thName: i.thName,
        qty: i.qty,
        price: i.price,
      })),
      subtotal,
      discount,
      discountAmt,
      total,
      method,
      cashTendered: method === 'cash' ? tendered : undefined,
      change: method === 'cash' ? Math.max(0, tendered - total) : undefined,
      createdAt: timestamp.getTime(),
    };

    saveSale(sale)
      .then(() => setSaveStage('saved'))
      .catch(() => setSaveStage('failed'));

    if (printerId) {
      printReceipt(sale, { isTH })
        .then(() => setPrintStage('printed'))
        .catch(() => setPrintStage('failed'));
    } else {
      // No printer configured — show as "printed" after the same delay so
      // the cashier isn't blocked.
      const id = setTimeout(() => setPrintStage('printed'), 2200);
      return () => clearTimeout(id);
    }
  }, [receiptNo, cart, discount, discountAmt, subtotal, total, method, cashTendered, cashier, printerId, timestamp, isTH]);

  useEffect(() => {
    const id = setTimeout(onNewSale, 6000);
    return () => clearTimeout(id);
  }, [onNewSale]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-panel border border-line rounded-[28px] p-9 w-[420px] items-center gap-3">
          <View
            className="w-28 h-28 rounded-full items-center justify-center"
            style={{ backgroundColor: '#355e4c' }}
          >
            <Icon name="check" size={72} stroke={2.5} color="#fff" />
          </View>
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[38px] text-ink mt-1">
            {t.thankYou}
          </Text>
          <Text className="text-ink-2 text-[15px]">{t.saleOf(Number(total).toLocaleString())}</Text>
          <Text className="text-ink-3 text-[12px]">
            {t.paidBy(method, timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
          </Text>

          <View
            className={`flex-row items-center gap-[10px] mt-3 px-4 py-[10px] rounded-full ${
              printStage === 'printed' ? 'bg-forest/10' : 'bg-bg-soft'
            }`}
          >
            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${
                printStage === 'printed' ? 'bg-forest' : 'bg-panel'
              }`}
            >
              {printStage === 'printed' ? (
                <Icon name="check" size={14} stroke={2.2} color="#fff" />
              ) : printStage === 'printing' ? (
                <ActivityIndicator size="small" />
              ) : (
                <Icon name="x" size={14} color="#9c3232" />
              )}
            </View>
            <Text
              className={`text-[12.5px] font-medium ${
                printStage === 'printed'
                  ? 'text-forest'
                  : printStage === 'failed'
                  ? 'text-danger'
                  : 'text-ink-2'
              }`}
            >
              {printStage === 'printing'
                ? t.printing
                : printStage === 'printed'
                ? t.printed
                : 'Printer error'}
            </Text>
          </View>

          <Pressable
            onPress={onNewSale}
            className="w-full h-12 rounded-[12px] items-center justify-center flex-row gap-2 bg-burgundy mt-4"
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text className="text-panel text-[14px] font-medium">{t.newSale}</Text>
          </Pressable>

          <Text className="text-ink-3 text-[11.5px] mt-1">{t.autoReset}</Text>
          {saveStage === 'failed' && (
            <Text className="text-danger text-[11.5px]">Failed to save sale to server</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
