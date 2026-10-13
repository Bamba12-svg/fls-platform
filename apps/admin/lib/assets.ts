/** Les médias sont servis par le site public (même domaine en production grâce à la réécriture /admin-fls). */
export const asset = (url: string | null | undefined) => (!url ? '' : /^https?:/.test(url) ? url : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}${url}`);
