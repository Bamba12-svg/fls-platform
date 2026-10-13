import type { CartLine, PricedProduct, PricingContext, VolumeDiscount, Xof } from './types';

/** Arrondi commercial aux 5 F CFA. */
export const round5 = (n: number): Xof => Math.round(n / 5) * 5;
/** Arrondi grand public aux 25 F CFA. */
export const round25 = (n: number): Xof => Math.round(n / 25) * 25;

/** Remise de volume (en %) applicable pour une quantité de cartons donnée. */
export function volumeDiscountPercent(product: PricedProduct, qtyCases: number, discounts: VolumeDiscount[]): number {
  let best = 0;
  for (const d of discounts) {
    const reached = d.pallet ? qtyCases >= product.casesPerPallet : d.minCases != null && qtyCases >= d.minCases;
    if (reached && d.percent > best) best = d.percent;
  }
  return best;
}

/** Prix carton HT pour le segment du client et la quantité commandée. */
export function casePriceHT(product: PricedProduct, qtyCases: number, ctx: PricingContext): Xof {
  const pct = volumeDiscountPercent(product, qtyCases, ctx.discounts);
  return round5(product.basePrice * ctx.coefficient * (1 - pct / 100));
}

/** Prix unitaire TTC grand public (canal B2C). */
export function unitPriceTTC(product: PricedProduct, ctx: PricingContext): Xof {
  return round25((product.basePrice / product.unitsPerCase) * ctx.settings.b2cMargin * (1 + ctx.settings.vatRate));
}

/** Grille dégressive affichée sur la fiche produit. */
export function priceTiers(product: PricedProduct, ctx: PricingContext) {
  const thresholds = [1, ...ctx.discounts.map((d) => (d.pallet ? product.casesPerPallet : d.minCases ?? 1))]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);
  return thresholds.map((min, i) => {
    const next = thresholds[i + 1];
    const price = casePriceHT(product, min, ctx);
    return {
      minCases: min,
      maxCases: next ? next - 1 : null,
      casePrice: price,
      unitPrice: Math.round(price / product.unitsPerCase),
      percent: volumeDiscountPercent(product, min, ctx.discounts),
      isPallet: min === product.casesPerPallet,
    };
  });
}

/** Normalise une quantité au multiple de vente obligatoire (arrondi supérieur). */
export function normaliseQty(product: PricedProduct, qty: number): number {
  const m = Math.max(1, product.minOrderMultiple ?? 1);
  const q = Math.max(0, Math.floor(qty));
  return q === 0 ? 0 : Math.ceil(q / m) * m;
}

export interface CartTotals {
  lines: { code: string; qty: number; unitPrice: Xof; total: Xof; discountPercent: number }[];
  subtotal: Xof;   // HT hors livraison (B2B) / TTC (B2C)
  shipping: Xof;
  totalHT: Xof;
  vat: Xof;
  totalTTC: Xof;
  francoReached: boolean;
  francoRemaining: Xof;
}

/** Calcul du panier. Toujours recalculé côté serveur avant d'enregistrer une commande. */
export function computeCart(lines: CartLine[], catalog: Map<string, PricedProduct>, ctx: PricingContext): CartTotals {
  const b2c = ctx.segment === 'B2C';
  const out: CartTotals['lines'] = [];
  for (const l of lines) {
    const p = catalog.get(l.code);
    if (!p || l.qty <= 0) continue;
    const qty = b2c ? Math.floor(l.qty) : normaliseQty(p, l.qty);
    const unitPrice = b2c ? unitPriceTTC(p, ctx) : casePriceHT(p, qty, ctx);
    out.push({ code: l.code, qty, unitPrice, total: unitPrice * qty, discountPercent: b2c ? 0 : volumeDiscountPercent(p, qty, ctx.discounts) });
  }
  const subtotal = out.reduce((s, l) => s + l.total, 0);
  const { vatRate, francoThreshold, deliveryFee } = ctx.settings;
  if (b2c) {
    const totalHT = Math.round(subtotal / (1 + vatRate));
    return { lines: out, subtotal, shipping: 0, totalHT, vat: subtotal - totalHT, totalTTC: subtotal, francoReached: true, francoRemaining: 0 };
  }
  const francoReached = subtotal >= francoThreshold;
  const shipping = subtotal > 0 && !francoReached ? deliveryFee : 0;
  const totalHT = subtotal + shipping;
  const vat = Math.round(totalHT * vatRate);
  return { lines: out, subtotal, shipping, totalHT, vat, totalTTC: totalHT + vat, francoReached, francoRemaining: Math.max(0, francoThreshold - subtotal) };
}

/** Coût matière d'un menu : ratio coût des ingrédients / prix de vente HT. */
export function foodCostRatio(sellingPriceTTC: Xof, ingredientCost: Xof, vatRate = 0.18): number {
  const ht = sellingPriceTTC / (1 + vatRate);
  return ht > 0 ? ingredientCost / ht : 0;
}
