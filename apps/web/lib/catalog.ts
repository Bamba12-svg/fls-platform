import type { ProductDTO } from '@fls/db';
import type { CatalogItem } from '@/components/providers';

/** Produit transmis au navigateur : toutes les informations publiques, sauf le prix. */
export interface PublicProduct extends CatalogItem {
  brand: { name: string; exclusive: boolean }; subcategory: string | null; universes: string[];
  isNew: boolean; isDeal: boolean; halal: boolean; allergens: string[]; origin: string | null;
  nutrition: Record<string, number> | null; description: { fr: string; en: string } | null; sectors: string[];
}

export const toPublic = (p: ProductDTO): PublicProduct => ({
  code: p.code, slug: p.slug, universe: p.universe, universes: p.universes, name: p.name, pack: p.pack, image: p.image, stock: p.stock,
  unitsPerCase: p.unitsPerCase, casesPerPallet: p.casesPerPallet, minOrderMultiple: p.minOrderMultiple, brand: p.brand, subcategory: p.subcategory,
  isNew: p.isNew, isDeal: p.isDeal, halal: p.halal, allergens: p.allergens, origin: p.origin, nutrition: p.nutrition, description: p.description, sectors: p.sectors,
});

/** Photo des rayons FLS utilisée pour les produits sans visuel (recadrage différent par produit). */
export const SHELF: Record<string, string> = { boissons: '/img/u-boissons.webp', epicerie: '/img/f-rayons2.webp', frais: '/img/f-sup-rayons.webp', surgeles: '/img/f-stand1.webp', conserves: '/img/f-sup-rayons.webp' };
export const UNIVERSE_ICON: Record<string, string> = { boissons: 'bottle', epicerie: 'sack', frais: 'yog', surgeles: 'snow', conserves: 'tin' };
export const productPath = (locale: string, p: { universe: string; slug: string }) => `/${locale}/categories/${p.universe}/${p.slug}`;
