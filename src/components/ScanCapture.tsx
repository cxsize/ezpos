import React, { useEffect, useRef } from 'react';
import { TextInput, View } from 'react-native';
import { emitScan } from '~/hardware/scanner';

// An invisible, always-focused TextInput that catches keystrokes from a
// Bluetooth / USB HID barcode scanner. Scanners emit the code followed by
// Enter; we flush on newline.
export function ScanCapture() {
  const ref = useRef<TextInput>(null);
  const bufferRef = useRef('');

  useEffect(() => {
    const id = setInterval(() => ref.current?.focus(), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', width: 1, height: 1, opacity: 0, left: -100, top: -100 }}
    >
      <TextInput
        ref={ref}
        autoFocus
        showSoftInputOnFocus={false}
        onChangeText={(v) => {
          bufferRef.current = v;
          // iOS HID scanners often deliver the whole token at once.
          if (/\n$/.test(v)) {
            const code = v.replace(/\s+$/, '');
            bufferRef.current = '';
            ref.current?.clear();
            emitScan(code);
          }
        }}
        onSubmitEditing={() => {
          const code = bufferRef.current.trim();
          bufferRef.current = '';
          ref.current?.clear();
          emitScan(code);
        }}
        blurOnSubmit={false}
      />
    </View>
  );
}
