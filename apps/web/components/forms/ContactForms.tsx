'use client';

import { useState, useTransition } from 'react';
import { NINEA_PATTERN, RCCM_PATTERN } from '@fls/core';
import { requestAccount, submitApplication, submitLead } from '@/lib/actions';
import { CITIES } from '@/lib/content';
import { useT, useUI } from '../providers';
import { errProps, Field, FileDrop, Success, useRequired } from './Field';

const MAX = 5 * 1024 * 1024;

/** Ouverture de compte pro en trois étapes, avec NINEA/RCCM et justificatifs (modérés dans le back-office). */
export function AccountWizard() {
  const t = useT(); const ui = useUI(); const req = useRequired();
  const [step, setStep] = useState(0); const [files, setFiles] = useState<File[]>([]); const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null); const [pending, start] = useTransition();
  const steps = [t('Entreprise', 'Company'), t('Activité', 'Business'), t('Documents', 'Documents')];
  if (done !== null) return <Success title={t('Demande envoyée', 'Application sent')} text={t('Un commercial vérifie vos documents et vous appelle sous 48 heures ouvrées pour activer votre compte et votre grille tarifaire.', 'A sales rep checks your documents and calls you within 2 business days to activate your account and price grid.')} refCode={done}><div style={{ marginTop: 22 }}><button type="button" className="sn-btn sn-btn-line" onClick={() => { setDone(null); setStep(0); setFiles([]); }}>{t('Nouvelle demande', 'New application')}</button></div></Success>;
  const acts: [string, string, string][] = [['gr', t('Grossiste', 'Wholesaler'), 'GROSSISTE'], ['demi', t('Demi-grossiste', 'Semi-wholesaler'), 'DEMI_GROSSISTE'], ['su', t('Supérette / supermarché', 'Mini-market / supermarket'), 'DEMI_GROSSISTE'], ['ff', t('Fast-food / restaurant', 'Quick service / restaurant'), 'CHR'], ['caf', t('Café / hôtel', 'Café / hotel'), 'CHR'], ['gc', t('Cantine / institution', 'Canteen / institution'), 'CHR']];
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget;
    if (step === 0) { const er = req(form, ['companyName', 'contactName', 'phone', 'email'], (f) => (String(f.get('email') ?? '').trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(f.get('email'))) ? { email: t('Saisissez une adresse e-mail valide, par exemple nom@entreprise.sn.', 'Enter a valid email, e.g. name@company.sn.') } : {}) as Record<string, string>); setErrors(er); if (!Object.keys(er).length) setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    const er = req(form, ['ninea', 'rccm'], (f) => {
      const x: Record<string, string> = {};
      if (String(f.get('ninea')).trim() && !NINEA_PATTERN.test(String(f.get('ninea')).trim())) x.ninea = t('Le NINEA compte 7 à 9 chiffres, suivis du code TVA (ex. 0012345 2G3).', 'The NINEA has 7 to 9 digits followed by the VAT code (e.g. 0012345 2G3).');
      if (String(f.get('rccm')).trim() && !RCCM_PATTERN.test(String(f.get('rccm')).trim())) x.rccm = t('Format attendu : SN-DKR-2019-B-12345.', 'Expected format: SN-DKR-2019-B-12345.');
      return x;
    });
    setErrors(er); if (Object.keys(er).length) return;
    if (!files.length) { ui.toast(t('Ajoutez au moins un justificatif (NINEA ou RCCM).', 'Add at least one document (NINEA or RCCM).'), 'warn'); return; }
    if (files.some((f) => f.size > MAX)) { ui.toast(t('Chaque fichier doit faire 5 Mo au maximum.', 'Each file must be 5 MB or less.'), 'warn'); return; }
    const fd = new FormData(form); fd.delete('documents'); files.forEach((f) => fd.append('documents', f));
    const act = acts.find((a) => a[0] === fd.get('act')); fd.set('segment', act?.[2] ?? 'CHR'); fd.set('activity', act?.[1] ?? '');
    start(async () => {
      const r = await requestAccount(fd);
      if (r.ok) setDone(r.ref ?? '');
      else { setErrors(r.fields ?? {}); ui.toast(r.error, 'warn'); if (r.fields && ['companyName', 'contactName', 'phone', 'email', 'city'].some((k) => r.fields![k])) setStep(0); }
    });
  };
  return (
    <>
      <ol className="sn-wiz">{steps.map((s, i) => <li key={s} className={i < step ? 'sn-done' : i === step ? 'sn-now' : ''} aria-current={i === step ? 'step' : undefined}>{i + 1}. {s}</li>)}</ol>
      <form className="sn-form" noValidate onSubmit={onSubmit}>
        <div hidden={step !== 0} className="sn-form">
          <Field id="sn-w-co" label={t('Raison sociale', 'Company name')} error={errors.companyName}><input className="sn-in" id="sn-w-co" name="companyName" required autoComplete="organization" {...errProps('sn-w-co', errors.companyName)} /></Field>
          <div className="sn-f2">
            <Field id="sn-w-n" label={t('Nom du responsable', 'Manager’s name')} error={errors.contactName}><input className="sn-in" id="sn-w-n" name="contactName" required autoComplete="name" {...errProps('sn-w-n', errors.contactName)} /></Field>
            <Field id="sn-w-tel" label={t('Téléphone', 'Phone')} error={errors.phone}><input className="sn-in" id="sn-w-tel" name="phone" type="tel" required placeholder="77 000 00 00" autoComplete="tel" {...errProps('sn-w-tel', errors.phone)} /></Field>
          </div>
          <div className="sn-f2">
            <Field id="sn-w-mail" label="E-mail" error={errors.email}><input className="sn-in" id="sn-w-mail" name="email" type="email" required autoComplete="email" {...errProps('sn-w-mail', errors.email)} /></Field>
            <Field id="sn-w-city" label={t('Ville', 'City')}><select className="sn-in" id="sn-w-city" name="city">{CITIES.map((c) => <option key={c.n}>{c.n}</option>)}</select></Field>
          </div>
        </div>
        <div hidden={step !== 1} className="sn-form">
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend className="sn-h4">{t('Votre activité', 'Your business')}</legend>
            <div className="sn-opts">{acts.map(([v, lab], i) => <label className="sn-opt" key={v}><input type="radio" name="act" value={v} defaultChecked={i === 0} /><span>{lab}</span></label>)}</div></fieldset>
          <Field id="sn-w-vol" label={t('Achats alimentaires mensuels estimés', 'Estimated monthly food purchases')}><select className="sn-in" id="sn-w-vol" name="volume">{[t('Moins de 1 million F CFA', 'Under 1 million F CFA'), t('1 à 5 millions F CFA', '1 to 5 million F CFA'), t('5 à 20 millions F CFA', '5 to 20 million F CFA'), t('Plus de 20 millions F CFA', 'Over 20 million F CFA')].map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <div hidden={step !== 2} className="sn-form">
          <div className="sn-f2">
            <Field id="sn-w-ninea" label="NINEA" error={errors.ninea}><input className="sn-in sn-num" id="sn-w-ninea" name="ninea" required placeholder="0012345 2G3" {...errProps('sn-w-ninea', errors.ninea)} /></Field>
            <Field id="sn-w-rc" label={t('Registre du commerce (RCCM)', 'Trade register (RCCM)')} error={errors.rccm}><input className="sn-in sn-num" id="sn-w-rc" name="rccm" required placeholder="SN-DKR-2019-B-12345" {...errProps('sn-w-rc', errors.rccm)} /></Field>
          </div>
          <div className="sn-fld"><span className="sn-h4" style={{ display: 'block' }}>{t('Justificatifs', 'Supporting documents')}</span>
            <FileDrop id="sn-w-file" name="documents" accept=".pdf,image/jpeg,image/png,image/webp" multiple label={t('Déposez vos fichiers ici', 'Drop your files here')} hint={t('ou cliquez pour choisir · NINEA puis RCCM, en PDF ou photo, 5 Mo max', 'or click to choose · NINEA then RCCM, as PDF or photo, 5 MB max')} files={files} onFiles={setFiles} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
          {step > 0 ? <button type="button" className="sn-btn sn-btn-line" onClick={() => setStep((s) => s - 1)}>{t('Retour', 'Back')}</button> : <span />}
          <button className="sn-btn sn-btn-go" disabled={pending}>{pending ? t('Envoi…', 'Sending…') : step < 2 ? t('Continuer', 'Continue') : t('Envoyer ma demande', 'Send my application')}</button>
        </div>
      </form>
    </>
  );
}

