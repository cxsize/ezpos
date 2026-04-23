// Ported verbatim from prototype/src/i18n.js and retyped.
export type Lang = 'th' | 'en';

type S = {
  brandRegister: string;
  online: string;
  searchPlaceholder: string;
  scan: string;
  quickPicks: string;
  resultsOne: string;
  resultsMany: string;
  noResults: (q: string) => string;
  noResultsSub: string;
  currentSale: string;
  noItems: string;
  itemsCount: (n: number) => string;
  clear: string;
  scanOrTap: string;
  emptyHelp: string;
  subtotal: string;
  addDiscount: string;
  percentOff: (v: number) => string;
  amountOff: (v: number) => string;
  total: string;
  charge: (n: number) => string;

  choosePayment: string;
  cashPayment: string;
  qrPayment: string;
  giveChange: string;
  saleComplete: string;
  back: string;
  cash: string;
  cashSub: string;
  qr: string;
  qrSub: string;
  due: string;
  tendered: string;
  change: string;
  openDrawer: string;
  promptpay: string;
  askCustomer: string;
  thankYou: string;
  simulatePaid: string;
  paymentReceived: string;
  drawerOpen: string;
  changeDue: string;
  cashReceived: string;
  drawerClosed: string;
  saleOf: (n: string) => string;
  paidBy: (m: 'cash' | 'qr', t: string) => string;
  printReceipt: string;
  newSale: string;
  autoReset: string;

  discountTitle: string;
  percent: string;
  amount: string;
  remove: string;
  apply: string;

  welcome: string;
  welcomeSub: string;
  lastScanned: string;
  moreItems: (n: number) => string;
  discount: string;
  thanksBig: string;
  thanksSub: string;

  coupons: string;
  scanCoupon: string;
  scanCouponHint: string;
  manualAdjust: string;
  couponApplied: string;
  noCoupon: string;
  selectCoupon: string;

  printing: string;
  printed: string;
  receiptNo: string;
  cashier: string;
  qty: string;
  item: string;
  amountLbl: string;
  thankYouReceipt: string;
  taxIncluded: string;

  tweaksTitle: string;
  accentColor: string;
  customerDisplay: string;
  language: string;
  show: string;
  hide: string;

  // PIN gate
  pinTitle: string;
  pinSub: string;
  pinBadge: string;
  pinAddCashier: string;
  pinCashierName: string;
  pinSetPin: string;
  pinConfirmPin: string;
  pinMismatch: string;
  pinWrong: string;
  pinSignOut: string;
  pinOwnerSetup: string;
  pinOwnerSetupSub: string;
  pinSignIn: string;
  pinContinue: string;

  // Hardware
  hwPrinter: string;
  hwConnect: string;
  hwConnected: string;
  hwDisconnected: string;
  hwScanDevices: string;
};

