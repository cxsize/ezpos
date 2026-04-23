// Shared helpers + tiny UI atoms
const { useState, useEffect, useRef, useMemo, useCallback } = React;

window.fmtTHB = (n) => '฿' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
window.fmtTHB2 = (n) => '฿' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

window.cn = (...xs) => xs.filter(Boolean).join(' ');

// Tiny icon set (stroke icons)
window.Icon = ({ name, size = 20, stroke = 1.75 }) => {
  const paths = {
    scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    minus: <><path d="M5 12h14"/></>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    trash: <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></>,
    tag: <><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M17 17h4v4"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    arrowLeft: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    drawer: <><rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 13h18"/><path d="M10 16h4"/><path d="M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    receipt: <><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2V2z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    percent: <><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></>,
    back: <><path d="m15 18-6-6 6-6"/></>,
    sparkle: <><path d="M12 3l1.5 5L19 9.5 13.5 11 12 16l-1.5-5L5 9.5 10.5 8z"/></>,
    printer: <><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><rect x="6" y="14" width="12" height="7" rx="1"/><circle cx="17" cy="12" r=".8" fill="currentColor"/></>,
    calc: <><rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="3" rx="0.5"/><circle cx="8.5" cy="13" r="0.9" fill="currentColor"/><circle cx="12" cy="13" r="0.9" fill="currentColor"/><circle cx="15.5" cy="13" r="0.9" fill="currentColor"/><circle cx="8.5" cy="17" r="0.9" fill="currentColor"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/><circle cx="15.5" cy="17" r="0.9" fill="currentColor"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {paths[name]}
    </svg>
  );
};

// Minimal product tile — monogram from product name, luxury feel
window.ProductThumb = ({ emoji, name, size = 56, bg, fg }) => {
  const mono = (name || '').split(/\s+/).map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.18,
      background: bg || 'var(--bg-soft)',
      color: fg || 'var(--ink-2)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily: 'var(--serif)',
      fontSize: size * 0.38, fontWeight: 400, letterSpacing: '0.02em',
      flexShrink:0, userSelect:'none',
      border: '1px solid var(--line)',
    }}>{mono || emoji}</div>
  );
};

Object.assign(window, { useState, useEffect, useRef, useMemo, useCallback });

// Re-expose i18n helpers to Babel scope (they're attached to window by i18n.js)
const { useT, I18nContext, STRINGS } = window;
