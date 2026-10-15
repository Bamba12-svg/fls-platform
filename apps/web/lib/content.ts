/** Contenus éditoriaux fixes du site (textes validés sur le prototype). Les contenus gérés par le back-office viennent de la base. */
import type { Segment } from '@fls/core';
type L = { fr: string; en: string };
const l = (fr: string, en: string): L => ({ fr, en });

export const img = (name: string) => `/img/${({ 'n-arrivage': 'u-boissons', 'n-portail': 'u-superette' } as Record<string, string>)[name] ?? name}.webp`;

export const ALT: Record<string, L> = {
  dakar: l('Point de vente FLS', 'FLS point of sale'),
  hero: l('Bâtiment de la supérette clés en main de l’Armée', 'Turnkey mini-market building for the Armed Forces'),
  entrepot: l('Dépôt FLS et camion conteneur', 'FLS depot with a container truck'),
  'u-boissons': l('Jus Maria en canette distribués par FLS', 'Maria canned juices distributed by FLS'),
  'u-epicerie': l('Rayons d’épicerie approvisionnés par FLS', 'Grocery shelves stocked by FLS'),
  'u-frais': l('Espace produits FLS au salon FIDAK', 'FLS product space at the FIDAK fair'),
  'u-surgeles': l('Espace FLS au salon FIDAK', 'FLS space at the FIDAK fair'),
  'u-conserves': l('Maïs doux Maria en conserve', 'Maria canned sweet corn'),
  'u-superette': l('Supérette clés en main de l’Armée sénégalaise', 'Turnkey mini-market for the Senegalese Armed Forces'),
  'u-conseil': l('Conseiller FLS en tenue avec un client', 'FLS adviser in uniform with a client'),
  'n-camion': l('Camions de livraison aux couleurs de FLS', 'Delivery trucks in FLS livery'),
  'n-fidak': l('Stand FLS au salon FIDAK', 'FLS stand at the FIDAK trade fair'),
  'n-lancement': l('Équipes FLS lors de la cérémonie de lancement', 'FLS teams at the launch ceremony'),
  'n-armee': l('Inauguration des supérettes clés en main de l’Armée sénégalaise', 'Opening of the turnkey mini-markets for the Senegalese Armed Forces'),
  'hero-1': l('Moutarde Maria et grillades', 'Maria mustard with grilled meat'),
  'f-sup-rayons': l('Rayons d’une supérette clés en main approvisionnée par FLS', 'Shelves of a turnkey mini-market stocked by FLS'),
  'f-maria-cuisine': l('La gamme Maria présentée en cuisine', 'The Maria range in the kitchen'),
  'f-maria-jus': l('Gamme de jus Maria avec morceaux de fruits', 'Maria juices with fruit pieces'),
  'f-lancement': l('Équipes FLS lors du lancement', 'FLS teams at the launch'),
  'f-fidak': l('Stand FLS au salon FIDAK', 'FLS stand at the FIDAK fair'),
  'maria-1': l('Gamme Maria', 'Maria range'),
};
export const alt = (loc: 'fr' | 'en', name: string) => ALT[name]?.[loc] ?? '';

export const CITIES: { n: string; lat: number; lon: number; f: L; hub?: boolean }[] = [
  { n: 'Dakar', lat: 14.69, lon: -17.44, f: l('Livraison quotidienne · 24 h', 'Daily delivery · 24 h'), hub: true },
  { n: 'Thiès', lat: 14.79, lon: -16.93, f: l('6 tournées / semaine · 24–48 h', '6 runs / week · 24–48 h') },
  { n: 'Mbour', lat: 14.42, lon: -16.96, f: l('5 tournées / semaine · 24–48 h', '5 runs / week · 24–48 h') },
  { n: 'Touba', lat: 14.85, lon: -15.88, f: l('4 tournées / semaine · 48 h', '4 runs / week · 48 h') },
  { n: 'Kaolack', lat: 14.15, lon: -16.07, f: l('4 tournées / semaine · 48 h', '4 runs / week · 48 h') },
  { n: 'Louga', lat: 15.62, lon: -16.22, f: l('2 tournées / semaine · 48 h', '2 runs / week · 48 h') },
  { n: 'Saint-Louis', lat: 16.03, lon: -16.49, f: l('3 tournées / semaine · 48 h', '3 runs / week · 48 h') },
  { n: 'Fatick', lat: 14.34, lon: -16.41, f: l('2 tournées / semaine · 48 h', '2 runs / week · 48 h') },
  { n: 'Diourbel', lat: 14.66, lon: -16.23, f: l('3 tournées / semaine · 48 h', '3 runs / week · 48 h') },
  { n: 'Tambacounda', lat: 13.77, lon: -13.67, f: l('1 tournée / semaine · 72 h', '1 run / week · 72 h') },
  { n: 'Ziguinchor', lat: 12.56, lon: -16.27, f: l('1 tournée / semaine · 72 h', '1 run / week · 72 h') },
  { n: 'Kolda', lat: 12.89, lon: -14.94, f: l('Sur commande · 72 h', 'On order · 72 h') },
  { n: 'Matam', lat: 15.66, lon: -13.25, f: l('Sur commande · 72 h', 'On order · 72 h') },
];

