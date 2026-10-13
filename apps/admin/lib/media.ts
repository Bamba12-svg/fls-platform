import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';

/**
 * Médias : conversion WebP (qualité 80, 2000 px max) avec sharp, enregistrement dans le dossier public du site
 * (MEDIA_DIR, par défaut apps/web/public/uploads). En production, à remplacer par Cloudinary (CLOUDINARY_URL).
 */
const DIR = resolve(process.env.MEDIA_DIR || join(process.cwd(), '..', 'web', 'public', 'uploads'));
const IMAGE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export async function storeMedia(file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Fichier trop lourd (10 Mo maximum).');
  const buf = Buffer.from(await file.arrayBuffer());
  const base = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'media';
  const name = `${base}-${randomBytes(3).toString('hex')}`;
  await mkdir(join(DIR, 'media'), { recursive: true });
  if (IMAGE.has(file.type)) {
    const img = sharp(buf, { animated: false }).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true });
    const out = await img.webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
    await writeFile(join(DIR, 'media', `${name}.webp`), out.data);
    return { filename: `${name}.webp`, url: `/uploads/media/${name}.webp`, mime: 'image/webp', width: out.info.width, height: out.info.height, size: out.info.size };
  }
  if (file.type === 'application/pdf' && buf.subarray(0, 4).toString() === '%PDF') {
    await writeFile(join(DIR, 'media', `${name}.pdf`), buf);
    return { filename: `${name}.pdf`, url: `/uploads/media/${name}.pdf`, mime: 'application/pdf', width: null, height: null, size: buf.length };
  }
  throw new Error('Format non accepté : images (JPG, PNG, WebP, AVIF) ou PDF.');
}
