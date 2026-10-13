import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ALLOWED = new Map([['application/pdf', 'pdf'], ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);
export const MAX_UPLOAD = 5 * 1024 * 1024;
/** Dossier PRIVÉ (hors de public/) : les justificatifs ne sont jamais servis publiquement. */
export const PRIVATE_DIR = path.resolve(process.env.PRIVATE_DIR || path.join(process.cwd(), '..', '..', 'storage', 'private'));

const MAGIC: Record<string, (b: Buffer) => boolean> = {
  pdf: (b) => b.subarray(0, 4).toString() === '%PDF',
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8,
  png: (b) => b.subarray(1, 4).toString() === 'PNG',
  webp: (b) => b.subarray(8, 12).toString() === 'WEBP',
};

/**
 * Enregistre un justificatif (NINEA, RCCM, CV) envoyé depuis le site, dans le stockage privé.
 * L'URL retournée (« private:… ») n'est lisible que via le back-office, après authentification.
 */
export async function saveUpload(file: File, folder = 'documents') {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error('Format non accepté : PDF, JPG, PNG ou WebP uniquement.');
  if (file.size > MAX_UPLOAD) throw new Error('Fichier trop lourd : 5 Mo maximum.');
  const buf = Buffer.from(await file.arrayBuffer());
  if (!MAGIC[ext]!(buf)) throw new Error('Le contenu du fichier ne correspond pas à son format.');
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const dir = path.join(PRIVATE_DIR, folder.replace(/[^a-z]/g, ''));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { url: `private:${folder}/${name}`, filename: file.name.slice(0, 120), mime: file.type, size: file.size };
}
