import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const LOCALES = ['fr', 'en'];

/** Redirection vers /fr ou /en selon le navigateur, et protection de l'espace client. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split('/')[1] ?? '';
  if (!LOCALES.includes(seg)) {
    const pref = req.cookies.get('NEXT_LOCALE')?.value;
    const accept = req.headers.get('accept-language') ?? '';
    const l = pref && LOCALES.includes(pref) ? pref : /^en\b/i.test(accept.trim()) ? 'en' : 'fr';
    const url = req.nextUrl.clone(); url.pathname = `/${l}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith(`/${seg}/compte`)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'dev-secret-a-remplacer' });
    if (!token) { const url = req.nextUrl.clone(); url.pathname = `/${seg}/connexion`; url.search = `?next=${encodeURIComponent(pathname)}`; return NextResponse.redirect(url); }
  }
  const res = NextResponse.next();
  if (req.cookies.get('NEXT_LOCALE')?.value !== seg) res.cookies.set('NEXT_LOCALE', seg, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  return res;
}

export const config = { matcher: ['/((?!api|_next|admin-fls|.*\\..*).*)'] };
