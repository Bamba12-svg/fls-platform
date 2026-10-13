import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getRepo } from '@fls/db';

/** Bibliothèque d'images proposée dans les sélecteurs : médias téléversés + visuels existants du site (ancien fls.sn). */
export async function imageLibrary() {
  const pub = resolve(process.env.WEB_PUBLIC_DIR || join(process.cwd(), '..', 'web', 'public'));
  const list = async (dir: string, prefix: string) => { try { return (await readdir(join(pub, dir))).filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f)).map((f) => `${prefix}/${f}`); } catch { return []; } };
  const media = (await (await getRepo()).media()).filter((m) => m.mime.startsWith('image/')).map((m) => m.url);
  return [...media, ...(await list('img/p', '/img/p')), ...(await list('img', '/img'))];
}
