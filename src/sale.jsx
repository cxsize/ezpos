// Main sale screen
function SaleScreen({ state, actions }) {
  const { t, lang } = useT();
  const { cart, query, catFilter, flash, discount } = state;
  const { setQuery, setCat, addItem, incItem, decItem, clearCart, goPay, simulateScan } = actions;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter(p => {
      if (catFilter !== 'all' && p.cat !== catFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.thName.includes(query) || p.sku.includes(q);
    });
  }, [query, catFilter]);

  const showQuick = !query.trim() && catFilter === 'all';
  const quickItems = QUICK_PICKS.map(id => CATALOG.find(p => p.id === id)).filter(Boolean);
  const gridItems = showQuick ? quickItems : filtered;

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = discount.type === 'pct' ? Math.round(subtotal * discount.value / 100) : discount.value;
  const total = Math.max(0, subtotal - discountAmt);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const CATS = useMemo(() => {
    const labels = lang === 'th'
      ? { all:'ทั้งหมด', coffee:'เครื่องดื่ม', pastry:'ขนมอบ', cake:'เค้ก', other:'อื่นๆ' }
      : { all:'All', coffee:'Drinks', pastry:'Pastry', cake:'Cake', other:'Other' };
    return CATEGORIES.map(c => ({ id: c.id, label: labels[c.id] || c.label }));
  }, [lang]);

  const isTH = lang === 'th';

  return (
    <div className="sale">
      <section className="browse">
        <div className="browse-top">
          <div className="search-wrap">
            <Icon name="search" size={20}/>
            <input className="search" placeholder={t.searchPlaceholder} value={query}
              onChange={e => setQuery(e.target.value)} autoFocus/>
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear">
                <Icon name="x" size={18}/>
              </button>
            )}
            <button className="scan-pill" onClick={simulateScan}>
              <Icon name="scan" size={18}/><span>{t.scan}</span>
            </button>
          </div>

          <div className="cats">
            {CATS.map(c => (
              <button key={c.id} className={cn('cat', catFilter === c.id && 'cat-on')}
                onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
          </div>
        </div>

        <div className="grid-wrap">
          <div className="grid-label">
            {showQuick ? t.quickPicks : `${gridItems.length} ${gridItems.length === 1 ? t.resultsOne : t.resultsMany}`}
          </div>
          <div className="grid">
            {gridItems.map(p => (
              <button key={p.id} className="card" onClick={() => addItem(p)}>
                <ProductThumb emoji={p.emoji} name={p.name} size={64}/>
                <div className="card-name">{isTH ? p.thName : p.name}</div>
                <div className="card-price">{fmtTHB(p.price)}</div>
              </button>
            ))}
            {gridItems.length === 0 && (
              <div className="empty-grid">
                <div className="empty-grid-title">{t.noResults(query)}</div>
                <div className="empty-grid-sub">{t.noResultsSub}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="cart">
        <div className="cart-head">
          <div>
            <div className="cart-title">{t.currentSale}</div>
            <div className="cart-sub">{count === 0 ? t.noItems : t.itemsCount(count)}</div>
          </div>
          {cart.length > 0 && (
            <button className="cart-clear" onClick={clearCart}>
              <Icon name="trash" size={14}/> {t.clear}
            </button>
          )}
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-ico"><Icon name="scan" size={36} stroke={1.25}/></div>
              <div className="cart-empty-title">{t.scanOrTap}</div>
              <div className="cart-empty-sub">{t.emptyHelp}</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={cn('line', flash === item.id && 'line-flash')}>
                <ProductThumb emoji={item.emoji} name={item.name} size={40}/>
                <div className="line-main">
                  <div className="line-name">{isTH ? item.thName : item.name}</div>
                  <div className="line-price">{fmtTHB(item.price)}</div>
                </div>
                <div className="qty">
                  <button className="qty-btn" onClick={() => decItem(item.id)}>
                    <Icon name={item.qty === 1 ? 'trash' : 'minus'} size={14}/>
                  </button>
                  <div className="qty-n">{item.qty}</div>
                  <button className="qty-btn" onClick={() => incItem(item.id)}>
                    <Icon name="plus" size={14}/>
                  </button>
                </div>
                <div className="line-total">{fmtTHB(item.price * item.qty)}</div>
              </div>
            ))
          )}
        </div>

        <div className="cart-foot">
          <div className="row-sub">
            <span>{t.subtotal}</span>
            <span>{fmtTHB2(subtotal)}</span>
          </div>
          <div className={cn('row-disc', discountAmt > 0 && 'row-disc-on')}>
            <button className="disc-btn" onClick={() => actions.openDiscount()} disabled={cart.length === 0}>
              <Icon name="percent" size={14}/>
              <span>{discountAmt > 0
                ? (discount.code
                    ? discount.code
                    : discount.type === 'pct' ? t.percentOff(discount.value) : t.amountOff(discount.value))
                : t.addDiscount}</span>
            </button>
            {discountAmt > 0 && <span className="disc-amt">−{fmtTHB2(discountAmt)}</span>}
          </div>
          <div className="row-total">
            <span>{t.total}</span>
            <span className="total-n">{fmtTHB2(total)}</span>
          </div>
          <button className="pay-btn" disabled={cart.length === 0} onClick={goPay}>
            <span>{t.charge(total)}</span>
            <Icon name="arrowRight" size={20}/>
          </button>
        </div>
      </aside>
    </div>
  );
}

window.SaleScreen = SaleScreen;
