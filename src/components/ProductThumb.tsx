import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '~/theme/tokens';

type P = {
  name: string;
  size?: number;
  bg?: string;
  fg?: string;
};

export function ProductThumb({ name, size = 56, bg, fg }: P) {
  const mono = (name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.18,
        backgroundColor: bg ?? colors.bgSoft,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'BodoniModa',
          fontSize: size * 0.38,
          color: fg ?? colors.ink2,
          letterSpacing: 0.02,
        }}
      >
        {mono}
      </Text>
    </View>
  );
}
