'use client';
import { useEffect, useRef, type ReactNode } from 'react';

/** Tiroir ou fenêtre modale accessible : piège du focus, Échap pour fermer, restauration du focus. */
export function Layer({ open, onClose, kind, label, children, labelledBy }: { open: boolean; onClose: () => void; kind: 'drawer' | 'modal'; label?: string; labelledBy?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<Element | null>(null);
  useEffect(() => {
    if (open) {
      last.current = document.activeElement;
      const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('input:not([type=hidden]):not([type=radio]):not(.sn-sr),textarea,select,button')?.focus(), 60);
      return () => clearTimeout(t);
    }
    if (last.current instanceof HTMLElement) last.current.focus();
  }, [open]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !ref.current) return;
    const f = [...ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([type=hidden]):not(.sn-sr),select,textarea,[tabindex="0"]')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0]!, end = f[f.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
    else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
  };
  return (
    <>
      <div className={`sn-scrim ${open ? 'sn-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={`${kind === 'drawer' ? 'sn-drawer' : 'sn-modal'} ${open ? 'sn-open' : ''}`} role="dialog" aria-modal="true" aria-label={label} aria-labelledby={labelledBy} aria-hidden={!open} onKeyDown={onKey} {...(open ? {} : ({ inert: '' } as unknown as { inert: boolean }))}>
        {open ? children : null}
      </div>
    </>
  );
}
