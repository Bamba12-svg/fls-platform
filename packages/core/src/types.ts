/** Types métier partagés par le site, le back-office et les adaptateurs e-commerce. */
export type Locale = 'fr' | 'en';
export type Segment = 'GROSSISTE' | 'DEMI_GROSSISTE' | 'CHR' | 'B2C';
export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

/** Montants en francs CFA (XOF), entiers. */
export type Xof = number;

export interface PricedProduct {
  code: string;
  /** Prix carton HT de référence (grille CHR). */
  basePrice: Xof;
  unitsPerCase: number;
  casesPerPallet: number;
  /** Multiple de vente obligatoire, en cartons. */
  minOrderMultiple?: number;
}

export interface VolumeDiscount {
  /** Remise appliquée à partir de ce nombre de cartons. */
  minCases?: number | null;
  /** Remise appliquée à partir d'une palette complète. */
  pallet?: boolean;
  percent: number;
}

export interface PricingSettings {
  vatRate: number;            // 0.18 au Sénégal
  francoThreshold: Xof;       // franco de port, HT
  deliveryFee: Xof;           // frais de livraison sous le franco, HT
  b2cEnabled: boolean;
  b2cMargin: number;          // coefficient appliqué au prix unitaire grand public
}

export interface PricingContext {
  segment: Segment | null;    // null = visiteur non connecté
  coefficient: number;        // coefficient de la grille du segment (ex. 0,88 grossiste)
  discounts: VolumeDiscount[];
  settings: PricingSettings;
}

export interface CartLine { code: string; qty: number }

export const DEFAULT_SETTINGS: PricingSettings = {
  vatRate: 0.18,
  francoThreshold: 250_000,
  deliveryFee: 15_000,
  b2cEnabled: false,
  b2cMargin: 1.25,
};

export const DEFAULT_DISCOUNTS: VolumeDiscount[] = [
  { minCases: 10, percent: 4 },
  { pallet: true, percent: 9 },
];

export const SEGMENT_COEFFICIENTS: Record<Segment, number> = {
  GROSSISTE: 0.88,
  DEMI_GROSSISTE: 0.94,
  CHR: 1,
  B2C: 1,
};
