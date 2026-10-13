import { getRepo } from '@fls/db';
import type { PricingContext, Segment } from '@fls/core';

/** Contexte tarifaire d'un client : seul le coefficient de SON segment est transmis au navigateur. */
export async function pricingContextFor(segment: Segment | null): Promise<PricingContext> {
  const repo = await getRepo();
  const [settings, discounts, grids] = await Promise.all([repo.settings(), repo.discounts(), repo.grids()]);
  const coefficient = segment ? grids.find((g) => g.segment === segment)?.coefficient ?? 1 : 1;
  return { segment, coefficient, discounts, settings };
}
