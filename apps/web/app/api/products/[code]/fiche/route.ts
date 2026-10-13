import { NextResponse } from 'next/server';
import { getRepo } from '@fls/db';
import { ALLERGENS } from '@/lib/content';
import { GREEN, LINE, MUTED, NAVY, newDoc, right, text, wrap } from '@/lib/pdf';

/** Fiche technique produit générée en PDF (données du catalogue : conditionnement, allergènes, nutrition). */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const p = await (await getRepo()).product(decodeURIComponent(params.code));
  if (!p || !p.active) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const q = new URL(req.url).searchParams; const en = q.get('lang') === 'en'; const halal = q.get('doc') === 'halal';
  const t = (fr: string, e: string) => (en ? e : fr); const L = (o: { fr: string; en: string } | null) => (o ? (en ? o.en : o.fr) : '');
  const { doc, page, font, bold } = await newDoc(`${halal ? t('Attestation halal', 'Halal statement') : t('Fiche technique', 'Technical sheet')} ${p.code}`);
  text(page, halal ? t('ATTESTATION HALAL', 'HALAL STATEMENT') : t('FICHE TECHNIQUE', 'TECHNICAL SHEET'), 40, 730, bold, 18, NAVY);
  text(page, `${L(p.name)} · ${p.code}`, 40, 708, bold, 13);
  text(page, `${p.brand.name}${p.brand.exclusive ? t(' · exclusivité FLS', ' · FLS exclusive') : ''}`, 40, 692, font, 10, MUTED);
  let y = 660;
  if (halal) {
    if (!p.halal) return NextResponse.json({ error: 'not_halal' }, { status: 404 });
    wrap(t(`FLS atteste que le produit ${L(p.name)} (${p.code}) est référencé comme halal sur la base du certificat fourni par le fabricant ${p.brand.name}. Le certificat original est disponible sur demande auprès du Service Qualité & Hygiène alimentaire.`, `FLS states that ${L(p.name)} (${p.code}) is listed as halal based on the certificate supplied by the manufacturer ${p.brand.name}. The original certificate is available on request from the Food Quality & Hygiene department.`), font, 11, 515).forEach((ln) => { text(page, ln, 40, y, font, 11); y -= 16; });
  } else {
    const kv: [string, string][] = [[t('Conditionnement', 'Packaging'), L(p.pack)], [t('Unités par carton', 'Units per case'), String(p.unitsPerCase)], [t('Cartons par palette', 'Cases per pallet'), String(p.casesPerPallet)], [t('Origine', 'Origin'), p.origin ?? '—'], ['Halal', p.halal ? t('Oui (certificat fournisseur)', 'Yes (supplier certificate)') : t('Non déclaré', 'Not declared')]];
    kv.forEach(([k, v]) => { text(page, k, 40, y, font, 10, MUTED); text(page, v, 200, y, bold, 10); y -= 18; });
    if (p.description) { y -= 8; wrap(L(p.description), font, 10, 515).forEach((ln) => { text(page, ln, 40, y, font, 10); y -= 14; }); }
    y -= 14; text(page, t('Allergènes (règlement : 14 allergènes majeurs)', 'Allergens (14 major allergens)'), 40, y, bold, 11, GREEN); y -= 18;
    text(page, p.allergens.length ? p.allergens.map((a) => L(ALLERGENS[a] ?? null) || a).join(', ') : t('Aucun allergène majeur déclaré.', 'No major allergen declared.'), 40, y, font, 10); y -= 28;
    if (p.nutrition) {
      text(page, t('Valeurs nutritionnelles moyennes pour 100 g / 100 ml', 'Average nutrition per 100 g / 100 ml'), 40, y, bold, 11, GREEN); y -= 20;
      const n = p.nutrition; const rows: [string, string][] = [[t('Énergie', 'Energy'), `${n.energyKcal ?? '—'} kcal`], [t('Matières grasses', 'Fat'), `${n.fat ?? '—'} g`], [t('Glucides', 'Carbohydrates'), `${n.carbs ?? '—'} g`], [t('dont sucres', 'of which sugars'), `${n.sugars ?? '—'} g`], [t('Protéines', 'Protein'), `${n.protein ?? '—'} g`], [t('Sel', 'Salt'), `${n.salt ?? '—'} g`]];
      rows.forEach(([k, v]) => { page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: 320, y: y - 5 }, thickness: 0.5, color: LINE }); text(page, k, 40, y, font, 10); right(page, v.replace('.', ','), 320, y, font, 10); y -= 18; });
    }
    y -= 16; text(page, t('Conservation : à l’abri de la chaleur et de l’humidité. Respecter la chaîne du froid pour les produits frais et surgelés.', 'Storage: keep away from heat and humidity. Keep the cold chain for chilled and frozen products.'), 40, y, font, 9, MUTED);
  }
  text(page, t(`Document généré le ${new Date().toLocaleDateString('fr-FR')} · données catalogue FLS, à valider par le Service Qualité`, `Generated on ${new Date().toLocaleDateString('en-GB')} · FLS catalogue data, to be validated by Quality`), 40, 60, font, 7.5, MUTED);
  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="FLS-${p.code}${halal ? '-halal' : ''}.pdf"`, 'Cache-Control': 'public, s-maxage=3600' } });
}