export const PILLARS = [
  { ic: 'shield', t: l('Approvisionnement direct et traçable', 'Direct, traceable sourcing'), d: l('Achats auprès des marques partenaires, numéro de lot suivi de l’entrepôt à votre livraison.', 'Bought from partner brands, batch numbers tracked from warehouse to delivery.') },
  { ic: 'truck', t: l('Chaîne logistique fiable', 'Reliable supply chain'), d: l('Stock en temps réel, camions à température dirigée et créneaux de livraison tenus.', 'Live stock, temperature-controlled trucks and delivery slots kept.') },
  { ic: 'headset', t: l('Conseil permanent aux pros', 'Ongoing advice for pros'), d: l('Un conseiller dédié pour vos cartes, vos coûts matière et vos rotations de stock.', 'A dedicated adviser for your menus, food costs and stock rotation.') },
  { ic: 'store', t: l('Points de vente clés en main', 'Turnkey points of sale'), d: l('Conception, aménagement et premier stock de supérettes pour promoteurs et institutionnels.', 'Design, fit-out and opening stock of mini-markets for developers and institutions.') },
];

export const SLIDES = [
  { img: 'f-sup-rayons', ic: 'store', l: l('Supérettes', 'Mini-markets') },
  { img: 'hero-1', ic: 'jar', l: l('Sauces Maria', 'Maria sauces') },
  { img: 'f-lancement', ic: 'team', l: l('Nos équipes', 'Our teams') },
  { img: 'f-maria-cuisine', ic: 'jar', l: l('Gamme Maria', 'Maria range') },
  { img: 'n-fidak', ic: 'store', l: l('FIDAK', 'FIDAK') },
];

export const MARIA = [
  ['maria-1', l('Moutarde', 'Mustard')], ['maria-2', l('Olives vertes', 'Green olives')], ['maria-3', l('Petits pois', 'Peas')], ['maria-4', l('Macédoine', 'Mixed vegetables')],
  ['maria-5', l('Haricots blancs', 'White beans')], ['maria-6', l('Ananas', 'Pineapple')], ['maria-7', l('Maïs doux', 'Sweet corn')], ['maria-8', l('Ketchup', 'Ketchup')],
] as const;

export const TIMELINE = [
  { y: l('Juil. 2022', 'Jul 2022'), t: l('Supérettes pour l’Armée sénégalaise', 'Mini-markets for the Armed Forces'), d: l('Première grande référence clés en main : des supérettes conçues, aménagées et approvisionnées pour l’Armée sénégalaise.', 'First major turnkey reference: mini-markets designed, fitted out and stocked for the Senegalese Armed Forces.'), img: 'n-armee', ic: 'store' },
  { y: l('Août 2022', 'Aug 2022'), t: l('Lancement officiel de FLS', 'Official launch of FLS'), d: l('Cérémonie de lancement de Fournisseur Libre Service, filiale du Groupe COSEMAD, au dépôt de la Médina.', 'Launch ceremony of Fournisseur Libre Service, a COSEMAD Group company, at the Médina depot.'), img: 'n-lancement', ic: 'building' },
  { y: l('2022', '2022'), t: l('Premier salon FIDAK', 'First FIDAK fair'), d: l('FLS présente ses gammes à la Foire internationale de Dakar.', 'FLS presents its ranges at the Dakar International Fair.'), img: 'n-fidak', ic: 'team' },
  { y: l('2023', '2023'), t: l('Marques partenaires', 'Partner brands'), d: l('Uludag, Enjoy et la marque exclusive Maria rejoignent le catalogue distribué aux grossistes et demi-grossistes.', 'Uludag, Enjoy and the exclusive Maria brand join the range distributed to wholesalers and semi-wholesalers.'), img: 'maria-1', ic: 'can' },
  { y: l('2025', '2025'), t: l('Réseau national', 'National network'), d: l('Tournées régulières vers les grandes villes de l’intérieur.', 'Regular runs to the main inland cities.'), img: 'n-camion', ic: 'truck' },
  { y: l('2026', '2026'), t: l('Portail de commande pro', 'Pro ordering portal'), d: l('Commande 24 h/24, grilles tarifaires par profil et espace client sécurisé.', '24/7 ordering, price grids by profile and a secure client area.'), img: 'u-conseil', ic: 'bolt' },
];

