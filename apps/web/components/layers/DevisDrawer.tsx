'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { submitLead } from '@/lib/actions';
import { CITIES } from '@/lib/content';
import { Icon } from '../Icon';
import { useT, useUI } from '../providers';
import { Layer } from './Layer';

const TYPE_MAP = { appro: 'QUOTE', cles: 'TURNKEY', conseil: 'ADVICE', gc: 'KEY_ACCOUNT' } as const;

/** Tiroir global de demande de devis : enregistré dans « Contacts & devis » du back-office. */
export function DevisDrawer() {
  const t = useT(); const ui = useUI(); const { data: session } = useSession();
  const open = ui.layer === 'devis';
  const [type, setType] = useState(ui.devis.type); const [done, setDone] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [pending, start] = useTransition();
  useEffect(() => { if (open) { setType(ui.devis.type); setDone(null); setErrors({}); } }, [open, ui.devis.type]);
  const types: [keyof typeof TYPE_MAP, string, string][] = [
    ['appro', t('Approvisionnement en volume', 'Bulk supply'), t('Palettes, contrats annuels', 'Pallets, annual contracts')],
    ['cles', t('Supérette clés en main', 'Turnkey mini-market'), t('Aménagement + stock initial', 'Fit-out + opening stock')],
    ['conseil', t('Accompagnement métier', 'Business support'), t('Carte, coûts, stocks', 'Menu, costs, stock')],
    ['gc', t('Grand compte', 'Key account'), t('Cantines, centrales d’achat', 'Canteens, buying groups')],
  ];
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const req: Record<string, string> = {};
    for (const k of ['company', 'name', 'phone']) if (!String(f.get(k) ?? '').trim()) req[k] = t('Ce champ est obligatoire.', 'This field is required.');
    setErrors(req); if (Object.keys(req).length) { (e.currentTarget.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return; }
    start(async () => {
      const r = await submitLead({ type: TYPE_MAP[type as keyof typeof TYPE_MAP] ?? 'QUOTE', company: String(f.get('company')), name: String(f.get('name')), phone: String(f.get('phone')), city: String(f.get('city')), message: String(f.get('message') ?? '') });
      if (r.ok) setDone(r.ref ?? ''); else { setErrors(r.fields ?? {}); ui.toast(r.error, 'warn'); }
    });
  };
  const err = (k: string) => errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `sn-dv-${k}-e` } : {};
  const msg = (k: string) => errors[k] ? <span className="sn-errm" id={`sn-dv-${k}-e`}>{errors[k]}</span> : null;
  return (
    <Layer open={open} onClose={ui.close} kind="drawer" labelledBy="sn-devis-t">
      <div className="sn-drawer-h"><div><h2 id="sn-devis-t">{t('Demande de devis', 'Quote request')}</h2><p>{t('Réponse d’un commercial sous 24 h ouvrées.', 'A sales rep replies within 1 business day.')}</p></div><button className="sn-close" type="button" onClick={ui.close} aria-label={t('Fermer', 'Close')}><Icon name="close" /></button></div>
      {done !== null ? (
        <>
          <div className="sn-drawer-b"><div className="sn-ok-panel"><div className="sn-ok-ic"><Icon name="check" /></div><h3>{t('Demande envoyée', 'Request sent')}</h3><p>{t('Un commercial vous appelle sous 24 heures ouvrées.', 'A sales rep will call you within one business day.')}</p><span className="sn-ref">{done}</span></div></div>
          <div className="sn-drawer-f"><button className="sn-btn sn-btn-nv sn-btn-block" type="button" onClick={ui.close}>{t('Fermer', 'Close')}</button></div>
        </>
      ) : (
        <>
          <form className="sn-drawer-b sn-form" id="sn-devis-form" noValidate onSubmit={submit}>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend className="sn-h4">{t('Votre besoin', 'Your need')}</legend>
              <div className="sn-opts" style={{ gridTemplateColumns: '1fr 1fr' }}>{types.map(([v, lab, s]) => <label className="sn-opt" key={v}><input type="radio" name="type" value={v} checked={type === v} onChange={() => setType(v)} /><span>{lab}<small>{s}</small></span></label>)}</div></fieldset>
            <div className="sn-fld"><label htmlFor="sn-dv-co">{t('Entreprise', 'Company')}</label><input className="sn-in" id="sn-dv-co" name="company" required autoComplete="organization" defaultValue={session?.user.company ?? ''} {...err('company')} />{msg('company')}</div>
            <div className="sn-f2">
              <div className="sn-fld"><label htmlFor="sn-dv-n">{t('Nom et prénom', 'Full name')}</label><input className="sn-in" id="sn-dv-n" name="name" required autoComplete="name" defaultValue={session?.user.name ?? ''} {...err('name')} />{msg('name')}</div>
              <div className="sn-fld"><label htmlFor="sn-dv-tel">{t('Téléphone', 'Phone')}</label><input className="sn-in" id="sn-dv-tel" name="phone" required type="tel" autoComplete="tel" placeholder="77 000 00 00" inputMode="tel" {...err('phone')} />{msg('phone')}</div>
            </div>
            <div className="sn-fld"><label htmlFor="sn-dv-city">{t('Ville de livraison', 'Delivery city')}</label><select className="sn-in" id="sn-dv-city" name="city">{CITIES.map((c) => <option key={c.n}>{c.n}</option>)}</select></div>
            <div className="sn-fld"><label htmlFor="sn-dv-msg">{t('Produits et volumes', 'Products and volumes')} <small>({t('facultatif', 'optional')})</small></label><textarea className="sn-in" id="sn-dv-msg" name="message" defaultValue={ui.devis.note} placeholder={t('Ex. : 40 cartons UL-033 par mois, 10 sacs de riz brisé…', 'E.g.: 40 cases of UL-033 per month, 10 bags of broken rice…')} /></div>
          </form>
          <div className="sn-drawer-f"><button className="sn-btn sn-btn-go sn-btn-block" type="submit" form="sn-devis-form" disabled={pending}>{pending ? t('Envoi…', 'Sending…') : t('Envoyer la demande', 'Send request')}</button></div>
        </>
      )}
    </Layer>
  );
}
