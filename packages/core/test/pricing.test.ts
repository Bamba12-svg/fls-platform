import { describe, expect, it } from 'vitest';
import { casePriceHT, computeCart, DEFAULT_DISCOUNTS, DEFAULT_SETTINGS, foodCostRatio, normaliseQty, priceTiers, unitPriceTTC, type PricingContext, type PricedProduct } from '../src';

const p: PricedProduct = { code: 'UL-033', basePrice: 8400, unitsPerCase: 24, casesPerPallet: 84 };
const ctx = (coef: number, segment: PricingContext['segment'] = 'GROSSISTE'): PricingContext => ({ segment, coefficient: coef, discounts: DEFAULT_DISCOUNTS, settings: DEFAULT_SETTINGS });

describe('tarification', () => {
  it('applique la grille du segment', () => {
    expect(casePriceHT(p, 1, ctx(1, 'CHR'))).toBe(8400);
    expect(casePriceHT(p, 1, ctx(0.88))).toBe(7390); // 7392 arrondi aux 5 F
  });
  it('applique la remise volume puis palette', () => {
    expect(casePriceHT(p, 10, ctx(1, 'CHR'))).toBe(8065); // −4 %
    expect(casePriceHT(p, 84, ctx(1, 'CHR'))).toBe(7645); // −9 %
  });
  it('produit une grille dégressive ordonnée', () => {
    const t = priceTiers(p, ctx(1, 'CHR'));
    expect(t.map((x) => x.minCases)).toEqual([1, 10, 84]);
    expect(t[2]?.isPallet).toBe(true);
    expect(t[0]?.maxCases).toBe(9);
  });
  it('calcule le prix grand public TTC', () => {
    expect(unitPriceTTC(p, ctx(1, 'B2C'))).toBe(525); // 350 × 1,25 × 1,18 = 516,25 → 525
  });
  it('respecte les multiples de vente', () => {
    expect(normaliseQty({ ...p, minOrderMultiple: 5 }, 7)).toBe(10);
  });
  it('gère le franco de port et la TVA', () => {
    const cat = new Map([[p.code, p]]);
    const small = computeCart([{ code: 'UL-033', qty: 2 }], cat, ctx(1, 'CHR'));
    expect(small.shipping).toBe(15000);
    expect(small.vat).toBe(Math.round((16800 + 15000) * 0.18));
    const big = computeCart([{ code: 'UL-033', qty: 40 }], cat, ctx(1, 'CHR'));
    expect(big.francoReached).toBe(true);
    expect(big.shipping).toBe(0);
  });
  it('calcule le coût matière', () => {
    expect(foodCostRatio(3540, 900)).toBeCloseTo(0.3, 2);
  });
});
