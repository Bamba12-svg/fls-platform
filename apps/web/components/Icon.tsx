/* Pictogrammes FLS (traits 1,75). Icônes 24 px et pictogrammes packaging 48 px. */
const IC: Record<string, string> = {
 "arrow": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
 "chev": "<path d=\"m6 9 6 6 6-6\"/>",
 "chevL": "<path d=\"m15 18-6-6 6-6\"/>",
 "chevR": "<path d=\"m9 18 6-6-6-6\"/>",
 "phone": "<path d=\"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2\"/>",
 "pin": "<path d=\"M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z\"/><circle cx=\"12\" cy=\"9\" r=\"2.5\"/>",
 "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>",
 "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>",
 "cart": "<path d=\"M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6\"/><circle cx=\"10\" cy=\"20\" r=\"1.3\"/><circle cx=\"17\" cy=\"20\" r=\"1.3\"/>",
 "plus": "<path d=\"M12 5v14M5 12h14\"/>",
 "check": "<path d=\"m5 12.5 4.5 4.5L19 7\"/>",
 "close": "<path d=\"M6 6l12 12M18 6 6 18\"/>",
 "truck": "<path d=\"M3 6h11v10H3zM14 9h4l3 3v4h-7\"/><circle cx=\"7\" cy=\"17.5\" r=\"1.8\"/><circle cx=\"17.5\" cy=\"17.5\" r=\"1.8\"/>",
 "shield": "<path d=\"M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6Z\"/><path d=\"m9 12 2 2 4-4\"/>",
 "headset": "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"/><rect x=\"3\" y=\"14\" width=\"4\" height=\"6\" rx=\"1.5\"/><rect x=\"17\" y=\"14\" width=\"4\" height=\"6\" rx=\"1.5\"/><path d=\"M19 20a3 3 0 0 1-3 2h-3\"/>",
 "store": "<path d=\"M4 9.5 5.5 4h13L20 9.5M4 9.5V20h16V9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0\"/><path d=\"M10 20v-5h4v5\"/>",
 "leaf": "<path d=\"M5 19c0-8 5-13 14-14 0 9-5 14-13 14\"/><path d=\"M5 19 13 11\"/>",
 "box": "<path d=\"M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z\"/><path d=\"M3.5 7.5 12 12l8.5-4.5M12 12v9\"/>",
 "pallet": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"10\" rx=\"1\"/><path d=\"M12 4v10M5 9h14M3 17h18M5 17v3M12 17v3M19 17v3\"/>",
 "pdf": "<path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z\"/><path d=\"M14 3v5h5M8.5 15.5h7M8.5 12h4\"/>",
 "upload": "<path d=\"M12 16V4M7 9l5-5 5 5\"/><path d=\"M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3\"/>",
 "lock": "<rect x=\"4.5\" y=\"10.5\" width=\"15\" height=\"10\" rx=\"2\"/><path d=\"M8 10.5V7a4 4 0 0 1 8 0v3.5\"/>",
 "snow": "<path d=\"M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7\"/><path d=\"m9 4 3 2 3-2M9 20l3-2 3 2\"/>",
 "menu": "<path d=\"M4 7h16M4 12h16M4 17h10\"/>",
 "home": "<path d=\"M4 10.5 12 4l8 6.5V20H4Z\"/><path d=\"M10 20v-6h4v6\"/>",
 "grid": "<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/>",
 "bolt": "<path d=\"M13 3 5 13.5h6L10 21l8-10.5h-6Z\"/>",
 "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>",
 "globe": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z\"/>",
 "mail": "<rect x=\"3.5\" y=\"5.5\" width=\"17\" height=\"13\" rx=\"2\"/><path d=\"m4 7 8 6 8-6\"/>",
 "chef": "<path d=\"M7 14v6h10v-6M7 14a4 4 0 0 1-1.2-7.8A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 6.2 2.2A4 4 0 0 1 17 14Z\"/><path d=\"M7 17h10\"/>",
 "warn": "<path d=\"M12 4 2.8 19.5h18.4Z\"/><path d=\"M12 10v4M12 17h.01\"/>",
 "repeat": "<path d=\"M4 11V9a3 3 0 0 1 3-3h12M16 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H5M8 21l-3-3 3-3\"/>",
 "chart": "<path d=\"M4 20V4M4 20h16\"/><path d=\"m7 15 4-4 3 3 5-6\"/>",
 "coins": "<ellipse cx=\"9\" cy=\"7\" rx=\"5\" ry=\"2.5\"/><path d=\"M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7\"/><path d=\"M10 15.4c.9.4 2 .6 3 .6 2.8 0 5-1.1 5-2.5v-4M14 10.4c2.4.2 4-.8 4-1.9\"/><path d=\"M4 11v4c0 1.4 2.2 2.5 5 2.5\"/>",
 "card": "<rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M3 10h18M7 15h3\"/>",
 "doc": "<path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z\"/><path d=\"M14 3v5h5M9 13h6M9 17h4\"/>",
 "team": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20a6.5 6.5 0 0 1 13 0\"/><circle cx=\"17\" cy=\"9\" r=\"2.5\"/><path d=\"M16 14a5 5 0 0 1 5.5 5\"/>",
 "thermo": "<path d=\"M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z\"/><path d=\"M12 11v6\"/>",
 "qr": "<rect x=\"4\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"14\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"4\" y=\"14\" width=\"6\" height=\"6\" rx=\"1\"/><path d=\"M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2\"/>",
 "building": "<path d=\"M4 21V5l8-2v18M12 8h8v13M4 21h17\"/><path d=\"M7.5 8h1M7.5 12h1M7.5 16h1M15.5 12h1M15.5 16h1\"/>",
 "spark": "<path d=\"M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18\"/>",
 "filter": "<path d=\"M4 5h16l-6 7.5V19l-4 2v-8.5Z\"/>",
 "play": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m10 8.5 5 3.5-5 3.5Z\"/>",
 "euro": "<path d=\"M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9\"/>"
};
const PK: Record<string, string> = {
 "can": "<rect x=\"15\" y=\"8\" width=\"18\" height=\"32\" rx=\"4\"/><path d=\"M15 13h18M15 35h18M20 8.5V6h8v2.5\"/><path d=\"M19 20h10v8H19z\" stroke-dasharray=\"2 2\"/>",
 "bottle": "<path d=\"M21 4h6v6l3 5v26a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V15l3-5Z\"/><path d=\"M18 22h12v10H18z\"/>",
 "juice": "<path d=\"M14 12 18 6h12l4 6v28a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2Z\"/><path d=\"M14 12h20\"/><circle cx=\"24\" cy=\"27\" r=\"6\"/><path d=\"M24 21v12M18 27h12\"/>",
 "water": "<path d=\"M21 3h6v4h-6zM19 7h10l2 6v27a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4V13Z\"/><path d=\"M17 20c2.3 1.3 4.7 1.3 7 0s4.7-1.3 7 0M17 28c2.3 1.3 4.7 1.3 7 0s4.7-1.3 7 0\"/>",
 "oil": "<path d=\"M14 14h20a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2Z\"/><path d=\"M18 14V9h7v5M28 9h6v5\"/><path d=\"M24 22c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8Z\"/>",
 "sack": "<path d=\"M15 8h18l-2 5c4 3 6 9 6 17 0 7-4 11-13 11S11 37 11 30c0-8 2-14 6-17Z\"/><path d=\"M17 13h14\"/><path d=\"M19 27h10M19 32h10\" />",
 "pasta": "<rect x=\"10\" y=\"12\" width=\"28\" height=\"26\" rx=\"2\"/><path d=\"M10 18h28\"/><path d=\"M16 25c2-2 4 2 6 0s4 2 6 0 4 2 6 0M16 31c2-2 4 2 6 0s4 2 6 0 4 2 6 0\"/>",
 "tin": "<ellipse cx=\"24\" cy=\"14\" rx=\"13\" ry=\"4\"/><path d=\"M11 14v20c0 2.2 5.8 4 13 4s13-1.8 13-4V14\"/><path d=\"M11 21c0 2.2 5.8 4 13 4s13-1.8 13-4\"/>",
 "fish": "<path d=\"M6 24c6-8 16-10 26-4l8-5v18l-8-5C22 34 12 32 6 24Z\"/><circle cx=\"14\" cy=\"22.5\" r=\"1.4\"/><path d=\"M22 18c1.5 4 1.5 8 0 12\"/>",
 "jar": "<path d=\"M16 6h16v6H16z\"/><path d=\"M14 12h20a2 2 0 0 1 2 2v24a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V14a2 2 0 0 1 2-2Z\"/><path d=\"M12 22h24v10H12\"/>",
 "cheese": "<path d=\"M6 32 26 10l16 8v14Z\"/><path d=\"M6 32h36v6H6z\"/><circle cx=\"20\" cy=\"26\" r=\"2\"/><circle cx=\"31\" cy=\"23\" r=\"1.5\"/><circle cx=\"33\" cy=\"30\" r=\"2\"/>",
 "yog": "<path d=\"M12 14h24l-3 26a2 2 0 0 1-2 2H17a2 2 0 0 1-2-2Z\"/><path d=\"M10 10h28v4H10z\"/><path d=\"M14 24h20\"/>",
 "butter": "<path d=\"M6 22 18 14h24v12L30 34H6Z\"/><path d=\"M6 22h24v12M30 22l12-8\"/>",
 "meat": "<path d=\"M30 8c6 0 10 5 10 11 0 9-9 17-18 17-6 0-10-4-10-9 0-4 3-6 3-10 0-5 6-9 15-9Z\"/><circle cx=\"29\" cy=\"19\" r=\"4\"/><path d=\"M14 33 8 39M11 36l-3-1\"/>",
 "fries": "<path d=\"M12 22h24l-3 20H15Z\"/><path d=\"M16 22 14 8M21 22 20 5M26 22l1-16M31 22l3-13\"/><path d=\"M15 30c3 2 15 2 18 0\"/>",
 "shrimp": "<path d=\"M36 12c-10-2-22 4-22 15 0 6 4 11 10 11 4 0 6-3 6-6\"/><path d=\"M36 12c2 4 0 8-4 9M24 17c3 1 5 3 6 6M18 22c3 0 6 2 7 5\"/><path d=\"M30 32l6 4M28 36l4 6\"/>",
 "carton": "<path d=\"M6 16 24 8l18 8v18l-18 8-18-8Z\"/><path d=\"M6 16l18 8 18-8M24 24v18M15 12l18 8\"/>",
 "cup": "<path d=\"M13 12h22l-3 30H16Z\"/><path d=\"M11 8h26v4H11z\"/><path d=\"M14 22h20\"/>",
 "bag": "<path d=\"M10 16h28l-2 26H12Z\"/><path d=\"M18 16v-4a6 6 0 0 1 12 0v4\"/>",
 "cube": "<path d=\"M10 16 24 9l14 7v16l-14 7-14-7Z\"/><path d=\"M10 16l14 7 14-7M24 23v16\"/><path d=\"M17 12.5l14 7\"/>",
 "sirup": "<path d=\"M20 4h8v7l4 4v26a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V15l4-4Z\"/><path d=\"M16 24h16v10H16z\"/><path d=\"M22 28c1 1.5 3 1.5 4 0\"/>"
};

export type IconName = keyof typeof IC | string;

export function Icon({ name, className, size }: { name: IconName; className?: string; size?: number }) {
  const pack = !IC[name] && PK[name];
  const d = IC[name] ?? PK[name] ?? '';
  const vb = pack ? 48 : 24;
  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: d }} />
  );
}
