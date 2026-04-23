function PayScreen({ state, actions }) {
  const { t } = useT();
  const { cart, discount, payStep, payMethod, cashTendered } = state;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = discount.type === 'pct' ? Math.round(subtotal * discount.value / 100) : discount.value;
  const total = Math.max(0, subtotal - discountAmt);

  return (
    <div className="pay">
      <header className="pay-head">
        <button className="pay-back" onClick={actions.backToSale}>
          <Icon name="back" size={20}/>
          <span>{t.back}</span>
        </button>
        <div className="pay-title">
          {payStep === 'method' && t.choosePayment}
          {payStep === 'cash' && t.cashPayment}
          {payStep === 'qr' && t.qrPayment}
          {payStep === 'drawer' && t.giveChange}
          {payStep === 'done' && t.saleComplete}
        </div>
        <div className="pay-total-pill">
          <span className="pay-total-lbl">{t.total}</span>
          <span className="pay-total-n">{fmtTHB2(total)}</span>
        </div>
      </header>

      <div className="pay-body">
        {payStep === 'method' && <MethodPicker total={total} onPick={actions.pickMethod}/>}
        {payStep === 'cash' && <CashPad total={total} tendered={cashTendered} actions={actions}/>}
        {payStep === 'qr' && <QRPay total={total} actions={actions}/>}
        {payStep === 'drawer' && <DrawerOpen total={total} tendered={cashTendered} actions={actions}/>}
        {payStep === 'done' && <DoneScreen total={total} method={payMethod} actions={actions} state={state}/>}
      </div>
    </div>
  );
}

function MethodPicker({ onPick }) {
  const { t } = useT();
  return (
    <div className="method-wrap">
      <div className="method-grid">
        <button className="method method-cash" onClick={() => onPick('cash')}>
          <div className="method-ico"><Icon name="cash" size={44} stroke={1.5}/></div>
          <div className="method-label">{t.cash}</div>
          <div className="method-sub">{t.cashSub}</div>
        </button>
        <button className="method method-qr" onClick={() => onPick('qr')}>
          <div className="method-ico"><Icon name="qr" size={44} stroke={1.5}/></div>
          <div className="method-label">{t.qr}</div>
          <div className="method-sub">{t.qrSub}</div>
        </button>
      </div>
    </div>
  );
}

function CashPad({ total, tendered, actions }) {
  const { t } = useT();
  const amt = Number(tendered) || 0;
  const change = amt - total;
  const enough = amt >= total;
  const quick = useMemo(() => {
    const base = [total];
    [50, 100, 500, 1000].forEach(d => { const v = Math.ceil(total / d) * d; if (!base.includes(v)) base.push(v); });
    return base.slice(0, 5);
  }, [total]);

  const press = (k) => {
    if (k === 'clear') return actions.setCashTendered('');
    if (k === 'back')  return actions.setCashTendered(String(tendered).slice(0, -1));
    if (k === '00')    return actions.setCashTendered(String(tendered) + '00');
    actions.setCashTendered(String(tendered) + k);
  };

  return (
    <div className="cashpad">
      <div className="cashpad-left">
        <div className="cash-display">
          <div className="cash-row"><span>{t.due}</span><span>{fmtTHB2(total)}</span></div>
          <div className="cash-row cash-row-main">
            <span>{t.tendered}</span>
            <span className="cash-tendered">{tendered ? fmtTHB(amt) : '฿—'}</span>
          </div>
          <div className={cn('cash-row cash-row-change', enough && 'cash-row-change-on')}>
            <span>{t.change}</span>
            <span>{enough ? fmtTHB2(change) : '—'}</span>
          </div>
        </div>
        <div className="quick-cash">
          {quick.map(v => (
            <button key={v} className="quick-chip" onClick={() => actions.setCashTendered(String(v))}>
              {fmtTHB(v)}
            </button>
          ))}
        </div>
      </div>
      <div className="cashpad-right">
        <div className="keypad">
          {['1','2','3','4','5','6','7','8','9'].map(k => (
            <button key={k} className="key" onClick={() => press(k)}>{k}</button>
          ))}
          <button className="key key-mute" onClick={() => press('00')}>00</button>
          <button className="key" onClick={() => press('0')}>0</button>
          <button className="key key-mute" onClick={() => press('back')}><Icon name="back" size={22}/></button>
        </div>
        <button className="confirm-cash" disabled={!enough} onClick={actions.confirmCash}>
          <Icon name="drawer" size={22}/>
          <span>{t.openDrawer}</span>
        </button>
      </div>
    </div>
  );
}

