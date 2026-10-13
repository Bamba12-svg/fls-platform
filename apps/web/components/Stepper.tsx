'use client';
import { useT } from './providers';

export function Stepper({ value, onChange, id, label, min = 0 }: { value: number; onChange: (n: number) => void; id: string; label: string; min?: number }) {
  const t = useT();
  return (
    <span className="sn-step">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`${t('Diminuer', 'Decrease')} ${label}`}>−</button>
      <input id={id} type="number" min={min} inputMode="numeric" value={value || ''} placeholder="0" aria-label={`${t('Quantité', 'Quantity')} ${label}`} onChange={(e) => onChange(Math.max(min, Math.floor(Number(e.target.value) || 0)))} />
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`${t('Augmenter', 'Increase')} ${label}`}>+</button>
    </span>
  );
}
