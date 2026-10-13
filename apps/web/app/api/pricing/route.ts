import { NextResponse } from 'next/server';
import { getRepo } from '@fls/db';
import { pricingContextFor } from '@/lib/pricing';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Prix de base et contexte tarifaire : uniquement pour un client connecté et validé. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const [ctx, products] = await Promise.all([pricingContextFor(session.user.segment), (await getRepo()).products()]);
  const base = Object.fromEntries(products.map((p) => [p.code, p.basePrice]));
  return NextResponse.json({ ctx, base }, { headers: { 'Cache-Control': 'private, no-store' } });
}