export const NEWS_CATS: Record<string, L> = {
  gammes: l('Nouvelles gammes', 'New ranges'), salons: l('Salons & événements', 'Trade fairs & events'), arrivages: l('Arrivages', 'New arrivals'),
  societe: l('Vie de l’entreprise', 'Company news'), conseil: l('Conseils métier', 'Business tips'),
};

export const ALLERGENS: Record<string, L> = {
  gluten: l('Gluten', 'Gluten'), lait: l('Lait', 'Milk'), oeuf: l('Œuf', 'Egg'), poisson: l('Poisson', 'Fish'), crustaces: l('Crustacés', 'Crustaceans'),
  moutarde: l('Moutarde', 'Mustard'), celeri: l('Céleri', 'Celery'), soja: l('Soja', 'Soy'), arachide: l('Arachide', 'Peanut'),
};

export type SectorKey = 'gr' | 'su' | 'ff' | 're';
export const SECTOR_PICKS: Record<SectorKey, { t: L; codes: string[] }> = {
  ff: { t: l('Pour votre fast-food', 'For your quick-service restaurant'), codes: ['HU-T20', 'SG-F09', 'EM-B500', 'CO-MY5', 'FR-CH1', 'SG-NG1'] },
  su: { t: l('Pour votre supérette', 'For your mini-market'), codes: ['UL-033', 'CO-TC07', 'LA-P400', 'PA-SP5', 'SU-PO50', 'EA-150'] },
  gr: { t: l('Les incontournables du gros', 'Wholesale essentials'), codes: ['RZ-BR50', 'SU-PO50', 'FA-T55', 'HU-T05', 'CO-SA12', 'CO-BC4'] },
  re: { t: l('Pour votre restaurant', 'For your restaurant'), codes: ['RZ-BR50', 'HU-T05', 'CO-TC22', 'SG-TH10', 'FR-CR1', 'SG-CP10'] },
};
export const sectorOf = (s: Segment | null | undefined): SectorKey => (s === 'GROSSISTE' ? 'gr' : s === 'CHR' ? 'ff' : 'su');

export const SEGMENT_LABEL: Record<Segment, L> = {
  GROSSISTE: l('Grossiste', 'Wholesaler'), DEMI_GROSSISTE: l('Demi-grossiste', 'Semi-wholesaler'), CHR: l('Restauration (CHR)', 'Food service'), B2C: l('Particulier', 'Consumer'),
};

