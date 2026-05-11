import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { buildPromptPayPayload, isValidPromptPayId } from '~/lib/promptpay';
import { shopConfig } from '~/lib/shop';

type Props = {
  amount: number;
  size?: number;
  fallback?: React.ReactNode;
};

/**
 * Renders a real PromptPay QR sized to the given amount, when
 * EXPO_PUBLIC_PROMPTPAY_ID is configured. Otherwise falls back to the
 * provided fallback (e.g. a placeholder graphic).
 */
export function PromptPayQR({ amount, size = 240, fallback = null }: Props) {
  const { promptpayId } = shopConfig();

  const matrix = useMemo(() => {
    if (!isValidPromptPayId(promptpayId)) return null;
    try {
      const payload = buildPromptPayPayload({ id: promptpayId, amount });
      // errorCorrectionLevel 'M' is the EMVCo recommendation for payments.
      const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
      return { data: qr.modules.data, sz: qr.modules.size };
    } catch {
      return null;
    }
  }, [promptpayId, amount]);

  if (!matrix) {
    return (
      <View style={{ width: size, height: size }}>
        {fallback ?? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-ink-3 text-[11px]">QR unavailable</Text>
          </View>
        )}
      </View>
    );
  }

  const { data, sz } = matrix;
  const cell = size / sz;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      if (data[y * sz + x] === 1) {
        cells.push(
          <Rect
            key={`${x}-${y}`}
            x={x * cell}
            y={y * cell}
            width={cell}
            height={cell}
            fill="#1f1a17"
          />,
        );
      }
    }
  }

  return (
    <Svg width={size} height={size}>
      <Rect width={size} height={size} fill="#fff" />
      {cells}
    </Svg>
  );
}
