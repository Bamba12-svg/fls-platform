'use client';

import { useState, useTransition } from 'react';
import { subscribeNewsletter } from '@/lib/actions';
import { useT, useUI } from '../providers';

export function NewsletterForm() {
  const t = useT(); const ui = useUI(); const [email, setEmail] = useState(''); const [pending, start] = useTransition();
  return (
    <form className="sn-nl" onSubmit={(e) => { e.preventDefault(); start(async () => {
      const r = await subscribeNewsletter(email);
      if (!r.ok) return ui.toast(t('Saisissez une adresse e-mail valide.', 'Enter a valid email address.'), 'warn');
      setEmail(''); ui.toast(t('Inscription enregistrée. Première lettre lundi prochain.', 'Subscribed. First newsletter next Monday.'), 'mail');
    }); }}>
      <label className="sn-sr" htmlFor="sn-nl-mail">{t('Adresse e-mail', 'Email address')}</label>
      <input id="sn-nl-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('votre@entreprise.sn', 'you@company.sn')} autoComplete="email" />
      <button className="sn-btn sn-btn-go sn-btn-sm" disabled={pending}>{t('S’abonner', 'Subscribe')}</button>
    </form>
  );
}