/** Gamme Maria telle que présentée dans la brochure FLS (juillet 2026) : 5 catégories, visuels détourés de la brochure. */
export type MariaItem = { img: string; name: L; code: string; universe: string; slug: string };
const mi = (img: string, fr: string, en: string, code: string, universe: string, slug: string): MariaItem => ({ img: `/img/maria/${img}.webp`, name: l(fr, en), code, universe, slug });
export const MARIA_RANGE: { key: string; name: L; photo: string; href: string; items: MariaItem[] }[] = [
  { key: 'legumes', photo: '/img/maria/l-haricots.webp', href: 'univers/conserves?famille=legumes', name: l('Conserves de légumes', 'Canned vegetables'), items: [
    mi('petits-pois', 'Petits pois fins', 'Fine peas', 'CO-PP8', 'conserves', 'petits-pois-maria-4-4'),
    mi('macedoine', 'Macédoine de légumes', 'Mixed vegetables', 'CO-MC8', 'conserves', 'macedoine-legumes-maria'),
    mi('haricots-blancs', 'Haricots blancs', 'White beans', 'CO-HB8', 'conserves', 'haricots-blancs-maria'),
    mi('mais-doux', 'Maïs doux', 'Sweet corn', 'CO-MD3', 'conserves', 'mais-doux-maria-3-1'),
  ] },
  { key: 'fruits', photo: '/img/maria/l-ananas.webp', href: 'univers/conserves?famille=fruits', name: l('Conserves de fruits', 'Canned fruit'), items: [
    mi('ananas-morceaux', 'Ananas en morceaux au sirop léger', 'Pineapple pieces in light syrup', 'CO-AN8', 'conserves', 'ananas-tranches-maria'),
    mi('cocktail-fruits', 'Cocktail de fruits tropicaux', 'Tropical fruit cocktail', 'CO-FC8', 'conserves', 'cocktail-fruits-tropicaux-maria'),
    mi('jus-ananas-boite', 'Jus d’ananas', 'Pineapple juice', 'CO-JA1', 'conserves', 'jus-ananas-maria-boite'),
    mi('coco-pulpe', 'Coco avec pulpe', 'Coconut with pulp', 'CO-CC33', 'conserves', 'coco-avec-pulpe-maria-330ml'),
  ] },
  { key: 'sauces', photo: '/img/maria/l-moutarde.webp', href: 'univers/conserves?famille=sauces', name: l('Sauces', 'Sauces'), items: [
    mi('mayonnaise', 'Mayonnaise', 'Mayonnaise', 'CO-MY5', 'conserves', 'mayonnaise-maria'),
    mi('ketchup', 'Ketchup', 'Ketchup', 'CO-KE5', 'conserves', 'ketchup-maria-5kg'),
    mi('moutarde', 'Moutarde', 'Mustard', 'CO-MO1', 'conserves', 'moutarde-maria'),
    mi('vinaigre', 'Vinaigre coloré', 'Coloured vinegar', 'CO-VC15', 'conserves', 'vinaigre-colore-maria'),
  ] },
  { key: 'condiments', photo: '/img/maria/l-olives.webp', href: 'univers/conserves?famille=condiments', name: l('Condiments', 'Condiments'), items: [
    mi('olives-entieres', 'Olives vertes entières', 'Whole green olives', 'CO-OE7', 'conserves', 'olives-vertes-entieres-maria'),
    mi('olives-denoyautees', 'Olives vertes dénoyautées', 'Pitted green olives', 'CO-OL9', 'conserves', 'olives-vertes-maria'),
    mi('cornichons', 'Cornichons extra-fins', 'Extra-fine gherkins', 'CO-CN35', 'conserves', 'cornichons-extra-fins-maria'),
    mi('oignons-blancs', 'Petits oignons blancs', 'Small white onions', 'CO-OB36', 'conserves', 'petits-oignons-blancs-maria'),
  ] },
  { key: 'jus', photo: '/img/maria/l-jus.webp', href: 'univers/boissons?famille=jus', name: l('Jus', 'Juices'), items: [
    mi('jus-mangue', 'Mangue', 'Mango', 'MA-JM33', 'boissons', 'jus-maria-mangue'),
    mi('jus-goyave', 'Goyave', 'Guava', 'MA-JG33', 'boissons', 'jus-maria-goyave'),
    mi('jus-cocktail', 'Cocktail', 'Cocktail', 'MA-JC33', 'boissons', 'jus-maria-cocktail'),
    mi('jus-fraise-banane', 'Fraise-banane', 'Strawberry-banana', 'MA-JF33', 'boissons', 'jus-maria-fraise-banane'),
    mi('jus-ananas', 'Ananas', 'Pineapple', 'MA-JA33', 'boissons', 'jus-maria-ananas'),
    mi('jus-orange', 'Orange', 'Orange', 'MA-JO33', 'boissons', 'jus-maria-orange'),
  ] },
];
export const MARIA_PHOTOS: [string, L][] = [
  ['/img/maria/l-haricots.webp', l('Haricots blancs Maria', 'Maria white beans')],
  ['/img/maria/l-olives.webp', l('Olives vertes dénoyautées Maria', 'Maria pitted green olives')],
  ['/img/maria/l-moutarde.webp', l('Moutarde Maria', 'Maria mustard')],
  ['/img/maria/l-ananas.webp', l('Ananas en morceaux Maria', 'Maria pineapple pieces')],
];