export const STRINGS: Record<Lang, S> = {
  en: {
    brandRegister: 'Register 01',
    online: 'Online',
    searchPlaceholder: 'Scan barcode or search…',
    scan: 'Scan',
    quickPicks: 'Quick picks',
    resultsOne: 'result',
    resultsMany: 'results',
    noResults: (q) => `No items match "${q}"`,
    noResultsSub: 'Check the barcode or try a different name',
    currentSale: 'Current sale',
    noItems: 'No items yet',
    itemsCount: (n) => `${n} item${n === 1 ? '' : 's'}`,
    clear: 'Clear',
    scanOrTap: 'Scan or tap to add',
    emptyHelp: 'Items appear here as you ring them up.',
    subtotal: 'Subtotal',
    addDiscount: 'Add discount',
    percentOff: (v) => `${v}% discount`,
    amountOff: (v) => `฿${v} off`,
    total: 'Total',
    charge: (n) => `Charge ฿${n}`,

    choosePayment: 'Choose payment',
    cashPayment: 'Cash payment',
    qrPayment: 'QR payment',
    giveChange: 'Give change',
    saleComplete: 'Sale complete',
    back: 'Back',
    cash: 'Cash',
    cashSub: 'Count and open drawer',
    qr: 'QR Payment',
    qrSub: 'PromptPay / Mobile banking',
    due: 'Due',
    tendered: 'Tendered',
    change: 'Change',
    openDrawer: 'Open drawer',
    promptpay: 'PromptPay',
    askCustomer: 'Ask customer to scan with their banking app',
    thankYou: 'Thank you!',
    simulatePaid: 'Simulate payment received',
    paymentReceived: 'Payment received',
    drawerOpen: 'Drawer open',
    changeDue: 'Change due',
    cashReceived: 'Cash received',
    drawerClosed: 'Drawer closed · Finish',
    saleOf: (n) => `Sale of ฿${n} complete`,
    paidBy: (m, t) => `Paid by ${m === 'cash' ? 'cash' : 'QR'} · ${t}`,
    printReceipt: 'Print receipt',
    newSale: 'New sale',
    autoReset: 'Auto-reset in a few seconds…',

    discountTitle: 'Add discount',
    percent: 'Percent',
    amount: 'Amount',
    remove: 'Remove',
    apply: 'Apply discount',

    welcome: 'Welcome',
    welcomeSub: 'ยินดีต้อนรับค่ะ',
    lastScanned: 'Last scanned',
    moreItems: (n) => `+${n} more items…`,
    discount: 'Discount',
    thanksBig: 'Thank you!',
    thanksSub: 'See you again soon',

    coupons: 'Coupons',
    scanCoupon: 'Scan coupon',
    scanCouponHint: 'Scan the coupon barcode or tap one below',
    manualAdjust: 'Manual adjust',
    couponApplied: 'Coupon applied',
    noCoupon: 'No coupon',
    selectCoupon: 'Select coupon',

    printing: 'Printing receipt…',
    printed: 'Receipt printed',
    receiptNo: 'Receipt',
    cashier: 'Cashier',
    qty: 'Qty',
    item: 'Item',
    amountLbl: 'Amount',
    thankYouReceipt: 'Thank you — see you again',
    taxIncluded: 'VAT included (7%)',

    tweaksTitle: 'Settings',
    accentColor: 'Accent color',
    customerDisplay: 'Customer display',
    language: 'Language',
    show: 'Show',
    hide: 'Hide',

    pinTitle: 'Sign in',
    pinSub: 'Enter your 4-digit PIN',
    pinBadge: 'Cashier',
    pinAddCashier: 'Add cashier',
    pinCashierName: 'Cashier name',
    pinSetPin: 'Set PIN',
    pinConfirmPin: 'Confirm PIN',
    pinMismatch: 'PINs do not match',
    pinWrong: 'Wrong PIN',
    pinSignOut: 'Sign out',
    pinOwnerSetup: 'First-time setup',
    pinOwnerSetupSub: 'Create the first cashier account',
    pinSignIn: 'Sign in',
    pinContinue: 'Continue',

    hwPrinter: 'Receipt printer',
    hwConnect: 'Connect',
    hwConnected: 'Connected',
    hwDisconnected: 'Not connected',
    hwScanDevices: 'Scan for devices',
  },
  th: {
    brandRegister: 'เครื่อง 01',
    online: 'ออนไลน์',
    searchPlaceholder: 'สแกนบาร์โค้ด หรือค้นหา…',
    scan: 'สแกน',
    quickPicks: 'เมนูยอดนิยม',
    resultsOne: 'รายการ',
    resultsMany: 'รายการ',
    noResults: (q) => `ไม่พบสินค้า "${q}"`,
    noResultsSub: 'ลองตรวจบาร์โค้ดหรือค้นหาด้วยชื่ออื่น',
    currentSale: 'รายการขาย',
    noItems: 'ยังไม่มีสินค้า',
    itemsCount: (n) => `${n} รายการ`,
    clear: 'ล้าง',
    scanOrTap: 'สแกนหรือแตะเพื่อเพิ่ม',
    emptyHelp: 'สินค้าจะปรากฏที่นี่เมื่อคิดเงิน',
    subtotal: 'ยอดรวม',
    addDiscount: 'เพิ่มส่วนลด',
    percentOff: (v) => `ส่วนลด ${v}%`,
    amountOff: (v) => `ลด ฿${v}`,
    total: 'ยอดชำระ',
    charge: (n) => `เก็บเงิน ฿${n}`,

    choosePayment: 'เลือกวิธีชำระ',
    cashPayment: 'ชำระเงินสด',
    qrPayment: 'ชำระผ่าน QR',
    giveChange: 'ทอนเงิน',
    saleComplete: 'ขายสำเร็จ',
    back: 'กลับ',
    cash: 'เงินสด',
    cashSub: 'นับเงินและเปิดลิ้นชัก',
    qr: 'คิวอาร์โค้ด',
    qrSub: 'พร้อมเพย์ / โมบายแบงก์กิ้ง',
    due: 'ยอดที่ต้องชำระ',
    tendered: 'รับเงินมา',
    change: 'เงินทอน',
    openDrawer: 'เปิดลิ้นชัก',
    promptpay: 'พร้อมเพย์',
    askCustomer: 'ให้ลูกค้าสแกนด้วยแอปธนาคาร',
    thankYou: 'ขอบคุณค่ะ',
    simulatePaid: 'จำลองการชำระเสร็จ',
    paymentReceived: 'รับชำระเงินแล้ว',
    drawerOpen: 'ลิ้นชักเปิดอยู่',
    changeDue: 'เงินทอน',
    cashReceived: 'รับเงินมา',
    drawerClosed: 'ปิดลิ้นชัก · เสร็จสิ้น',
    saleOf: (n) => `ขายสำเร็จ ฿${n}`,
    paidBy: (m, t) => `ชำระด้วย${m === 'cash' ? 'เงินสด' : 'QR'} · ${t}`,
    printReceipt: 'พิมพ์ใบเสร็จ',
    newSale: 'รายการใหม่',
    autoReset: 'จะรีเซ็ตอัตโนมัติในไม่กี่วินาที…',

    discountTitle: 'เพิ่มส่วนลด',
    percent: 'เปอร์เซ็นต์',
    amount: 'จำนวนเงิน',
    remove: 'นำออก',
    apply: 'ใช้ส่วนลด',

    welcome: 'ยินดีต้อนรับ',
    welcomeSub: 'Welcome',
    lastScanned: 'สินค้าล่าสุด',
    moreItems: (n) => `+${n} รายการ…`,
    discount: 'ส่วนลด',
    thanksBig: 'ขอบคุณค่ะ',
    thanksSub: 'แล้วพบกันใหม่',

    coupons: 'คูปองส่วนลด',
    scanCoupon: 'สแกนคูปอง',
    scanCouponHint: 'สแกนบาร์โค้ดคูปอง หรือเลือกจากรายการ',
    manualAdjust: 'ปรับเอง',
    couponApplied: 'ใช้คูปองแล้ว',
    noCoupon: 'ไม่ใช้คูปอง',
    selectCoupon: 'เลือกคูปอง',

    printing: 'กำลังพิมพ์ใบเสร็จ…',
    printed: 'พิมพ์ใบเสร็จแล้ว',
    receiptNo: 'ใบเสร็จ',
    cashier: 'พนักงาน',
    qty: 'จำนวน',
    item: 'รายการ',
    amountLbl: 'ยอดเงิน',
    thankYouReceipt: 'ขอบคุณค่ะ แล้วพบกันใหม่',
    taxIncluded: 'รวม VAT 7% แล้ว',

    tweaksTitle: 'การตั้งค่า',
    accentColor: 'สีเน้น',
    customerDisplay: 'จอลูกค้า',
    language: 'ภาษา',
    show: 'แสดง',
    hide: 'ซ่อน',

    pinTitle: 'เข้าสู่ระบบ',
    pinSub: 'กรอกรหัส PIN 4 หลัก',
    pinBadge: 'พนักงาน',
    pinAddCashier: 'เพิ่มพนักงาน',
    pinCashierName: 'ชื่อพนักงาน',
    pinSetPin: 'ตั้งรหัส PIN',
    pinConfirmPin: 'ยืนยันรหัส PIN',
    pinMismatch: 'รหัส PIN ไม่ตรงกัน',
    pinWrong: 'รหัส PIN ไม่ถูกต้อง',
    pinSignOut: 'ออกจากระบบ',
    pinOwnerSetup: 'ตั้งค่าครั้งแรก',
    pinOwnerSetupSub: 'สร้างบัญชีพนักงานคนแรก',
    pinSignIn: 'เข้าสู่ระบบ',
    pinContinue: 'ต่อไป',

    hwPrinter: 'เครื่องพิมพ์ใบเสร็จ',
    hwConnect: 'เชื่อมต่อ',
    hwConnected: 'เชื่อมต่อแล้ว',
    hwDisconnected: 'ยังไม่เชื่อมต่อ',
    hwScanDevices: 'ค้นหาอุปกรณ์',
  },
};
