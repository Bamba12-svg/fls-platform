# FLS · Plateforme web (site + back-office)

Refonte de **fls.sn** pour Fourniture Libre Service (Groupe COSEMAD), conforme au cahier des charges :
Next.js 14 (App Router) · TypeScript strict · Turborepo + pnpm · Tailwind (préfixe `sn-`) · PostgreSQL (Neon) via Prisma · NextAuth · back-office sur `/admin-fls`.

```
fls-platform/
├─ apps/web      Site public FR/EN, portail de commande pro, espace client     → http://localhost:3000
├─ apps/admin    Back-office (application séparée, servie sous /admin-fls)     → http://localhost:3000/admin-fls
├─ packages/core Règles métier partagées : tarification, remises, franco, TVA, formats (testées)
├─ packages/db   Schéma Prisma, données initiales, accès aux données (PostgreSQL ou mode démo)
├─ packages/config  TypeScript, preset Tailwind, chargement du .env unique
└─ storage/      Justificatifs privés (NINEA, RCCM, CV) et état du mode démo – jamais publics
```

## Démarrage rapide (mode démo, sans base de données)

Prérequis : **Node.js 20 ou plus** et **pnpm** (`npm install -g pnpm`).

```bash
pnpm install
cp .env.example .env          # sous Windows : copy .env.example .env
```

Dans `.env`, décommentez la ligne `DATA_SOURCE="demo"`, puis :

```bash
pnpm dev
```

- Site : http://localhost:3000
- Back-office : http://localhost:3000/admin-fls

En mode démo, les données (56 produits, 11 actualités, clients, commandes) sont chargées en mémoire et partagées entre le site et le back-office via `storage/demo-state.json`. Supprimez ce fichier pour repartir de zéro.

## Démarrage avec PostgreSQL (configuration de production)

```bash
docker compose up -d                 # PostgreSQL 16 local (ou une base Neon)
cp .env.example .env                 # puis renseignez DATABASE_URL et les secrets
pnpm install
pnpm --filter @fls/db setup          # migration initiale + protection du journal d'audit + données initiales
pnpm dev
```

`setup` crée les tables, installe le déclencheur SQL qui rend le journal d'audit **non modifiable et non supprimable**, puis charge les données initiales.

## Comptes de démonstration

| Espace | E-mail | Mot de passe | Rôle |
|---|---|---|---|
| Back-office | admin@fls.sn | FlsAdmin2026! | Administrateur (tous les droits) |
| Back-office | commercial@fls.sn | FlsAdmin2026! | Commercial : comptes, commandes, demandes |
| Back-office | editeur@fls.sn | FlsAdmin2026! | Éditeur : catalogue, actualités, médias |
| Site | grossiste@demo.fls.sn | Demo2026! | Grossiste (coefficient 0,88) |
| Site | demi@demo.fls.sn | Demo2026! | Demi-grossiste / supérette (0,94) |
| Site | chr@demo.fls.sn | Demo2026! | Restauration CHR (1,00) |
| Site | b2c@demo.fls.sn | Demo2026! | Particulier : prix unitaires TTC |

**Changez tous ces mots de passe avant la mise en ligne.**

## Ce qui est en place

**Site public** : accueil plein écran (diaporama en fondu 3 s, compteurs animés au défilement, panneaux d'univers), 5 univers avec filtres par famille, fiches produit (données structurées Product, fiche technique PDF générée), supérettes clés en main, conseil (calculateur de coût matière), société (carte des 13 villes, frise), actualités, contact (ouverture de compte en 3 étapes avec NINEA/RCCM et justificatifs, devis, candidature avec CV).

**Commerce B2B** : les prix ne sont **jamais** envoyés aux visiteurs ; un client connecté reçoit sa grille (coefficient du segment + remises −4 % dès 10 cartons, −9 % à la palette). Portail de commande rapide par code article, stock rafraîchi toutes les 15 s, franco de port, paniers types, recommande, factures PDF réservées à leur propriétaire. Le serveur recalcule prix, remises et stock à chaque commande.

**Back-office** (`/admin-fls`) : tableau de bord, catalogue (éditeur de blocs, univers multiples, packshots, stock en ligne), tarifs et paramètres (grilles, remises, franco, TVA, activation B2C), modération des comptes pro avec consultation sécurisée des justificatifs et mot de passe provisoire, commandes, contacts & devis, actualités, médiathèque (conversion WebP automatique), utilisateurs et rôles, **journal d'audit** de toutes les actions.

**Qualité** : FR/EN avec hreflang et sitemap, JSON-LD (Organization, WholesaleStore, Product, NewsArticle), images AVIF/WebP, navigation clavier et focus visibles, mouvements désactivés si l'utilisateur le demande (prefers-reduced-motion), en-têtes de sécurité, HTML des contenus nettoyé côté serveur.

## Prix et visuels (provisoires)

- **Prix** : les 56 prix de base (carton HT, grille restauration) sont calés sur les prix de marché observés à Dakar en 2025-2026 (riz brisé ordinaire homologué autour de 14 400 F le sac de 50 kg, sucre autour de 600 F le kg au détail). Ils se modifient produit par produit dans le back-office (Catalogue) et les coefficients par segment dans Tarifs.
- **Visuels** : 22 photos viennent de l’ancien fls.sn ; les 34 autres produits ont un packshot illustré provisoire (`apps/web/public/img/p/p-<code>.webp`). Pour les remplacer : Back-office > Médiathèque (téléverser la photo) puis Catalogue > produit > Packshot.

## Commandes utiles

```bash
pnpm dev            # site + back-office
pnpm build          # build de production
pnpm test           # tests des règles de tarification
pnpm typecheck
pnpm db:studio      # explorer la base (Prisma Studio)
```

## Mise en production (Vercel + Neon)

1. Base Neon : copier l'URL dans `DATABASE_URL`, puis `pnpm db:deploy` et `pnpm --filter @fls/db audit:protect`.
2. Deux projets Vercel : `apps/web` (domaine fls.sn) et `apps/admin` ; renseigner `ADMIN_URL` du site avec l'URL du back-office.
3. Secrets : `NEXTAUTH_SECRET` et `ADMIN_SECRET` (`openssl rand -base64 32`), `NEXT_PUBLIC_SITE_URL=https://fls.sn`.
4. Fichiers : sur Vercel le disque n'est pas permanent ; brancher Cloudinary (`CLOUDINARY_URL`) pour les médias et un stockage privé pour les justificatifs avant l'ouverture.

## Étapes suivantes prévues

- **Medusa.js** : le contrat `CommerceProvider` (`packages/core/src/commerce.ts`) est prêt ; l'adaptateur Medusa remplacera l'accès direct aux commandes et au stock sans toucher aux pages.
- **Cloudinary** pour les médias, envoi des SMS de suivi de livraison, paiement Wave / Orange Money.
- Contenus à valider par FLS : mot de la Direction, frise 2023–2025, fréquences de livraison, mentions légales des factures, prix réels du catalogue.