function QRPay({ total, actions }) {
  const { t } = useT();
  const [status, setStatus] = useState('waiting');
  useEffect(() => {
    if (status === 'paid') { const tm = setTimeout(() => actions.completeSale('qr'), 900); return () => clearTimeout(tm); }
  }, [status]);

  return (
    <div className="qr-wrap">
      <div className="qr-card">
        <div className="qr-top">
          <div className="qr-brand">{t.promptpay}</div>
          <div className="qr-amount">{fmtTHB2(total)}</div>
        </div>
        <div className={cn('qr-code', status === 'paid' && 'qr-paid')}>
          {status === 'waiting' ? <QRGraphic/> : (
            <div className="qr-check">
              <Icon name="check" size={96} stroke={2.5}/>
              <div>{t.paymentReceived}</div>
            </div>
          )}
        </div>
        <div className="qr-hint">
          {status === 'waiting' ? t.askCustomer : t.thankYou}
        </div>
      </div>
      <div className="qr-actions">
        <button className="qr-sim" onClick={() => setStatus('paid')} disabled={status === 'paid'}>
          {t.simulatePaid}
        </button>
      </div>
    </div>
  );
}

function QRGraphic() {
  const cells = [];
  for (let i = 0; i < 25; i++) for (let j = 0; j < 25; j++) {
    const on = ((i * 7 + j * 13 + (i*j) % 5) % 3 === 0);
    cells.push(<rect key={`${i}-${j}`} x={i*8} y={j*8} width={8} height={8} fill={on ? '#1f1a17' : 'transparent'}/>);
  }
  const corner = (x, y) => (
    <g transform={`translate(${x},${y})`}>
      <rect width={56} height={56} fill="#1f1a17"/>
      <rect x={8} y={8} width={40} height={40} fill="#fff"/>
      <rect x={16} y={16} width={24} height={24} fill="#1f1a17"/>
    </g>
  );
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <rect width="200" height="200" fill="#fff"/>
      {cells}{corner(0,0)}{corner(144,0)}{corner(0,144)}
    </svg>
  );
}

function DrawerOpen({ total, tendered, actions }) {
  const { t } = useT();
  const amt = Number(tendered) || 0;
  const change = amt - total;
  return (
    <div className="drawer-wrap">
      <div className="drawer-card">
        <div className="drawer-ico"><Icon name="drawer" size={64} stroke={1.3}/></div>
        <div className="drawer-msg">{t.drawerOpen}</div>
        <div className="drawer-big">
          <div className="drawer-lbl">{t.changeDue}</div>
          <div className="drawer-amt">{fmtTHB2(change)}</div>
        </div>
        <div className="drawer-breakdown">
          <div><span>{t.total}</span><span>{fmtTHB2(total)}</span></div>
          <div><span>{t.cashReceived}</span><span>{fmtTHB2(amt)}</span></div>
        </div>
        <button className="drawer-done" onClick={() => actions.completeSale('cash')}>
          <Icon name="check" size={22}/>
          <span>{t.drawerClosed}</span>
        </button>
      </div>
    </div>
  );
}

