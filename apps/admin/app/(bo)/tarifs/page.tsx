import { getRepo } from '@fls/db';
import { casePriceHT, unitPriceTTC } from '@fls/core';
import { ActionForm } from '@/components/ui';
import { savePricing } from '@/lib/actions';
import { requireStaff } from '@/lib/auth';
import { money, SEGMENTS } from '@/lib/format';

export const metadata = { title: 'Tarifs & paramètres' };

export default async function Pricing() {
  await requireStaff('pricing'); const repo = await getRepo();
  const [grids, discounts, settings, sample] = await Promise.all([repo.grids(), repo.discounts(), repo.settings(), repo.product('UL-033')]);
  const d1 = discounts.find((d) => !d.pallet) ?? { minCases: 10, percent: 4 }; const d2 = discounts.find((d) => d.pallet) ?? { pallet: true, percent: 9 };
  return (
    <>
      <div className="sn-head"><div><h1>Tarifs & paramètres</h1><p>Les prix affichés aux clients sont calculés à partir du prix de base (grille CHR) × coefficient du segment, puis remises au volume.</p></div></div>
      <ActionForm action={savePricing} okMsg="Tarifs enregistrés. Les nouveaux prix s’appliquent immédiatement.">
        <div className="sn-grid sn-g2">
          <div className="sn-card sn-form"><h2>Grilles par segment</h2>
            <table className="sn-tbl"><thead><tr><th>Segment</th><th>Libellé</th><th>Coefficient</th>{sample && <th className="sn-r">Ex. {sample.code}</th>}</tr></thead><tbody>
              {(['GROSSISTE', 'DEMI_GROSSISTE', 'CHR', 'B2C'] as const).map((s) => { const g = grids.find((x) => x.segment === s); return (
                <tr key={s}><td><b>{SEGMENTS[s]}</b></td><td><input className="sn-in" name={`label_${s}`} defaultValue={g?.label ?? SEGMENTS[s]} aria-label={`Libellé ${SEGMENTS[s]}`} /></td>
                  <td><input className="sn-in sn-num" name={`coef_${s}`} type="number" step="0.01" min={0.5} max={1.5} defaultValue={g?.coefficient ?? 1} style={{ width: 90 }} aria-label={`Coefficient ${SEGMENTS[s]}`} /></td>
                  {sample && <td className="sn-r sn-num sn-mut">{s === 'B2C' ? `${money(unitPriceTTC(sample, { segment: s, coefficient: g?.coefficient ?? 1, discounts, settings }))} /u TTC` : money(casePriceHT(sample, 1, { segment: s, coefficient: g?.coefficient ?? 1, discounts, settings }))}</td>}</tr>); })}
            </tbody></table></div>
          <div className="sn-card sn-form"><h2>Remises au volume</h2>
            <div className="sn-f2"><div className="sn-fld"><label htmlFor="d1m">À partir de (cartons)</label><input className="sn-in" id="d1m" name="d1_min" type="number" min={2} defaultValue={d1.minCases ?? 10} /></div><div className="sn-fld"><label htmlFor="d1p">Remise (%)</label><input className="sn-in" id="d1p" name="d1_pct" type="number" step="0.5" min={0} max={50} defaultValue={d1.percent} /></div></div>
            <div className="sn-fld"><label htmlFor="d2p">Remise palette complète (%)</label><input className="sn-in" id="d2p" name="d2_pct" type="number" step="0.5" min={0} max={50} defaultValue={d2.percent} style={{ maxWidth: 160 }} /></div>
            <h2 style={{ marginTop: 10 }}>Livraison et TVA</h2>
            <div className="sn-f3">
              <div className="sn-fld"><label htmlFor="franco">Franco de port (F HT)</label><input className="sn-in sn-num" id="franco" name="franco" type="number" min={0} step={5000} defaultValue={settings.francoThreshold} /></div>
              <div className="sn-fld"><label htmlFor="deliv">Frais de livraison (F HT)</label><input className="sn-in sn-num" id="deliv" name="delivery" type="number" min={0} step={500} defaultValue={settings.deliveryFee} /></div>
              <div className="sn-fld"><label htmlFor="vat">TVA (%)</label><input className="sn-in sn-num" id="vat" name="vat" type="number" min={0} max={30} step={0.5} defaultValue={settings.vatRate * 100} /></div>
            </div>
          </div>
          <div className="sn-card sn-form"><h2>Vente aux particuliers (B2C)</h2><p className="sn-mut" style={{ margin: 0 }}>Désactivée, les comptes particuliers ne peuvent plus se connecter. Le prix unitaire TTC = prix de base ÷ unités par carton × coefficient de marge × (1 + TVA), arrondi à 25 F.</p>
            <label className="sn-chk" style={{ justifySelf: 'start' }}><input type="checkbox" name="b2cEnabled" defaultChecked={settings.b2cEnabled} />Activer la vente aux particuliers</label>
            <div className="sn-fld" style={{ maxWidth: 220 }}><label htmlFor="b2cm">Coefficient de marge B2C</label><input className="sn-in sn-num" id="b2cm" name="b2cMargin" type="number" step="0.01" min={1} max={3} defaultValue={settings.b2cMargin} /></div>
          </div>
        </div>
        <div className="sn-sticky"><button className="sn-btn go" type="submit">Enregistrer les tarifs</button></div>
      </ActionForm>
    </>
  );
}
