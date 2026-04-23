# Cakethakae POS

A minimal, touch-first POS for a Thai bakery / coffee shop. Two screens paired:
a 1024×768 cashier tablet and a 360×560 customer display stand.

Built as a single-page HTML/React (UMD + Babel standalone) app. No build step —
open `index.html` in a browser, or serve the folder with any static server.

## Run

```
python3 -m http.server 8000
```

Then open http://localhost:8000 .

## Structure

- `index.html` — entry point, device shells, App wiring, top bar, tweaks panel
- `src/data.js` — product catalog + discount coupons
- `src/i18n.js` — TH / EN string tables + `I18nContext`
- `src/lib.jsx` — helpers (`fmtTHB`, `cn`), `Icon`, `ProductThumb`
- `src/sale.jsx` — sale screen (search, grid, cart, charge)
- `src/pay.jsx` — pay flow (method / cash pad / QR / drawer / done + receipt)
- `src/modals.jsx` — discount modal (coupon picker + manual), customer display, barcode
- `src/sale.css`, `src/pay.css` — styles
- `assets/logo.jpg` — brand mark

## Flows

- Scan (Scan pill simulates a barcode) or search → tap product → cart
- Discount: scan / pick a coupon, or manual % / ฿ via keypad
- Charge → Cash keypad with quick denominations → drawer / change screen
- Or QR (PromptPay-style) with simulate-paid → auto-prints receipt
- Thank-you screen with auto-printing thermal receipt preview and auto-reset

## Settings

Gear button bottom-right toggles a panel with language (ไทย / EN), accent color
(burgundy / forest / cocoa / ink), and customer display visibility. Persists to
`localStorage`.
