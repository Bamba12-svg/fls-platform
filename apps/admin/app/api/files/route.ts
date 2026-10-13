import { readFile } from 'node:fs/promises';
import { join, normalize, resolve, sep } from 'node:path';
import { NextResponse } from 'next/server';
import { currentStaff, can } from '@/lib/auth';

const PRIVATE = resolve(process.env.PRIVATE_DIR || join(process.cwd(), '..', '..', 'storage', 'private'));
const TYPES: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/** Lecture des justificatifs privés (NINEA, RCCM, CV) : personnel habilité uniquement. */
export async function GET(req: Request) {
  const s = await currentStaff();
  if (!s || !(can(s.role, 'accounts') || can(s.role, 'leads'))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const f = new URL(req.url).searchParams.get('f') ?? '';
  if (!f.startsWith('private:')) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const path = resolve(PRIVATE, normalize(f.slice(8)));
  if (!path.startsWith(PRIVATE + sep)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const buf = await readFile(path); const ext = path.split('.').pop() ?? '';
    return new NextResponse(buf, { headers: { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Content-Disposition': 'inline', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return NextResponse.json({ error: 'not_found' }, { status: 404 }); }
}
