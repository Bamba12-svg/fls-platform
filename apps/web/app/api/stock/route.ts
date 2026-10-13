import { NextResponse } from 'next/server';
import { getRepo } from '@fls/db';

export const dynamic = 'force-dynamic';

/** Niveaux de stock (cartons) par code article, pour le rafraîchissement en direct du portail. */
export async function GET() {
  const products = await (await getRepo()).products();
  return NextResponse.json(Object.fromEntries(products.map((p) => [p.code, p.stock])), { headers: { 'Cache-Control': 'no-store' } });
}
