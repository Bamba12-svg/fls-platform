import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getRepo } from '@fls/db';
import type { Segment } from '@fls/core';

declare module 'next-auth' {
  interface Session { user: { id: string; email: string; name: string; company: string; segment: Segment } }
  interface User { id: string; email: string; name: string; company: string; segment: Segment }
}
declare module 'next-auth/jwt' {
  interface JWT { uid?: string; company?: string; segment?: Segment }
}

/** Authentification des acheteurs professionnels (sessions JWT, mots de passe bcrypt). */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 12 },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-a-remplacer',
  pages: { signIn: '/fr/connexion' },
  providers: [
    CredentialsProvider({
      name: 'Mon Compte FLS',
      credentials: { email: { label: 'E-mail', type: 'email' }, password: { label: 'Mot de passe', type: 'password' } },
      async authorize(creds) {
        const email = String(creds?.email ?? '').trim().toLowerCase();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;
        const repo = await getRepo();
        const c = await repo.customerAuth(email);
        if (!c?.passwordHash || c.status !== 'APPROVED') return null;
        if (!(await bcrypt.compare(password, c.passwordHash))) return null;
        // Vente aux particuliers : activable depuis le back-office (Tarifs > Paramètres).
        if (c.segment === 'B2C' && !(await repo.settings()).b2cEnabled) return null;
        return { id: c.id, email: c.email, name: c.name, company: c.companyName, segment: c.segment };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.uid = user.id; token.company = user.company; token.segment = user.segment; }
      return token;
    },
    async session({ session, token }) {
      session.user = { id: token.uid ?? '', email: token.email ?? '', name: token.name ?? '', company: token.company ?? '', segment: (token.segment ?? 'CHR') as Segment };
      return session;
    },
  },
};
