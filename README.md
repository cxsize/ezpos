# Cakethakae POS

Minimal retail POS for a Thai bakery / coffee shop — tablet cashier app backed
by Firebase, with barcode scanner + thermal printer + cash drawer.

**Stack:** Expo (React Native) · TypeScript · NativeWind · Firebase Auth +
Firestore · react-native-ble-plx for ESC/POS printers.

The original HTML prototype from Claude Design is preserved at `prototype/`
for visual reference.

## v1 scope

- ✅ Sale flow: search/scan → cart → charge → cash pad / QR → auto-printed
  thermal receipt
- ✅ Discount modal with scannable coupons + manual % / ฿ keypad
- ✅ Real catalog + coupons synced from Firestore
- ✅ Cashier PIN login (owner enrolls cashiers on first launch)
- ✅ Sales persisted to Firestore
- ✅ ESC/POS Bluetooth printer w/ cash-drawer kick, scanner as HID keyboard
- 🟨 Payments are simulated (real PromptPay + slip verification deferred)
- ⛔ Customer-display screen dropped from v1 — a single tablet can only show
  one surface at a time. Phase 2 is a second tablet running a
  "customer view" flavor of the app.

## Run it locally in one command

The whole stack — Firebase emulators, catalog seed, the app itself — runs
in Docker with hardware mocked. No Firebase account, no tablet, no printer,
no fonts to download.

```bash
docker compose up
```

Then open **http://localhost:8081** in a browser. The app auto-signs in as
"Dev Cashier" and loads the seeded catalog.

What's mocked:

- **Barcode scanner** — the DevPanel (bottom-left "DEV" pill) has buttons to
  inject product SKUs and coupon barcodes, hitting the same handler a real
  BLE HID scanner would.
- **Thermal printer** — a fake ESC/POS adapter renders the receipt as text
  and surfaces it in DevPanel → **Print**. "Fail next print" button lets
  you exercise the error path.
- **Cash drawer** — counts kicks in the DevPanel. No-op otherwise.
- **Firebase** — local Auth + Firestore emulators; UI at
  **http://localhost:4000**.

Other common commands:

```bash
docker compose run --rm seed                    # reseed the emulator
docker compose run --rm typecheck               # tsc --noEmit
docker compose --profile device up \
  emulator seed metro                           # for a real device + Metro
docker compose down                             # stop
docker compose down -v                          # stop + wipe emulator data
```

### Using it on a real tablet

Because native BLE doesn't work in a browser, you still need a custom Expo
**dev client** on the device. Build once on the host:

```bash
npx expo prebuild
npx eas build --profile development --platform ios     # or android
```

Then day-to-day:

```bash
docker compose --profile device up emulator seed metro
```

Open the dev client on the tablet and it'll auto-connect to Metro. On
Docker Desktop (macOS / Windows), `network_mode: host` doesn't work — swap
the `metro` service to use published ports and start Expo with `--tunnel`.

### Going to production

When you're ready to point the app at a real Firebase project instead of the
emulator:

```bash
cp .env.example .env
# fill in EXPO_PUBLIC_FIREBASE_* from the Firebase console and
# leave EXPO_PUBLIC_USE_FIREBASE_EMULATOR unset (or =false)

# Edit OWNER_UID in firestore.rules, then deploy:
firebase deploy --only firestore:rules

# Seed prod (use a short-lived service account)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  GCLOUD_PROJECT=your-project-id \
  node scripts/seed-catalog.mjs
```

## First launch

In **mock mode** (default via `docker compose up`), the app auto-creates a
"Dev Cashier" with PIN `0000` and skips past the sign-in screen.

In **production mode** (real Firebase, real hardware):

1. Tablet signs in anonymously to Firestore.
2. No cashier exists → routes to **/enroll** to create the first one.
3. From then on, **/signin** shows a PIN pad.
4. On the sale screen, tap the **gear** (bottom-right) → **Printer** to scan
   and pair a Bluetooth ESC/POS printer. The barcode scanner works out of
   the box as long as it's paired at the OS level as an HID keyboard.

## Repo layout

```
app/                 Expo Router routes
  _layout.tsx        Root layout — fonts, orientation, Firebase bootstrap
  index.tsx          Redirects to /sale or /signin
  signin.tsx         PIN login
  enroll.tsx         Create a cashier
  sale.tsx           Main POS screen
  settings.tsx       Language, accent, printer pairing, sign out
src/
  components/        TopBar, SaleScreen, PayScreen, DiscountModal, ScanCapture, Icon, ProductThumb
  hardware/          escpos (command builder), printer (BLE), scanner (HID)
  i18n/              Thai + English strings, useT hook
  lib/               firebase, catalog, cashiers, sales, pin, money, search
  state/             Zustand stores: session, settings, sale, catalog
  theme/             Design tokens (colors, fonts, radius)
  types/             Product, Coupon, CartLine, Discount, Sale, Cashier
firestore.rules      Security rules (set OWNER_UID before deploying)
scripts/
  seed-catalog.mjs   One-shot Firestore seed
prototype/           Original HTML design prototype (reference only)
```

## Hardware notes

### Barcode scanner

Most Bluetooth retail scanners (Motorola, Socket, Eyoyo, etc.) pair as an
HID keyboard. `src/components/ScanCapture.tsx` mounts a hidden, always-focused
`TextInput` that captures the scan and routes it:

- On the sale screen → try SKU match, else fall back to search.
- While the discount modal is open → try coupon barcode match.

### Thermal printer (ESC/POS over BLE)

`src/hardware/printer.ts` discovers the first writable GATT characteristic
on the paired printer and streams bytes in 180-byte chunks. Tested pattern:
generic 80mm Xprinter / Rongta / Milestone — most speak UTF-8 directly, so
Thai glyphs print without a code-page switch.

### Cash drawer

Kicks via `ESC p 0 25 250` through the printer's DK pin. Fired automatically
on the "Open drawer" step and again as part of the receipt print for cash sales.

## What's not in v1 (intentional)

- Back-office / catalog admin UI — separate app, phase 2
- Sales history / end-of-day report — data is captured in Firestore; add a
  dashboard later
- Real PromptPay QR + slip verification — swap in a SlipOK / bank webhook in
  `PayScreen.QRPay`
- Second-tablet customer display — a stripped-down `app/display.tsx` plus a
  shared Firestore doc for the "current sale"
- Card-terminal integration (SCB / Kbank EDC) — bank-specific, later phase