export function QuoteForm({ universes }: { universes: string[] }) {
  const t = useT(); const ui = useUI(); const req = useRequired();
  const [errors, setErrors] = useState<Record<string, string>>({}); const [done, setDone] = useState<string | null>(null); const [pending, start] = useTransition();
  if (done !== null) return <Success title={t('Merci, c’est bien reçu', 'Thanks, we have it')} text={t('Un conseiller vous recontacte sous 24 heures ouvrées.', 'An adviser will contact you within one business day.')} refCode={done} />;
  return (
    <form className="sn-form" noValidate onSubmit={(e) => {
      e.preventDefault(); const form = e.currentTarget; const er = req(form, ['company', 'phone', 'message']); setErrors(er); if (Object.keys(er).length) return;
      const f = new FormData(form);
      start(async () => { const r = await submitLead({ type: 'QUOTE', company: String(f.get('company')), phone: String(f.get('phone')), message: `[${f.get('range')}] ${f.get('message')}`, payload: { range: f.get('range') } }); if (r.ok) setDone(r.ref ?? ''); else { setErrors(r.fields ?? {}); ui.toast(r.error, 'warn'); } });
    }}>
      <div className="sn-f2">
        <Field id="sn-cd-co" label={t('Entreprise', 'Company')} error={errors.company}><input className="sn-in" id="sn-cd-co" name="company" required {...errProps('sn-cd-co', errors.company)} /></Field>
        <Field id="sn-cd-tel" label={t('Téléphone', 'Phone')} error={errors.phone}><input className="sn-in" id="sn-cd-tel" name="phone" type="tel" required placeholder="77 000 00 00" {...errProps('sn-cd-tel', errors.phone)} /></Field>
      </div>
      <Field id="sn-cd-u" label={t('Univers concernés', 'Ranges concerned')}><select className="sn-in" id="sn-cd-u" name="range">{universes.map((u) => <option key={u}>{u}</option>)}<option>{t('Plusieurs univers', 'Several ranges')}</option></select></Field>
      <Field id="sn-cd-m" label={t('Produits, volumes et fréquence', 'Products, volumes and frequency')} error={errors.message}><textarea className="sn-in" id="sn-cd-m" name="message" required placeholder={t('Ex. : 2 palettes de riz brisé par mois, livraison à Kaolack', 'E.g.: 2 pallets of broken rice per month, delivered to Kaolack')} {...errProps('sn-cd-m', errors.message)} /></Field>
      <button className="sn-btn sn-btn-go" disabled={pending}>{pending ? t('Envoi…', 'Sending…') : t('Demander mon devis', 'Request my quote')}</button>
    </form>
  );
}

