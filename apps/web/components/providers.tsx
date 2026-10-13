'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { casePriceHT, computeCart, formatMoney, unitPriceTTC, type CartLine, type Currency, type PricedProduct, type PricingContext } from '@fls/core';
import type { Locale } from '@/lib/i18n';
import { Icon } from './Icon';

/* ---------- Langue ---------- */
const LocaleCtx = createContext<Locale>('fr');
export const useLocale = () => useContext(LocaleCtx);
export const useT = () => { const l = useLocale(); return (fr: string, en: string) => (l === 'en' ? en : fr); };

/* ---------- Devise (FCFA / EUR) ---------- */
const CurrencyCtx = createContext<{ cur: Currency; setCur: (c: Currency) => void; money: (xof: number) => string }>({ cur: 'XOF', setCur: () => {}, money: (x) => String(x) });
export const useMoney = () => useContext(CurrencyCtx);

/* ---------- Tarification du client connecté ---------- */
/** Produit côté navigateur : SANS prix. Les prix ne sont transmis qu'aux clients connectés, via /api/pricing. */
export interface CatalogItem { code: string; slug: string; universe: string; name: { fr: string; en: string }; pack: { fr: string; en: string }; image: string | null; stock: number; unitsPerCase: number; casesPerPallet: number; minOrderMultiple: number }
interface PricingValue { ctx: PricingContext | null; logged: boolean; b2c: boolean; base: Record<string, number>; priced: (p: CatalogItem) => PricedProduct | null; caseFor: (p: CatalogItem, q?: number) => number; unitTTC: (p: CatalogItem) => number }
const PricingCtx = createContext<PricingValue>({ ctx: null, logged: false, b2c: false, base: {}, priced: () => null, caseFor: () => 0, unitTTC: () => 0 });
export const usePricing = () => useContext(PricingCtx);

/* ---------- Panier ---------- */
interface CartState { lines: CartLine[]; items: Record<string, CatalogItem>; add: (item: CatalogItem, qty: number) => void; set: (code: string, qty: number) => void; clear: () => void }
const CartCtx = createContext<CartState>({ lines: [], items: {}, add: () => {}, set: () => {}, clear: () => {} });
export const useCart = () => useContext(CartCtx);

/* ---------- Tiroirs, fenêtres, notifications ---------- */
type Layer = null | 'cart' | 'devis' | 'mnav' | 'sheet' | 'order';
interface UIState {
  layer: Layer; open: (l: Exclude<Layer, null>) => void; close: () => void;
  devis: { type: string; note: string }; openDevis: (type?: string, note?: string) => void;
  sheetCode: string | null; openSheet: (code: string) => void;
  lastOrder: { ref: string; total: number } | null; setLastOrder: (o: { ref: string; total: number } | null) => void;
  toast: (msg: string, icon?: string) => void;
}
const UICtx = createContext<UIState | null>(null);
export const useUI = () => { const v = useContext(UICtx); if (!v) throw new Error('UIProvider manquant'); return v; };

function safeGet(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key: string, v: string) { try { localStorage.setItem(key, v); } catch { /* stockage indisponible */ } }

function PricingProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<{ ctx: PricingContext; base: Record<string, number> } | null>(null);
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { setData(null); return; }
    let alive = true;
    fetch('/api/pricing').then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive) setData(j); }).catch(() => {});
    return () => { alive = false; };
  }, [session, status]);
  const value = useMemo<PricingValue>(() => {
    const ctx = data?.ctx ?? null; const base = data?.base ?? {};
    const priced = (p: CatalogItem): PricedProduct | null => (base[p.code] != null ? { code: p.code, basePrice: base[p.code]!, unitsPerCase: p.unitsPerCase, casesPerPallet: p.casesPerPallet, minOrderMultiple: p.minOrderMultiple } : null);
    return {
      ctx, base, priced, logged: !!session && !!ctx, b2c: ctx?.segment === 'B2C',
      caseFor: (p, q = 1) => { const pp = priced(p); return ctx && pp ? casePriceHT(pp, q, ctx) : 0; },
      unitTTC: (p) => { const pp = priced(p); return ctx && pp ? unitPriceTTC(pp, ctx) : 0; },
    };
  }, [data, session]);
  return <PricingCtx.Provider value={value}>{children}</PricingCtx.Provider>;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ lines: CartLine[]; items: Record<string, CatalogItem> }>({ lines: [], items: {} });
  useEffect(() => { const raw = safeGet('fls-cart'); if (raw) try { setState(JSON.parse(raw)); } catch { /* panier corrompu ignoré */ } }, []);
  const persist = (s: typeof state) => { safeSet('fls-cart', JSON.stringify(s)); return s; };
  const add = useCallback((item: CatalogItem, qty: number) => setState((s) => {
    const exists = s.lines.find((l) => l.code === item.code);
    const lines = exists ? s.lines.map((l) => (l.code === item.code ? { ...l, qty: l.qty + qty } : l)) : [...s.lines, { code: item.code, qty }];
    return persist({ lines, items: { ...s.items, [item.code]: item } });
  }), []);
  const set = useCallback((code: string, qty: number) => setState((s) => persist({ ...s, lines: qty > 0 ? s.lines.map((l) => (l.code === code ? { ...l, qty } : l)) : s.lines.filter((l) => l.code !== code) })), []);
  const clear = useCallback(() => setState(() => persist({ lines: [], items: {} })), []);
  return <CartCtx.Provider value={{ ...state, add, set, clear }}>{children}</CartCtx.Provider>;
}

export function useCartTotals() {
  const { lines, items } = useCart(); const { ctx, priced } = usePricing();
  return useMemo(() => {
    if (!ctx) return null;
    const map = new Map<string, PricedProduct>();
    Object.values(items).forEach((i) => { const p = priced(i); if (p) map.set(i.code, p); });
    return computeCart(lines, map, ctx);
  }, [lines, items, ctx, priced]);
}

export function AppProviders({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [cur, setCurState] = useState<Currency>('XOF');
  useEffect(() => { const c = safeGet('fls-cur'); if (c === 'EUR') setCurState('EUR'); }, []);
  const setCur = (c: Currency) => { setCurState(c); safeSet('fls-cur', c); };
  const money = useCallback((xof: number) => formatMoney(xof, locale, cur), [locale, cur]);

  const [layer, setLayer] = useState<Layer>(null);
  const [devis, setDevis] = useState({ type: 'appro', note: '' });
  const [sheetCode, setSheetCode] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<{ ref: string; total: number } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; icon: string }[]>([]);
  const toast = useCallback((msg: string, icon = 'check') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-1), { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  useEffect(() => { document.body.style.overflow = layer ? 'hidden' : ''; }, [layer]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setLayer(null); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  const ui: UIState = {
    layer, open: setLayer, close: () => setLayer(null), devis,
    openDevis: (type = 'appro', note = '') => { setDevis({ type, note }); setLayer('devis'); },
    sheetCode, openSheet: (code) => { setSheetCode(code); setLayer('sheet'); },
    lastOrder, setLastOrder, toast,
  };
  return (
    <SessionProvider>
      <LocaleCtx.Provider value={locale}>
        <CurrencyCtx.Provider value={{ cur, setCur, money }}>
          <PricingProvider>
            <CartProvider>
              <UICtx.Provider value={ui}>
                {children}
                <div className="sn-toasts" aria-live="polite">
                  {toasts.map((t) => <div key={t.id} className="sn-toast" role="status"><Icon name={t.icon} /><span>{t.msg}</span></div>)}
                </div>
              </UICtx.Provider>
            </CartProvider>
          </PricingProvider>
        </CurrencyCtx.Provider>
      </LocaleCtx.Provider>
    </SessionProvider>
  );
}
