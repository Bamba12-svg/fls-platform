import { NextResponse } from 'next/server';
import { getRepo } from '@fls/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });
  return NextResponse.json(await (await getRepo()).baskets(session.user.id), { headers: { 'Cache-Control': 'private, no-store' } });
}