function DoneScreen({ total, method, actions, state }) {
  const { t, lang } = useT();
  const isTH = lang === 'th';
  const [printStage, setPrintStage] = useState('printing'); // printing | printed
  const receiptNo = useMemo(() => 'R' + Math.floor(Math.random() * 900000 + 100000), []);
  const timestamp = useMemo(() => new Date(), []);
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = state.discount;
  const discountAmt = discount.type === 'pct' ? Math.round(subtotal * discount.value / 100) : discount.value;

  useEffect(() => {
    const printTm = setTimeout(() => setPrintStage('printed'), 2200);
    const newSaleTm = setTimeout(actions.newSale, 6000);
    return () => { clearTimeout(printTm); clearTimeout(newSaleTm); };
  }, []);

  return (
    <div className="done-wrap">
      <div className="done-left">
        <div className="done-card">
          <div className="done-check"><Icon name="check" size={72} stroke={2.5}/></div>
          <div className="done-title">{t.thankYou}</div>
          <div className="done-sub">{t.saleOf(Number(total).toLocaleString())}</div>
          <div className="done-meta">{t.paidBy(method, timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}))}</div>

          <div className={cn('print-status', `print-${printStage}`)}>
            <div className="print-ico">
              {printStage === 'printing' ? (
                <Icon name="printer" size={20} stroke={1.6}/>
              ) : (
                <Icon name="check" size={20} stroke={2.2}/>
              )}
            </div>
            <span>{printStage === 'printing' ? t.printing : t.printed}</span>
          </div>

          <button className="done-primary done-primary-solo" onClick={actions.newSale}>
            <Icon name="plus" size={18}/> {t.newSale}
          </button>
          <div className="done-countdown">{t.autoReset}</div>
        </div>
      </div>

      <div className={cn('receipt-slot', `receipt-${printStage}`)}>
        <ReceiptPaper
          items={state.cart}
          subtotal={subtotal}
          discount={discount}
          discountAmt={discountAmt}
          total={total}
          method={method}
          cashTendered={state.cashTendered}
          receiptNo={receiptNo}
          timestamp={timestamp}
          isTH={isTH}
          t={t}
        />
      </div>
    </div>
  );
}

function ReceiptPaper({ items, subtotal, discount, discountAmt, total, method, cashTendered, receiptNo, timestamp, isTH, t }) {
  const tendered = Number(cashTendered) || 0;
  const change = method === 'cash' ? tendered - total : 0;
  const dateStr = timestamp.toLocaleDateString(isTH ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'2-digit' });
  const timeStr = timestamp.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="receipt">
      <div className="receipt-zig receipt-zig-top"/>
      <div className="receipt-body">
        <div className="receipt-brand">cakethakae</div>
        <div className="receipt-sub">est. 1997 · เค้กท่าแค</div>
        <div className="receipt-addr">123 ถ.ท่าแค · Register 01 · โทร 02-xxx-xxxx</div>

        <div className="receipt-meta">
          <div><span>{t.receiptNo}</span><span>{receiptNo}</span></div>
          <div><span>{dateStr}</span><span>{timeStr}</span></div>
          <div><span>{t.cashier}</span><span>Ploy N.</span></div>
        </div>

        <div className="receipt-divider"/>

        <div className="receipt-items-head">
          <span>{t.item}</span>
          <span className="rih-qty">{t.qty}</span>
          <span className="rih-amt">{t.amountLbl}</span>
        </div>

        <div className="receipt-items">
          {items.map(i => (
            <div key={i.id} className="receipt-item">
              <span className="ri-name">{isTH ? i.thName : i.name}</span>
              <span className="ri-qty">{i.qty}×{i.price}</span>
              <span className="ri-amt">{fmtTHB(i.price * i.qty)}</span>
            </div>
          ))}
        </div>

        <div className="receipt-divider receipt-divider-dashed"/>

        <div className="receipt-totals">
          <div><span>{t.subtotal}</span><span>{fmtTHB2(subtotal)}</span></div>
          {discountAmt > 0 && (
            <div className="receipt-disc">
              <span>{t.discount}{discount.code ? ` · ${discount.code}` : ''}</span>
              <span>−{fmtTHB2(discountAmt)}</span>
            </div>
          )}
          <div className="receipt-grand">
            <span>{t.total}</span>
            <span>{fmtTHB2(total)}</span>
          </div>
        </div>

        <div className="receipt-divider"/>

        <div className="receipt-payment">
          <div><span>{method === 'cash' ? t.cash : t.qr}</span><span>{fmtTHB2(method === 'cash' ? tendered : total)}</span></div>
          {method === 'cash' && change > 0 && (
            <div><span>{t.change}</span><span>{fmtTHB2(change)}</span></div>
          )}
        </div>

        <div className="receipt-tax">{t.taxIncluded}</div>
        <div className="receipt-thanks">{t.thankYouReceipt}</div>

        <div className="receipt-barcode">
          <BarcodeGraphic seed={receiptNo.replace(/\D/g,'')}/>
          <div className="receipt-barcode-n">{receiptNo}</div>
        </div>
      </div>
      <div className="receipt-zig receipt-zig-bot"/>
    </div>
  );
}

window.PayScreen = PayScreen;
window.ReceiptPaper = ReceiptPaper;
