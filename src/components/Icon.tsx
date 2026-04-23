import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// Stroke icons mirroring prototype/src/lib.jsx.
export type IconName =
  | 'scan' | 'search' | 'plus' | 'minus' | 'x' | 'trash' | 'tag' | 'cash'
  | 'qr' | 'check' | 'arrowLeft' | 'arrowRight' | 'drawer' | 'user'
  | 'receipt' | 'percent' | 'settings' | 'wifi' | 'back' | 'sparkle'
  | 'printer' | 'calc';

type P = { name: IconName; size?: number; stroke?: number; color?: string };

export function Icon({ name, size = 20, stroke = 1.75, color = '#1a1614' }: P) {
  const common = {
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths(name, color, common)}
    </Svg>
  );
}

function paths(name: IconName, color: string, c: object) {
  switch (name) {
    case 'scan':
      return (
        <>
          <Path {...c} d="M3 7V5a2 2 0 0 1 2-2h2" />
          <Path {...c} d="M17 3h2a2 2 0 0 1 2 2v2" />
          <Path {...c} d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <Path {...c} d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <Path {...c} d="M3 12h18" />
        </>
      );
    case 'search':
      return (
        <>
          <Circle {...c} cx="11" cy="11" r="7" />
          <Path {...c} d="m20 20-3.5-3.5" />
        </>
      );
    case 'plus':
      return (
        <>
          <Path {...c} d="M12 5v14" />
          <Path {...c} d="M5 12h14" />
        </>
      );
    case 'minus':
      return <Path {...c} d="M5 12h14" />;
    case 'x':
      return (
        <>
          <Path {...c} d="M18 6 6 18" />
          <Path {...c} d="m6 6 12 12" />
        </>
      );
    case 'trash':
      return (
        <>
          <Path {...c} d="M3 6h18" />
          <Path {...c} d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <Path {...c} d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </>
      );
    case 'cash':
      return (
        <>
          <Rect {...c} x="2" y="6" width="20" height="12" rx="2" />
          <Circle {...c} cx="12" cy="12" r="2.5" />
        </>
      );
    case 'qr':
      return (
        <>
          <Rect {...c} x="3" y="3" width="7" height="7" rx="1" />
          <Rect {...c} x="14" y="3" width="7" height="7" rx="1" />
          <Rect {...c} x="3" y="14" width="7" height="7" rx="1" />
          <Path {...c} d="M14 14h3v3h-3z" />
          <Path {...c} d="M17 17h4v4" />
        </>
      );
    case 'check':
      return <Path {...c} d="M20 6 9 17l-5-5" />;
    case 'arrowLeft':
      return (
        <>
          <Path {...c} d="M19 12H5" />
          <Path {...c} d="m12 19-7-7 7-7" />
        </>
      );
    case 'arrowRight':
      return (
        <>
          <Path {...c} d="M5 12h14" />
          <Path {...c} d="m12 5 7 7-7 7" />
        </>
      );
    case 'drawer':
      return (
        <>
          <Rect {...c} x="3" y="9" width="18" height="11" rx="1.5" />
          <Path {...c} d="M3 13h18" />
          <Path {...c} d="M10 16h4" />
          <Path {...c} d="M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
        </>
      );
    case 'user':
      return (
        <>
          <Circle {...c} cx="12" cy="8" r="4" />
          <Path {...c} d="M4 21a8 8 0 0 1 16 0" />
        </>
      );
    case 'percent':
      return (
        <>
          <Path {...c} d="M19 5 5 19" />
          <Circle {...c} cx="7" cy="7" r="2.5" />
          <Circle {...c} cx="17" cy="17" r="2.5" />
        </>
      );
    case 'back':
      return <Path {...c} d="m15 18-6-6 6-6" />;
    case 'sparkle':
      return <Path {...c} d="M12 3l1.5 5L19 9.5 13.5 11 12 16l-1.5-5L5 9.5 10.5 8z" />;
    case 'printer':
      return (
        <>
          <Path {...c} d="M6 9V3h12v6" />
          <Rect {...c} x="3" y="9" width="18" height="8" rx="1.5" />
          <Rect {...c} x="6" y="14" width="12" height="7" rx="1" />
        </>
      );
    case 'calc':
      return (
        <>
          <Rect {...c} x="4" y="3" width="16" height="18" rx="2" />
          <Rect {...c} x="7" y="6" width="10" height="3" rx="0.5" />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle {...c} cx="12" cy="12" r="3" />
          <Path
            {...c}
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </>
      );
    case 'wifi':
      return (
        <>
          <Path {...c} d="M5 12.55a11 11 0 0 1 14 0" />
          <Path {...c} d="M1.42 9a16 16 0 0 1 21.16 0" />
          <Path {...c} d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        </>
      );
    case 'tag':
      return <Path {...c} d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />;
    case 'receipt':
      return (
        <>
          <Path {...c} d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2V2z" />
          <Path {...c} d="M8 7h8M8 11h8M8 15h5" />
        </>
      );
    default:
      return null;
  }
}
