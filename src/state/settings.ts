import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '~/i18n/strings';

export type AccentKey = 'burgundy' | 'forest' | 'cocoa' | 'ink';

type SettingsState = {
  lang: Lang;
  accent: AccentKey;
  printerId: string | null;
  setLang: (l: Lang) => void;
  setAccent: (a: AccentKey) => void;
  setPrinterId: (id: string | null) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'th',
      accent: 'burgundy',
      printerId: null,
      setLang: (lang) => set({ lang }),
      setAccent: (accent) => set({ accent }),
      setPrinterId: (printerId) => set({ printerId }),
    }),
    {
      name: 'cakethakae-pos-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const ACCENTS: Record<AccentKey, { primary: string; primaryD: string; primaryL: string; primaryLL: string }> = {
  burgundy: { primary: '#7a1a37', primaryD: '#5e1329', primaryL: '#eec9d3', primaryLL: '#f7ebef' },
  forest:   { primary: '#2f5d4a', primaryD: '#23483a', primaryL: '#cae3d5', primaryLL: '#eaf3ee' },
  cocoa:    { primary: '#6b3a1f', primaryD: '#4e2a15', primaryL: '#e8cdb6', primaryLL: '#f4e4d3' },
  ink:      { primary: '#1f1a17', primaryD: '#000000', primaryL: '#d6ccc2', primaryLL: '#ece6df' },
};
