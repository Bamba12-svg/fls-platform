/**
 * Nettoyage du HTML saisi dans l'éditeur de blocs : liste blanche de balises, seul l'attribut href
 * (http, https, mailto, chemins relatifs) est conservé. Supprime scripts, styles, gestionnaires d'événements.
 */
const ALLOWED = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'blockquote']);
export function sanitizeHtml(input: string): string {
  let s = String(input ?? '').slice(0, 50000);
  s = s.replace(/<(script|style|iframe|object|embed|svg|math|template)[\s\S]*?<\/\1\s*>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (m, tag: string, attrs: string) => {
    const t = tag.toLowerCase(); if (!ALLOWED.has(t)) return '';
    if (m.startsWith('</')) return `</${t}>`;
    if (t === 'a') {
      const href = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i); const v = (href?.[2] ?? href?.[3] ?? '').trim();
      const safe = /^(https?:\/\/|mailto:|\/(?!\/))/i.test(v) ? v.replace(/"/g, '&quot;') : '';
      return safe ? `<a href="${safe}"${/^https?:/i.test(safe) ? ' target="_blank" rel="noopener"' : ''}>` : '<a>';
    }
    return t === 'br' ? '<br>' : `<${t}>`;
  });
  return s;
}
