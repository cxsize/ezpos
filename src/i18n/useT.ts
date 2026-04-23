import { useSettings } from '~/state/settings';
import { STRINGS, type Lang } from './strings';

export function useT() {
  const lang = useSettings((s) => s.lang);
  return { lang, t: STRINGS[lang], isTH: lang === 'th' };
}

export type { Lang };
