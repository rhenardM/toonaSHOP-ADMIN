# ToonaSHOP Admin

Console d'administration de la plateforme ToonaSHOP (entreprises, abonnements, paiements, plans, codes promo, IMF, réclamations, utilisateurs, site web).

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query · React Hook Form + Zod · Recharts.

## Démarrer

```bash
cp .env.example .env.local   # puis renseigner les valeurs
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Portée | Rôle |
|---|---|---|
| `TOONA_API_URL` | serveur | API principale ToonaSHOP, sans `/api` (défaut : `https://toonashop.toonaphar.com`) |
| `TOONA_WEBSITE_API_URL` | serveur | API du site vitrine (défaut : `https://website-api.toonashop.com`) |
| `NEXT_PUBLIC_WA_SALES` / `NEXT_PUBLIC_WA_SUPPORT` | public | Numéros WhatsApp des contacts rapides |

Contrôles : `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Authentification et accès aux API

Le navigateur ne parle jamais directement aux backends ToonaSHOP. Next.js sert de **backend-for-frontend** :

```
Navigateur ──► /api/auth/*        login, session, logout, mot de passe oublié (OTP SMS)
           ──► /api/backend/*     ──► {TOONA_API_URL}/api/*         (Bearer injecté côté serveur)
           ──► /api/website/*     ──► {TOONA_WEBSITE_API_URL}/*     (Bearer injecté côté serveur)
```

- Le JWT renvoyé par `POST /auth` est stocké dans un cookie **httpOnly** (`toona_session`), illisible par le JavaScript de la page. Sa durée suit le claim `exp` du token.
- Les relais n'acceptent qu'une liste de préfixes de chemins (`src/lib/server/upstream.ts`) : pas de relais ouvert.
- Le backend signale un token invalide de façon hétérogène (401, 405, ou 500 HTML « Token invalide ») : le BFF normalise tout en **401** et supprime le cookie ; le client redirige alors vers `/login?expired=1`.
- `src/proxy.ts` redirige toute page vers `/login` en l'absence de cookie (contrôle optimiste ; la validation réelle est faite par le backend à chaque appel).
- Les exports CSV passent par le BFF : le token n'apparaît jamais dans une URL.

## Organisation

```
src/
├── app/                    routes (groupes (auth) et (dashboard)), route handlers /api
├── components/
│   ├── layout/             shell : sidebar, drawer mobile, topbar, recherche ⌘K, notifications
│   ├── shared/             composants métier réutilisables (DataTable, PaginationBar, dialogs…)
│   ├── charts/             thème et primitives Recharts
│   └── ui/                 primitives shadcn
├── features/<module>/      api/ (service + adaptateurs) · hooks/ · types/ · lib/ · components/
├── lib/
│   ├── api/                client HTTP navigateur, erreurs, pagination, normalisation
│   ├── server/             code serveur uniquement (BFF, cookies de session)
│   ├── auth/  constants/  utils/
├── config/                 navigation, variables publiques
└── proxy.ts                garde des routes
```

Chaque module expose des **adaptateurs** qui normalisent les réponses de l'API (mélange `camelCase`/`snake_case`, montants en chaîne, `totalPages`/`total_pages`…), si bien que les composants ne manipulent que des types propres. En cas d'erreur API, l'interface affiche un état d'erreur explicite : aucune donnée de remplacement.

## Indicateurs calculés côté console

L'API ne fournit pas de séries temporelles. Le tableau de bord dérive donc certains indicateurs des données réelles (`src/features/dashboard/lib/analytics.ts`) : revenus par jour/semaine/mois et santé des paiements (à partir des paiements des 12 derniers mois), répartition des abonnements et croissance (à partir de l'annuaire des entreprises), points d'attention et activité récente (fusion des paiements, inscriptions, demandes IMF, réclamations et messages).

## Améliorations backend souhaitées

Voir `DashboardToonaSHOP/docs/DASHBOARD_API_SPEC.md` §9, notamment : `GET /admin/groups/{id}`, filtres serveur sur `/admin/payments`, `PATCH /reclamation/{id}`, statut lu/non-lu des messages, endpoints de statistiques par période, et **protection par authentification de `GET /api/admin/document-downloads` et `GET /api/contact`** (actuellement accessibles sans token).
