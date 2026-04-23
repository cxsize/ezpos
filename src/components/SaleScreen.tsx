import React, { useEffect, useMemo } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { ProductThumb } from './ProductThumb';
import { useT } from '~/i18n/useT';
import { useSale, totals } from '~/state/sale';
import { useCatalog, QUICK_PICK_CODES } from '~/state/catalog';
import { filterProducts } from '~/lib/search';
import { fmtTHB, fmtTHB2 } from '~/lib/money';
import { setScanHandler } from '~/hardware/scanner';
import type { Product } from '~/types';

export function SaleScreen() {
  const { t, isTH } = useT();
  const {
    cart, query, catFilter, flash, discount,
    addItem, incItem, decItem, clearCart,
    setQuery, setCat, setDiscOpen, goPay,
  } = useSale();
  const products = useCatalog((s) => s.products);

  const filtered = useMemo(() => filterProducts(products, query, catFilter), [products, query, catFilter]);
  const showQuick = !query.trim() && catFilter === 'all';
  const quickItems = QUICK_PICK_CODES.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const gridItems = showQuick ? (quickItems.length ? quickItems : products.slice(0, 8)) : filtered;

  const { subtotal, discountAmt, total, count } = totals(cart, discount);

  // Route scanner codes: try barcode match first, else search.
  useEffect(() => {
    setScanHandler((code) => {
      const hit = products.find((p) => p.sku === code);
      if (hit) addItem(hit);
      else setQuery(code);
    });
    return () => setScanHandler(null);
  }, [products, addItem, setQuery]);

  const catLabels = useMemo(
    () =>
      isTH
        ? { all: 'ทั้งหมด', coffee: 'เครื่องดื่ม', pastry: 'ขนมอบ', cake: 'เค้ก', other: 'อื่นๆ' }
        : { all: 'All', coffee: 'Drinks', pastry: 'Pastry', cake: 'Cake', other: 'Other' },
    [isTH]
  );
  const cats = ['all', 'coffee', 'pastry', 'cake', 'other'] as const;

  return (
    <View className="flex-1 flex-row">
      {/* Browse */}
      <View className="flex-1 p-[18px] pr-[18px]">
        <View className="gap-3">
          <View className="flex-row items-center bg-panel border border-line rounded-[14px] h-14 px-3 gap-3">
            <Icon name="search" size={20} color="#a39c96" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#a39c96"
              className="flex-1 text-[15px] text-ink"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} className="w-8 h-8 rounded-full items-center justify-center">
                <Icon name="x" size={18} color="#a39c96" />
              </Pressable>
            ) : null}
          </View>

          <View className="flex-row gap-1">
            {cats.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCat(c)}
                className={`px-[14px] py-2 rounded-full ${catFilter === c ? 'bg-bg-soft' : ''}`}
              >
                <Text
                  className={`text-[12px] uppercase tracking-[0.08em] ${
                    catFilter === c ? 'text-ink' : 'text-ink-3'
                  }`}
                >
                  {catLabels[c]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text className="text-ink-3 text-[10.5px] uppercase tracking-[0.18em] mt-4 mb-3">
          {showQuick ? t.quickPicks : `${gridItems.length} ${gridItems.length === 1 ? t.resultsOne : t.resultsMany}`}
        </Text>

        <FlatList
          data={gridItems}
          numColumns={4}
          keyExtractor={(p) => p.id}
          columnWrapperStyle={{ gap: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ece7df' }} />}
          contentContainerStyle={{ backgroundColor: '#ece7df', borderRadius: 14, borderWidth: 1, borderColor: '#ece7df', overflow: 'hidden' }}
          renderItem={({ item: p }) => (
            <Pressable
              onPress={() => addItem(p)}
              className="flex-1 bg-panel px-4 py-[18px] gap-[14px] min-h-[148px]"
            >
              <ProductThumb name={p.name} size={64} />
              <Text
                className="text-[13px] text-ink flex-1"
                numberOfLines={2}
              >
                {isTH ? p.thName : p.name}
              </Text>
              <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
                {fmtTHB(p.price)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className="text-ink-2 text-[16px]">{t.noResults(query)}</Text>
              <Text className="text-ink-3 text-[13px] mt-1">{t.noResultsSub}</Text>
            </View>
          }
        />
      </View>

      {/* Cart */}
      <View className="w-[380px] bg-panel border-l border-line">
        <View className="px-[22px] pt-[22px] pb-4 flex-row items-start justify-between border-b border-line">
          <View className="flex-1">
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[22px] text-ink">
              {t.currentSale}
            </Text>
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.08em] mt-1">
              {count === 0 ? t.noItems : t.itemsCount(count)}
            </Text>
          </View>
          {cart.length > 0 && (
            <Pressable onPress={clearCart} className="flex-row items-center gap-[6px] px-2 py-1">
              <Icon name="trash" size={14} color="#a39c96" />
              <Text className="text-ink-3 text-[11px] uppercase tracking-[0.08em]">{t.clear}</Text>
            </Pressable>
          )}
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 6 }}>
          {cart.length === 0 ? (
            <View className="items-center justify-center py-10">
              <View className="w-[72px] h-[72px] rounded-full bg-bg-soft items-center justify-center mb-[18px]">
                <Icon name="scan" size={36} stroke={1.25} color="#a39c96" />
              </View>
              <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink-2">
                {t.scanOrTap}
              </Text>
              <Text className="text-ink-3 text-[12px] text-center mt-[6px] max-w-[220px]">
                {t.emptyHelp}
              </Text>
            </View>
          ) : (
            cart.map((item) => (
              <View
                key={item.id}
                className={`flex-row items-center gap-3 py-[14px] px-2 border-b border-line ${
                  flash === item.id ? 'bg-burgundy-ll' : ''
                }`}
              >
                <ProductThumb name={item.name} size={40} />
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-[13px] text-ink">
                    {isTH ? item.thName : item.name}
                  </Text>
                  <Text className="text-ink-3 text-[11px] mt-[3px]">{fmtTHB(item.price)}</Text>
                </View>
                <View className="flex-row items-center gap-[2px]">
                  <Pressable
                    onPress={() => decItem(item.id)}
                    className="w-[26px] h-[26px] rounded-full bg-bg-soft items-center justify-center"
                  >
                    <Icon name={item.qty === 1 ? 'trash' : 'minus'} size={14} color="#68615c" />
                  </Pressable>
                  <Text
                    style={{ fontFamily: 'BodoniModa' }}
                    className="text-[14px] text-ink w-[26px] text-center"
                  >
                    {item.qty}
                  </Text>
                  <Pressable
                    onPress={() => incItem(item.id)}
                    className="w-[26px] h-[26px] rounded-full bg-bg-soft items-center justify-center"
                  >
                    <Icon name="plus" size={14} color="#68615c" />
                  </Pressable>
                </View>
                <Text
                  style={{ fontFamily: 'BodoniModa' }}
                  className="text-[17px] text-ink min-w-[64px] text-right"
                >
                  {fmtTHB(item.price * item.qty)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <View className="px-[22px] pt-5 pb-[22px] border-t border-line bg-panel-2 gap-[10px]">
          <View className="flex-row items-center justify-between">
            <Text className="text-ink-3 text-[10.5px] uppercase tracking-[0.08em]">{t.subtotal}</Text>
            <Text className="text-ink-2 text-[12.5px]">{fmtTHB2(subtotal)}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setDiscOpen(true)}
              disabled={cart.length === 0}
              className={`flex-row items-center gap-[7px] py-1 ${cart.length === 0 ? 'opacity-30' : ''}`}
            >
              <Icon name="percent" size={14} color={discountAmt > 0 ? '#7a1a37' : '#a39c96'} />
              <Text
                className={`text-[10.5px] uppercase tracking-[0.1em] ${
                  discountAmt > 0 ? 'text-burgundy' : 'text-ink-3'
                }`}
              >
                {discountAmt > 0
                  ? discount.type !== 'none' && 'code' in discount && discount.code
                    ? discount.code
                    : discount.type === 'pct'
                    ? t.percentOff(discount.value)
                    : t.amountOff(discount.value)
                  : t.addDiscount}
              </Text>
            </Pressable>
            {discountAmt > 0 && (
              <Text style={{ fontFamily: 'BodoniModa' }} className="text-burgundy text-[12.5px]">
                −{fmtTHB2(discountAmt)}
              </Text>
            )}
          </View>

          <View className="flex-row items-baseline justify-between pt-[14px] border-t border-line mt-[6px]">
            <Text className="text-ink-3 text-[10.5px] uppercase tracking-[0.16em]">{t.total}</Text>
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[40px] text-ink">
              {fmtTHB2(total)}
            </Text>
          </View>

          <Pressable
            onPress={goPay}
            disabled={cart.length === 0}
            className={`h-[58px] rounded-[12px] items-center justify-between flex-row px-[22px] mt-[10px] ${
              cart.length === 0 ? 'bg-bg-soft' : 'bg-ink'
            }`}
          >
            <Text
              className={`${cart.length === 0 ? 'text-ink-3' : 'text-panel'} text-[13px] uppercase tracking-[0.12em]`}
            >
              {t.charge(total)}
            </Text>
            <Icon name="arrowRight" size={20} color={cart.length === 0 ? '#a39c96' : '#fff'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
