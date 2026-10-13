import { NextResponse } from 'next/server';
import { rgb } from 'pdf-lib';
import { getRepo } from '@fls/db';
import { GREEN, LINE, MUTED, NAVY, newDoc, pdfMoney, right, text } from '@/lib/pdf';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Facture PDF : accessible uniquement au client propriétaire de la commande. */
export async function GET(req: Request, { params }: { params: { ref: string } }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const repo = await getRepo();
  const [orders, me] = await Promise.all([repo.orders(session.user.id), repo.customer(session.user.id)]);
  const o = orders.find((x) => x.invoice?.ref === params.ref);
  if (!o || !o.invoice || !me) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const en = new URL(req.url).searchParams.get('lang') === 'en'; const t = (fr: string, e: string) => (en ? e : fr);
  const d = (iso: string) => new Date(iso).toLocaleDateString(en ? 'en-GB' : 'fr-FR');
  const { doc, page, font, bold } = await newDoc(`${t('Facture', 'Invoice')} ${o.invoice.ref}`);
  text(page, t('FACTURE', 'INVOICE'), 40, 730, bold, 20, NAVY);
  text(page, o.invoice.ref, 40, 712, bold, 11);
  text(page, `${t('Date', 'Date')} : ${d(o.createdAt)}   ·   ${t('Échéance', 'Due')} : ${d(o.invoice.dueDate)}   ·   ${t('Commande', 'Order')} : ${o.ref}`, 40, 696, font, 9, MUTED);
  text(page, t('Facturé à', 'Billed to'), 360, 730, bold, 9, MUTED);
  [me.companyName, me.contactName, me.city, me.ninea ? `NINEA ${me.ninea}` : '', me.rccm ? `RCCM ${me.rccm}` : ''].filter(Boolean).forEach((s, i) => text(page, s, 360, 716 - i * 13, i === 0 ? bold : font, i === 0 ? 10 : 9));
  let y = 630;
  page.drawRectangle({ x: 40, y: y - 6, width: 515, height: 22, color: NAVY });
  const head: [string, number, boolean][] = [[t('Code', 'Code'), 48, false], [t('Désignation', 'Description'), 110, false], [t('Qté', 'Qty'), 380, true], [t('PU HT', 'Unit excl.'), 465, true], [t('Total HT', 'Total excl.'), 548, true]];
  head.forEach(([s, x, r]) => { const w = bold.widthOfTextAtSize(s, 9); page.drawText(s, { x: r ? x - w : x, y, size: 9, font: bold, color: rgb(1, 1, 1) }); });
  y -= 24;
  o.lines.forEach((ln, i) => {
    if (i % 2) page.drawRectangle({ x: 40, y: y - 5, width: 515, height: 18, color: rgb(0.96, 0.97, 0.96) });
    text(page, ln.code, 48, y, font, 9); text(page, ln.name.slice(0, 52), 110, y, font, 9);
    right(page, String(ln.qty), 380, y, font, 9); right(page, pdfMoney(ln.unitPrice), 465, y, font, 9); right(page, pdfMoney(ln.total), 548, y, font, 9);
    y -= 18;
  });
  page.drawLine({ start: { x: 40, y: y + 6 }, end: { x: 555, y: y + 6 }, thickness: 1, color: LINE });
  y -= 14;
  const rows: [string, number, boolean][] = [[t('Sous-total HT', 'Subtotal excl. VAT'), o.subtotal, false], [t('Livraison', 'Delivery'), o.shipping, false], [t('TVA 18 %', 'VAT 18 %'), o.vat, false], [t('Total TTC', 'Total incl. VAT'), o.total, true]];
  rows.forEach(([k, v, b]) => { text(page, k, 360, y, b ? bold : font, b ? 11 : 9.5); right(page, pdfMoney(v), 548, y, b ? bold : font, b ? 11 : 9.5); y -= b ? 20 : 15; });
  text(page, o.invoice.paidAt ? `${t('Réglée le', 'Paid on')} ${d(o.invoice.paidAt)}` : t('À régler par virement, Wave ou Orange Money avant l’échéance.', 'Payable by transfer, Wave or Orange Money before the due date.'), 40, 90, font, 9, o.invoice.paidAt ? GREEN : MUTED);
  text(page, t('FLS · SARL au capital de … · NINEA … · RCCM … (mentions légales à compléter par la Direction financière)', 'FLS · legal details to be completed by the finance department'), 40, 60, font, 7.5, MUTED);
  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${o.invoice.ref}.pdf"`, 'Cache-Control': 'private, no-store' } });
}
