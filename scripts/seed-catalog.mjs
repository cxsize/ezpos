// One-shot seed for products + coupons. Run once after creating your Firebase
// project and filling in .env. Uses firebase-admin with a service-account JSON.
//
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
//   node scripts/seed-catalog.mjs
//
// The service account must have Firestore write access. Delete or rotate it
// when you're done; don't commit it.

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the service-account JSON path.');
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(credentialsPath, 'utf8'))) });
const db = getFirestore();

const PRODUCTS = [
  { id: 'P001', sku: '8851234500011', name: 'Croissant',            thName: 'ครัวซอง',           price: 55,  cat: 'pastry', emoji: '🥐' },
  { id: 'P002', sku: '8851234500028', name: 'Pain au Chocolat',     thName: 'ช็อกโกแลต',         price: 65,  cat: 'pastry', emoji: '🥐' },
  { id: 'P003', sku: '8851234500035', name: 'Butter Cake Slice',    thName: 'เค้กเนย',            price: 85,  cat: 'cake',   emoji: '🍰' },
  { id: 'P004', sku: '8851234500042', name: 'Chocolate Fudge',      thName: 'ช็อกโกแลตฟัดจ์',   price: 95,  cat: 'cake',   emoji: '🍰' },
  { id: 'P005', sku: '8851234500059', name: 'Strawberry Shortcake', thName: 'สตรอว์เบอร์รี่',    price: 110, cat: 'cake',   emoji: '🍓' },
  { id: 'P006', sku: '8851234500066', name: 'Matcha Roll',          thName: 'มัทฉะโรล',           price: 95,  cat: 'cake',   emoji: '🍵' },
  { id: 'P007', sku: '8851234500073', name: 'Americano',            thName: 'อเมริกาโน่',         price: 55,  cat: 'coffee', emoji: '☕' },
  { id: 'P008', sku: '8851234500080', name: 'Latte',                thName: 'ลาเต้',              price: 65,  cat: 'coffee', emoji: '☕' },
  { id: 'P009', sku: '8851234500097', name: 'Cappuccino',           thName: 'คาปูชิโน่',          price: 65,  cat: 'coffee', emoji: '☕' },
  { id: 'P010', sku: '8851234500103', name: 'Thai Tea',             thName: 'ชาไทย',              price: 55,  cat: 'coffee', emoji: '🧋' },
  { id: 'P011', sku: '8851234500110', name: 'Iced Chocolate',       thName: 'ช็อกโกแลตเย็น',     price: 70,  cat: 'coffee', emoji: '🧋' },
  { id: 'P012', sku: '8851234500127', name: 'Custom Cake 1 lb',     thName: 'เค้กสั่งทำ 1 ปอนด์', price: 650, cat: 'cake',   emoji: '🎂' },
  { id: 'P013', sku: '8851234500134', name: 'Cookie Box (6)',       thName: 'คุกกี้กล่อง',         price: 180, cat: 'pastry', emoji: '🍪' },
  { id: 'P014', sku: '8851234500141', name: 'Bottled Water',        thName: 'น้ำเปล่า',           price: 20,  cat: 'other',  emoji: '💧' },
];

const COUPONS = [
  { code: 'MEMBER10', barcode: '8859100000108', name: 'Member 10%',         thName: 'สมาชิก ลด 10%',        type: 'pct', value: 10,  tag: 'member' },
  { code: 'BIRTHDAY', barcode: '8859100000207', name: 'Birthday Treat 15%', thName: 'ของขวัญวันเกิด ลด 15%', type: 'pct', value: 15,  tag: 'birthday' },
  { code: 'STUDENT',  barcode: '8859100000306', name: 'Student 5%',         thName: 'นักเรียน ลด 5%',       type: 'pct', value: 5,   tag: 'student' },
  { code: 'HAPPY50',  barcode: '8859100000405', name: 'Happy Hour ฿50 off', thName: 'Happy Hour ลด 50 บาท',  type: 'amt', value: 50,  tag: 'time' },
  { code: 'LINE100',  barcode: '8859100000504', name: 'LINE ฿100 voucher',  thName: 'คูปอง LINE ลด 100 บาท', type: 'amt', value: 100, tag: 'voucher' },
  { code: 'CAKE20',   barcode: '8859100000603', name: 'Cake Lover 20%',     thName: 'คนรักเค้ก ลด 20%',      type: 'pct', value: 20,  tag: 'loyalty' },
];

async function run() {
  const batch = db.batch();
  for (const p of PRODUCTS) batch.set(db.collection('products').doc(p.id), { ...p, active: true });
  for (const c of COUPONS) batch.set(db.collection('coupons').doc(c.code), { ...c, active: true });
  await batch.commit();
  console.log(`Seeded ${PRODUCTS.length} products and ${COUPONS.length} coupons.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
