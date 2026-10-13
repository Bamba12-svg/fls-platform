import type { CartLine, Segment, Xof } from './types';

/**
 * Contrat du moteur e-commerce.
 * Étape 1 : implémentation Prisma (apps/web/lib/commerce-prisma.ts).
 * Étape 2 : adaptateur Medusa.js (même interface), activé par la variable COMMERCE_PROVIDER=medusa.
 * Le front-office et le back-office ne dépendent que de cette interface.
 */
export interface CommerceProvider {
  name: 'prisma' | 'medusa';
  listProducts(filter: { universe?: string; q?: string; inStock?: boolean; locale: 'fr' | 'en' }): Promise<CommerceProduct[]>;
  getProduct(slugOrCode: string): Promise<CommerceProduct | null>;
  placeOrder(input: { customerId: string; lines: CartLine[] }): Promise<{ ref: string; totalTTC: Xof }>;
  stockLevels(codes: string[]): Promise<Record<string, number>>;
}

export interface CommerceProduct {
  id: string;
  code: string;
  slug: string;
  name: { fr: string; en: string };
  brand: string;
  universes: string[];
  basePrice: Xof;
  unitsPerCase: number;
  casesPerPallet: number;
  stock: number;
  segmentPrices?: Partial<Record<Segment, Xof>>;
}
