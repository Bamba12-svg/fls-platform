import { NextResponse } from 'next/server';
import { getRepo } from '@fls/db';
import { toPublic } from '@/lib/catalog';

/** Fiche produit publique (sans prix). */
export async function GET(_: Request, { params }: { params: { code: string } }) {
  const p = await (await getRepo()).product(decodeURIComponent(params.code));
  if (!p || !p.active) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(toPublic(p), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
