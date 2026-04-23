function DiscountModal({ open, onClose, onApply, current }) {
  const { t, lang } = useT();
  const isTH = lang === 'th';
  const [mode, setMode] = useState('coupon'); // coupon | manual
  const [type, setType] = useState(current?.type === 'amt' ? 'amt' : 'pct');
  const [val, setVal] = useState(current?.value ? String(current.value) : '');
  const [scanning, setScanning] = useState(false);
  const [flashCode, setFlashCode] = useState(null);

  useEffect(() => {
    if (open) {
      setMode(current?.code ? 'coupon' : (current?.type === 'amt' || (current?.type === 'pct' && current?.value) ? 'manual' : 'coupon'));
      setType(current?.type === 'amt' ? 'amt' : 'pct');
      setVal(current?.value ? String(current.value) : '');
      setFlashCode(current?.code || null);
    }
  }, [open]);

  if (!open) return null;

  const press = (k) => {
    if (k === 'back') return setVal(v => v.slice(0, -1));
    if (k === 'clear') return setVal('');
    setVal(v => (v + k).replace(/^0+(?=\d)/, ''));
  };
  const quick = type === 'pct' ? [5, 10, 15, 20, 50] : [20, 50, 100];

  const pickCoupon = (c) => {
    setFlashCode(c.code);
    setTimeout(() => {
      onApply({ type: c.type, value: c.value, code: c.code, name: isTH ? c.thName : c.name });
      onClose();
    }, 280);
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const c = COUPONS[Math.floor(Math.random() * COUPONS.length)];
      setScanning(false);
      pickCoupon(c);
    }, 900);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{t.discountTitle}</div>
          <button className="modal-x" onClick={onClose}><Icon name="x" size={22}/></button>
        </div>

        <div className="mode-tabs">
          <button className={cn('mode-tab', mode === 'coupon' && 'mode-tab-on')} onClick={() => setMode('coupon')}>
            <Icon name="percent" size={14}/> {t.coupons}
          </button>
          <button className={cn('mode-tab', mode === 'manual' && 'mode-tab-on')} onClick={() => setMode('manual')}>
            <Icon name="calc" size={14}/> {t.manualAdjust}
          </button>
        </div>

        {mode === 'coupon' ? (
          <div className="coupon-pane">
            <button className={cn('scan-coupon', scanning && 'scan-coupon-active')} onClick={simulateScan} disabled={scanning}>
              <div className="scan-coupon-ico">
                <Icon name="scan" size={28} stroke={1.5}/>
                {scanning && <div className="scan-laser"/>}
              </div>
              <div className="scan-coupon-text">
                <div className="scan-coupon-title">{t.scanCoupon}</div>
                <div className="scan-coupon-sub">{t.scanCouponHint}</div>
              </div>
            </button>

            <div className="coupon-list">
              {COUPONS.map(c => (
                <button key={c.code}
                  className={cn('coupon', flashCode === c.code && 'coupon-flash')}
                  onClick={() => pickCoupon(c)}>
                  <div className="coupon-left">
                    <div className="coupon-tag">{c.code}</div>
                    <div className="coupon-name">{isTH ? c.thName : c.name}</div>
                    <div className="coupon-bar">
                      <BarcodeGraphic seed={c.barcode}/>
                      <span className="coupon-barcode">{c.barcode}</span>
                    </div>
                  </div>
                  <div className="coupon-value">
                    {c.type === 'pct' ? (
                      <>
                        <span className="coupon-num">{c.value}</span>
                        <span className="coupon-unit">%</span>
                      </>
                    ) : (
                      <>
                        <span className="coupon-unit">฿</span>
                        <span className="coupon-num">{c.value}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="modal-foot">
              <button className="modal-secondary" onClick={() => { onApply({ type:'none', value: 0 }); onClose(); }}>
                {t.noCoupon}
              </button>
            </div>
          </div>
        ) : (
          <div className="manual-pane">
            <div className="disc-toggle">
              <button className={cn('disc-tog', type==='pct' && 'disc-tog-on')} onClick={() => setType('pct')}>{t.percent}</button>
              <button className={cn('disc-tog', type==='amt' && 'disc-tog-on')} onClick={() => setType('amt')}>{t.amount}</button>
            </div>

            <div className="disc-display">
              <span className="disc-big">{val || '0'}</span>
              <span className="disc-unit">{type === 'pct' ? '%' : '฿'}</span>
            </div>

            <div className="disc-quick">
              {quick.map(q => (
                <button key={q} className="quick-chip" onClick={() => setVal(String(q))}>
                  {type === 'pct' ? `${q}%` : fmtTHB(q)}
                </button>
              ))}
            </div>

            <div className="keypad keypad-disc">
              {['1','2','3','4','5','6','7','8','9'].map(k => (
                <button key={k} className="key" onClick={() => press(k)}>{k}</button>
              ))}
              <button className="key key-mute" onClick={() => press('clear')}>C</button>
              <button className="key" onClick={() => press('0')}>0</button>
              <button className="key key-mute" onClick={() => press('back')}><Icon name="back" size={22}/></button>
            </div>

            <div className="modal-foot">
              <button className="modal-secondary" onClick={() => { onApply({ type:'none', value: 0 }); onClose(); }}>
                {t.remove}
              </button>
              <button className="modal-primary" onClick={() => { onApply({ type, value: Number(val)||0 }); onClose(); }}>
                {t.apply}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple barcode lines (decorative)
function BarcodeGraphic({ seed }) {
  const n = Number(String(seed).slice(-6)) || 1;
  const bars = [];
  for (let i = 0; i < 28; i++) {
    const w = ((n >> (i % 20)) & 3) + 1;
    bars.push(w);
  }
  let x = 0;
  return (
    <svg width="64" height="16" viewBox={`0 0 ${bars.reduce((s,b) => s+b+1, 0)} 16`}>
      {bars.map((w, i) => {
        const r = <rect key={i} x={x} y={0} width={w} height={16} fill="#1a1614"/>;
        x += w + 1;
        return r;
      })}
    </svg>
  );
}

function CustomerDisplay({ state }) {
  const { t, lang } = useT();
  const { cart, discount, payStep } = state;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = discount.type === 'pct' ? Math.round(subtotal * discount.value / 100) : discount.value;
  const total = Math.max(0, subtotal - discountAmt);
  const isTH = lang === 'th';

  const showThanks = payStep === 'done';
  const last = cart[cart.length - 1];

  return (
    <div className="cust">
      <div className="cust-head">
        <img src="assets/logo.jpg" alt="" className="cust-logo"/>
        <div>
          <div className="cust-brand">cakethakae</div>
          <div className="cust-tag">est. 1997 · เค้กท่าแค</div>
        </div>
      </div>

      {showThanks ? (
        <div className="cust-thanks">
          <div className="cust-thanks-ico"><Icon name="sparkle" size={48}/></div>
          <div className="cust-thanks-big">{t.thanksBig}</div>
          <div className="cust-thanks-sub">{t.thanksSub}</div>
        </div>
      ) : cart.length === 0 ? (
        <div className="cust-welcome">
          <div className="cust-welcome-big">{t.welcome}</div>
          <div className="cust-welcome-sub">{t.welcomeSub}</div>
        </div>
      ) : (
        <>
          <div className="cust-last">
            <div className="cust-last-lbl">{t.lastScanned}</div>
            <div className="cust-last-row">
              <ProductThumb emoji={last.emoji} name={last.name} size={44} bg="rgba(238,201,211,.1)" fg="#eec9d3"/>
              <div className="cust-last-main">
                <div className="cust-last-name">{isTH ? last.thName : last.name}</div>
                <div className="cust-last-th">{isTH ? last.name : last.thName}</div>
              </div>
              <div className="cust-last-price">{fmtTHB(last.price)}</div>
            </div>
          </div>

          <div className="cust-list">
            {cart.slice(-4).reverse().map(i => (
              <div key={i.id} className="cust-line">
                <span>{i.qty}× {isTH ? i.thName : i.name}</span>
                <span>{fmtTHB(i.price * i.qty)}</span>
              </div>
            ))}
            {cart.length > 4 && <div className="cust-more">{t.moreItems(cart.length - 4)}</div>}
          </div>

          <div className="cust-totals">
            {discountAmt > 0 && (
              <div className="cust-sub"><span>{t.discount}</span><span>−{fmtTHB2(discountAmt)}</span></div>
            )}
            <div className="cust-total">
              <span>{t.total}</span>
              <span className="cust-total-n">{fmtTHB2(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

window.DiscountModal = DiscountModal;
window.CustomerDisplay = CustomerDisplay;
window.BarcodeGraphic = BarcodeGraphic;