export function ApplicationForm() {
  const t = useT(); const ui = useUI(); const req = useRequired();
  const [errors, setErrors] = useState<Record<string, string>>({}); const [done, setDone] = useState<string | null>(null); const [cv, setCv] = useState<File[]>([]); const [pending, start] = useTransition();
  if (done !== null) return <Success title={t('Merci, c’est bien reçu', 'Thanks, we have it')} text={t('Notre équipe RH revient vers vous si votre profil correspond.', 'Our HR team will get back to you if your profile matches.')} refCode={done} />;
  return (
    <form className="sn-form" noValidate onSubmit={(e) => {
      e.preventDefault(); const form = e.currentTarget; const er = req(form, ['name', 'phone']); setErrors(er); if (Object.keys(er).length) return;
      if (cv[0] && cv[0].size > MAX) { ui.toast(t('Le CV doit faire 5 Mo au maximum.', 'The CV must be 5 MB or less.'), 'warn'); return; }
      const fd = new FormData(form); fd.delete('cv'); if (cv[0]) fd.set('cv', cv[0]);
      start(async () => { const r = await submitApplication(fd); if (r.ok) setDone(r.ref ?? ''); else { setErrors(r.fields ?? {}); ui.toast(r.error, 'warn'); } });
    }}>
      <div className="sn-f2">
        <Field id="sn-cv-n" label={t('Nom et prénom', 'Full name')} error={errors.name}><input className="sn-in" id="sn-cv-n" name="name" required autoComplete="name" {...errProps('sn-cv-n', errors.name)} /></Field>
        <Field id="sn-cv-tel" label={t('Téléphone', 'Phone')} error={errors.phone}><input className="sn-in" id="sn-cv-tel" name="phone" type="tel" required {...errProps('sn-cv-tel', errors.phone)} /></Field>
      </div>
      <Field id="sn-cv-p" label={t('Poste visé', 'Position')}><select className="sn-in" id="sn-cv-p" name="position">{[t('Commercial terrain', 'Field sales rep'), t('Préparateur de commandes', 'Order picker'), t('Chauffeur-livreur (permis C)', 'Delivery driver (C licence)'), t('Conseiller métier CHR', 'Food-service adviser'), t('Candidature spontanée', 'Open application')].map((x) => <option key={x}>{x}</option>)}</select></Field>
      <div className="sn-fld"><span className="sn-h4" style={{ display: 'block' }}>CV</span><FileDrop id="sn-cv-f" name="cv" accept=".pdf" label={t('Ajoutez votre CV', 'Add your CV')} hint={`PDF, 5 ${t('Mo', 'MB')} max`} files={cv} onFiles={setCv} /></div>
      <button className="sn-btn sn-btn-go" disabled={pending}>{pending ? t('Envoi…', 'Sending…') : t('Envoyer ma candidature', 'Send my application')}</button>
    </form>
  );
}
