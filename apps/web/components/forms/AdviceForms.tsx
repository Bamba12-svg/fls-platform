'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { foodCostRatio } from '@fls/core';
import { submitLead } from '@/lib/actions';
import { useLocale, useMoney, useT, useUI } from '../providers';
import { errProps, Field, Success, useRequired } from './Field';

/** Calculateur de coût matière : jauge 0–60 %, cible 25–35 % du prix HT. */
export function FoodCostCalculator() {
  const t = useT(); const l = useLocale(); const { money } = useMoney();
  const [price, setPrice] = useState(3500); const [cost, setCost] = useState(1150);
  const ht = price / 1.18; const pct = foodCostRatio(price, cost) * 100; const ok = pct >= 25 && pct <= 35, hi = pct > 35;
  const nf = (n: number) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
  const ang = Math.min(1, pct / 60) * 180; const rad = ((180 - ang) * Math.PI) / 180;
  const p = (a: number) => [150 + 120 * Math.cos(((180 - a) * Math.PI) / 180), 160 - 120 * Math.sin(((180 - a) * Math.PI) / 180)] as const;
  const arc = (a0: number, a1: number, col: string) => { const [x0, y0] = p(a0), [x1, y1] = p(a1); return <path d={`M${x0} ${y0} A120 120 0 0 1 ${x1} ${y1}`} stroke={col} strokeWidth={18} fill="none" />; };
  const target = Math.round(((cost / 0.3) * 1.18) / 50) * 50;
  return (
    <div className="sn-calc">
      <div><span className="sn-eye">{t('Outil gratuit', 'Free tool')}</span><h2 className="sn-h2" style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)' }}>{t('Calculez le coût matière d’un menu', 'Work out a menu’s food cost')}</h2><p className="sn-sub">{t('En restauration rapide, on vise en général 25 à 35 % du prix de vente hors taxes.', 'In quick service, the usual target is 25 to 35 % of the pre-tax selling price.')}</p>
        <div className="sn-form" style={{ marginTop: 22 }}>
          <div className="sn-fld"><label htmlFor="sn-cp">{t('Prix de vente du menu, TTC', 'Menu selling price, incl. VAT')} : <b className="sn-num">{money(price)}</b></label><input className="sn-range" type="range" id="sn-cp" min={1000} max={10000} step={100} value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
          <div className="sn-fld"><label htmlFor="sn-cc">{t('Coût des ingrédients par menu', 'Ingredient cost per menu')} : <b className="sn-num">{money(cost)}</b></label><input className="sn-range" type="range" id="sn-cc" min={200} max={5000} step={50} value={cost} onChange={(e) => setCost(+e.target.value)} /></div>
        </div></div>
      <div>
        <div className="sn-gauge"><svg viewBox="0 0 300 180" role="img" aria-label={`${t('Coût matière', 'Food cost')} ${nf(pct)} %`}>{arc(0, 75, '#CFE4D7')}{arc(75, 105, '#006633')}{arc(105, 180, '#F3D9A4')}
          <line x1={150} y1={160} x2={150 + 105 * Math.cos(rad)} y2={160 - 105 * Math.sin(rad)} stroke="#10241A" strokeWidth={4} strokeLinecap="round" style={{ transition: 'all .3s' }} /><circle cx={150} cy={160} r={8} fill="#10241A" />
          <text x={22} y={178} fontSize={11} fill="#5B655F" fontFamily="Sora,sans-serif">0 %</text><text x={252} y={178} fontSize={11} fill="#5B655F" fontFamily="Sora,sans-serif">60 %</text></svg>
          <div className="sn-gauge-v" aria-live="polite"><b>{nf(pct)} %</b><span style={{ color: ok ? 'var(--sn-green)' : hi ? 'var(--sn-warn)' : 'var(--sn-navy)' }}>{ok ? t('Dans la cible', 'On target') : hi ? t('Au-dessus de la cible', 'Above target') : t('Sous la cible', 'Below target')}</span></div></div>
        <p style={{ textAlign: 'center', color: 'var(--sn-muted)', fontSize: '.92rem', marginTop: 14 }}>{hi ? t(`Pour revenir à 30 %, vendez ce menu ${money(target)} TTC, ou demandez à un conseiller de revoir les formats d’achat.`, `To get back to 30 %, sell this menu at ${money(target)} incl. VAT, or ask an adviser to review purchase sizes.`) : t(`Prix de vente HT : ${money(ht)}. Marge brute par menu : ${money(ht - cost)}.`, `Price excl. VAT: ${money(ht)}. Gross margin per menu: ${money(ht - cost)}.`)}</p>
      </div>
    </div>
  );
}

export function AdviceForm() {
  const t = useT(); const ui = useUI(); const { data: session } = useSession(); const req = useRequired();
  const [errors, setErrors] = useState<Record<string, string>>({}); const [done, setDone] = useState<string | null>(null); const [pending, start] = useTransition();
  if (done !== null) return <Success title={t('Merci, c’est bien reçu', 'Thanks, we have it')} text={t('Un conseiller vous recontacte sous 24 heures ouvrées.', 'An adviser will contact you within one business day.')} refCode={done} />;
  const needs = [t('Ma carte', 'My menu'), t('Mes coûts', 'My costs'), t('Mes stocks', 'My stock'), t('Mon magasin', 'My shop')];
  return (
    <form className="sn-form" noValidate onSubmit={(e) => {
      e.preventDefault(); const form = e.currentTarget; const er = req(form, ['company', 'phone']); setErrors(er); if (Object.keys(er).length) return;
      const f = new FormData(form);
      start(async () => {
        const r = await submitLead({ type: 'ADVICE', company: String(f.get('company')), phone: String(f.get('phone')), message: `${f.get('kind')} · ${f.getAll('need').join(', ')}`, payload: { kind: f.get('kind'), needs: f.getAll('need') } });
        if (r.ok) setDone(r.ref ?? ''); else { setErrors(r.fields ?? {}); ui.toast(r.error, 'warn'); }
      });
    }}>
      <Field id="sn-cs-co" label={t('Établissement', 'Business')} error={errors.company}><input className="sn-in" id="sn-cs-co" name="company" required defaultValue={session?.user.company ?? ''} {...errProps('sn-cs-co', errors.company)} /></Field>
      <div className="sn-f2">
        <Field id="sn-cs-t" label="Type"><select className="sn-in" id="sn-cs-t" name="kind">{[t('Fast-food', 'Quick service'), t('Restaurant', 'Restaurant'), t('Café / boulangerie', 'Café / bakery'), t('Supérette', 'Mini-market'), t('Cantine', 'Canteen')].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field id="sn-cs-tel" label={t('Téléphone', 'Phone')} error={errors.phone}><input className="sn-in" id="sn-cs-tel" name="phone" type="tel" required placeholder="77 000 00 00" {...errProps('sn-cs-tel', errors.phone)} /></Field>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend className="sn-h4">{t('Sur quoi voulez-vous travailler ?', 'What do you want to work on?')}</legend>
        <div className="sn-opts">{needs.map((x, i) => <label className="sn-opt" key={x}><input type="checkbox" name="need" value={x} defaultChecked={i === 0} /><span>{x}</span></label>)}</div></fieldset>
      <button className="sn-btn sn-btn-go" disabled={pending}>{pending ? t('Envoi…', 'Sending…') : t('Envoyer ma demande', 'Send my request')}</button>
    </form>
  );
}
