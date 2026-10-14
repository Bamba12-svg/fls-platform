import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

const NAVY = rgb(0, 0.2, 0.4), GREEN = rgb(0, 0.4, 0.2), MUTED = rgb(0.36, 0.4, 0.37), LINE = rgb(0.85, 0.88, 0.86);
/** Les polices standard PDF sont en WinAnsi : on remplace les caractères hors jeu (espaces fines, flèches…). */
export const ansi = (s: string) => s.replace(/[  ]/g, ' ').replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/[−–—]/g, '-').replace(/×/g, 'x').replace(/[^\x20-\x7E\xA0-\xFF€ŒœŠšŸŽž…•‰]/g, '');
const money = (x: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(x)).replace(/[  ]/g, ' ')} F CFA`;

export async function newDoc(title: string) {
  const doc = await PDFDocument.create(); doc.setTitle(title); doc.setAuthor('Fournisseur Libre Service (FLS)'); doc.setCreator('fls.sn');
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica); const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  // En-tête : logo FLS stylisé
  [0, 1, 2].forEach((i) => { const x = 40 + i * 22; page.drawRectangle({ x, y: 778, width: 18, height: 30, color: rgb(0.055, 0.467, 0.27) }); page.drawText('FLS'[i]!, { x: x + 4, y: 786, size: 16, font: bold, color: rgb(0.86, 0.8, 0.18) }); });
  page.drawText('Fournisseur Libre Service', { x: 112, y: 796, size: 12, font: bold, color: NAVY });
  page.drawText(ansi('Groupe COSEMAD · Sénégal, Dakar, Médina, Rue 39 x 22 · +221 33 889 06 66 · fls@cosemad.sn'), { x: 112, y: 782, size: 8, font, color: MUTED });
  page.drawLine({ start: { x: 40, y: 765 }, end: { x: 555, y: 765 }, thickness: 1, color: LINE });
  return { doc, page, font, bold };
}

export function text(page: PDFPage, s: string, x: number, y: number, f: PDFFont, size = 10, color = rgb(0.1, 0.12, 0.11)) { page.drawText(ansi(s), { x, y, size, font: f, color }); }
export function right(page: PDFPage, s: string, xr: number, y: number, f: PDFFont, size = 10) { const t = ansi(s); page.drawText(t, { x: xr - f.widthOfTextAtSize(t, size), y, size, font: f, color: rgb(0.1, 0.12, 0.11) }); }
export function wrap(s: string, f: PDFFont, size: number, width: number) {
  const words = ansi(s).split(/\s+/); const lines: string[] = []; let cur = '';
  words.forEach((w) => { const n = cur ? `${cur} ${w}` : w; if (f.widthOfTextAtSize(n, size) > width && cur) { lines.push(cur); cur = w; } else cur = n; });
  if (cur) lines.push(cur); return lines;
}
export { money as pdfMoney, NAVY, GREEN, MUTED, LINE };
