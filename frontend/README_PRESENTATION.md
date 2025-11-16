# KANBAN Frontend – Playbook de présentation

> **Objectif :** fournir une vue complète du SPA React pour ta soutenance. Tu trouveras ici l’architecture, les flux fonctionnels, les dépendances critiques et les points à retenir lors de la démo.

## Table des matières
1. [Stack & dépendances clés](#stack--dépendances-clés)
2. [Configuration & variables d’environnement](#configuration--variables-denvironnement)
3. [Scripts npm & pipelines](#scripts-npm--pipelines)
4. [Arborescence commentée](#arborescence-commentée)
5. [Cycle de vie de l’application](#cycle-de-vie-de-lapplication)
6. [Modules fonctionnels](#modules-fonctionnels)
7. [Intégration API & gestion des erreurs](#intégration-api--gestion-des-erreurs)
8. [Gestion d’état & persistance](#gestion-détat--persistance)
9. [Interface & expérience utilisateur](#interface--expérience-utilisateur)
10. [Build, déploiement & bascules](#build-déploiement--bascuLes)
11. [Checklist pour la présentation](#checklist-pour-la-présentation)

## Stack & dépendances clés
- **React 18 + Vite 7** : démarrage instantané, HMR natif, bundler Rollup pour la prod.
- **React Router DOM 6.30** : routing client, garde `/dashboard` protégée via `Navigate`.
- **Recoil** : atomes `authTokenState`, `authUserState`, `htmlErrorState` persistés dans `localStorage`.
- **Sonner** : notifications toast globales (`<Toaster />` monté dans `main.jsx`).
- **Requêtes** : wrapper maison `apiRequest` (`src/api/client.js`) qui consolide URL, headers, parsing et levée d’erreurs enrichies.
- **UI / assets** : CSS vanilla par feature + quelques SVG (BoxIcons) & assets (`src/assets/img`).

## Configuration & variables d’environnement
- Fichier `.env` (non versionné) chargé par Vite :
  - `VITE_API_URL` → URL complète du backend (`https://api.djafy.com/api` en prod). Fallback automatique : `http://127.0.0.1:8000/api` en dev, `https://api.djafy.com/api` sinon.
- Aucun token n’est bundlé : Recoil écoute les changements pour mettre à jour `localStorage` côté navigateur.

## Scripts npm & pipelines
| Script | Description | Quand l’utiliser |
| --- | --- | --- |
| `npm run dev` | Vite + React Refresh sur `http://localhost:5173` | Dev local, prépa de démo |
| `npm run build` | Build production (Rollup) → `dist/` | Avant déploiement ou prévisualisation |
| `npm run preview` | Serveur statique sur le build compilé | Smoke test de la build |
| `npm run lint` | ESLint flat config (`eslint.config.js`) | Vérifier la qualité avant PR |

## Arborescence commentée
```
frontend/
├─ src/
│  ├─ api/               # client HTTP + définitions REST (products, suppliers…)
│  ├─ assets/            # logos, icônes Google, fonds
│  ├─ components/        # composants transverses (HtmlErrorOverlay)
│  ├─ features/          # dossier phare, un sous-dossier par domaine : auth, dashboard, inventory…
│  ├─ hooks/             # useAuth, useApiErrorHandler, useCurrentUser
│  ├─ pages/             # ecrans routés (HomePage, AuthPage, DashboardPage…)
│  ├─ store/             # atomes Recoil + sélecteurs
│  ├─ App.jsx            # déclaration des routes, garde auth, overlay d’erreurs HTML
│  └─ main.jsx           # bootstrap React 18 + Recoil + Router + Sonner
├─ public/ (géré par Vite si nécessaire)
├─ dist/                 # build générée (gitignorée)
├─ package.json / lock   # dépendances exactes (React Router 6.30.1, Recoil 0.7.7…)
├─ vite.config.js        # plugin React + options BrowserRouter v7 préactivées
├─ README.md             # guide rapide développeur
└─ README_PRESENTATION.md # (ce fichier) playbook complet
```

## Cycle de vie de l’application
1. `src/main.jsx` monte `<App />` dans `<StrictMode>` avec `RecoilRoot`, `BrowserRouter` et `<Toaster richColors />`.
2. `App.jsx` :
   - Monte `HtmlErrorOverlay` uniquement en dev pour afficher les réponses HTML du backend.
   - Ajoute `AuthInitializer` : si un token existe sans utilisateur, `useAuth.loadCurrentUser()` rafraîchit le profil/invalidé.
   - Déclare les routes : public (`/`, `/register`, `/login`, `/verify-email`), privée (`/dashboard`). Sans token → redirection `Navigate` vers `/login`.
3. Chaque page route charge sa feature principale :
   - `HomePage`: CTA onboarding vers inscription/connexion.
   - `AuthPage`: logiques de formulaires (email, password), appels API `register/login` + Google Identity Services.
   - `VerifyEmailPage`: re-demande un lien à l’API `email/verification-request`.
   - `DashboardPage`: configure `DashboardLayout` + sections (Dashboard, Inventory, Reports, Suppliers, Orders, Manage Store).

## Modules fonctionnels
### 1. Auth & onboarding
- **API** : `src/features/auth/api.js` (register/login/logout/me/google/verification).
- **State** : `useAuth` centralise register/login/logout/loginWithGoogle, stocke token + user, gère les toasts, nettoie l’état sur 401.
- **Google Sign-In** : `AuthForm` charge dynamiquement `https://accounts.google.com/gsi/client`, configure `window.google.accounts.id.initialize`, gère promesses `prompt` + `credentialResponse`.
- **Vérification email** : `AuthForm` renvoie vers `/verify-email?email=…` si `requires_verification`. `VerifyEmailPage` autorise un nouvel envoi via `requestEmailVerification`.

### 2. Dashboard (vue d’ensemble)
- **Layout** : `features/dashboard/components` fournit `Sidebar` (icônes mappés via `icons.jsx`) + `Header` (search, avatar) + `DashboardLayout` (gère l’onglet actif).
- **Section principale** : `DashboardSection.jsx` appelle `dashboardApi.summary(token)` et affiche :
  - Stat cards (ventes, revenue, profit, cost, achat, retours, etc.).
  - Chartes SVG custom : bar chart (Revenue vs Cost), multi-line orders chart.
  - Listes (top selling products, low quantity alerts) via `ListCard`.
  - `formatCurrency` dédié FCFA + fallback safe.
- **PlaceholderSection** : pour Settings, prêt à être remplacé.

### 3. Inventory
- **Hook `useInventoryData`** :
  - Charge en parallèle produits, catégories, fournisseurs (`fetchProducts/fetchCategories/fetchSuppliers`).
  - Enrichit les produits (`buying_price_formatted`, `expiry_date_formatted`, `status_label`).
  - Calcule un résumé (nb catégories, produits, revenus estimés, stocks faibles) pour `InventorySummary`.
  - Fournit des handlers CRUD (`handleProductCreate/Update/Delete`), gère l’ouverture de `ProductModal` et la sélection d’un produit.
- **UI** :
  - `ProductList` (pagination locale, pilles de statut, boutons Add/Filters/Export).
  - `ProductDetail` (vue split, actions edit/delete).
  - `ProductModal` (formulaire complet : codes, prix, seuil, expiry, store mapping).

### 4. Suppliers
- **Hook `useSuppliers`** : charge la liste via `suppliersApi`, gère un formulaire combiné fournisseur + produit.
- Permet :
  - Lier un fournisseur à un produit existant (pré-remplissage complet).
  - Créer simultanément un nouveau produit pour ce fournisseur (avec éventuelle affectation à un store).
  - Basculer `takes_back_returns` pour expliquer si le fournisseur accepte les retours.
- **UI** : tableau paginé + `SupplierModal` (multi-onglets, toggle type).

### 5. Orders
- **Hook `useOrders`** : centralise chargement, pagination, modale, validations (produit/supplier obligatoires, quantités > 0), update status.
- **OrdersSection** : résumés (total orders/received/returned/on the way), table interactive, actions rapides (“Mark as Delivered / Returned”).
- **OrderModal** : sélection produits/stores/suppliers, toggle notifications.

### 6. Stores
- **Hook `useStores`** : CRUD complet `storesApi` + modale simple (`StoreModal`).
- **UI** : cartes listant branche, adresse, métriques `product_count`.

### 7. Reports
- Charge via `reportsApi` : `overview`, `bestCategories`, `profitVsRevenue`, `bestProducts`.
- Différentes cartes : stat grid, tableau best category/product, chart line double (profit vs revenue) avec tooltip.
- Montre comment combiner plusieurs agrégats du backend.

## Intégration API & gestion des erreurs
- **`api/client.js`** :
  - Construit dynamiquement l’URL (`DEFAULT_API_URL` selon `import.meta.env.DEV`).
  - Normalise les slashs (`buildApiUrl`).
  - `parseResponse` inspecte `content-type`, tente un `JSON.parse`, stocke `error.rawBody` + `error.contentType` pour l’overlay.
- **`useApiErrorHandler`** :
  - En dev, si `text/html`, affiche la réponse complète dans `HtmlErrorOverlay` (iframe dismissible).
  - Sinon, affiche `toast.error` (messages multiples combinés si `error.errors`).
- **`api/resources.js`** : endpoints prêts à l’emploi (`ordersApi`, `suppliersApi`, `storesApi`, `reportsApi`, etc.), ce qui garde les features légères.

## Gestion d’état & persistance
- **Auth** :
  - `authTokenState` + `authUserState` → effets Recoil qui sync `localStorage` (`auth_token`, `auth_user`).
  - `isAuthenticatedSelector` disponible pour des garde supplémentaires si besoin.
- **HTML Overlay** : `htmlErrorState` stocke les réponses complètes du backend.
- **Hooks custom** (`useAuth`, `useInventoryData`, `useOrders`, `useSuppliers`, `useStores`) masquent la complexité pour les composants.

## Interface & expérience utilisateur
- **DashboardLayout** : split sidebar/flex main. Sidebar contient sections + footer + bouton Logout (`useAuth.logout`).
- **Modales** : construites en CSS pur (pas de lib tierce) → légèreté et customisation facile.
- **Formulaires** : validations immédiates (length password, champs required). `window.confirm` protège la suppression produit.
- **Toasts** : toutes les opérations critiques (login, CRUD, erreurs) renvoient un feedback `sonner`.
- **Accessibilité/UX** : boutons `type="button"`, attributs `aria-hidden` sur icônes, placeholders explicites.
- **Styles** : `*.css` par feature pour cloisonner. `App.css`/`index.css` posent les tokens (couleurs, fonts, layout).

## Build, déploiement & bascules
- **Build** : `npm run build` → `dist/` (gitignore). Ce dossier peut être servi tel quel via Nginx, S3, Vercel…
- **Prévisualisation** : `npm run preview` utilise `vite preview` (serveur statique Node) pour vérifier les assets minifiés.
- **API failover** : sans `.env`, le front pointe automatiquement :
  - Dev → `http://127.0.0.1:8000/api`
  - Prod → `https://api.djafy.com/api`
- **Sécurité** : token jamais injecté côté serveur, uniquement dans `localStorage`/Recoil. En cas de 401, `useAuth.loadCurrentUser` nettoie l’état et renvoie l’utilisateur vers `/login`.

## Checklist pour la présentation
1. **Pitch stack** : React 18 + Vite + Recoil + Sonner, architecture « feature-first ».
2. **Montrer HomePage** : CTA inscription/connexion.
3. **Démontrer Auth** : création de compte, validation du password, Google Sign-In (script dynamique) et redirection vers `/dashboard`.
4. **Expliquer la route `/dashboard`** : rôle de `DashboardLayout`, sections disponibles, possibilité d’en ajouter.
5. **Inventory demo** : montrer `ProductList`, ouvrir la modale, expliquer `useInventoryData` et le résumé (low stock/out of stock).
6. **Suppliers + Orders** : insister sur la coordination avec produits/stores, la possibilité de lier un produit existant.
7. **Reports** : présenter l’exploitation des agrégats backend (overview, best categories, profit vs revenue chart).
8. **Erreur backend** : en dev, provoquer une erreur 500 pour montrer `HtmlErrorOverlay` (iframe avec la réponse Laravel).
9. **Clôture** : rappeler que tout passe par `apiRequest`, centralisant la sécurité, les entêtes et la gestion d’erreurs.

Garde ce playbook sous la main pendant la présentation pour dérouler une histoire cohérente : stack → auth → dashboard → modules métier → analytics → gestion des erreurs.
