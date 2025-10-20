export const docsSections = [
  {
    id: 'architecture-overview',
    emoji: '🧭',
    badge: 'Panorama',
    title: 'Architecture & philosophie générale',
    summary:
      "KANBAN est une application de gestion d'inventaire full-stack reposant sur un backend Laravel API-first et un frontend SPA React/Vite. Cette page liste tout ce qu'il faut pour la maîtriser rapidement.",
    items: [
      {
        type: 'callout',
        accent: 'primary',
        title: 'Mantra du projet',
        body: [
          "API Laravel 10 + Sanctum → toutes les règles métier vivent côté serveur.",
          "SPA React 18 + Recoil → expérience utilisateur fluide, état persistant.",
          "Design piloté par la donnée → tableaux de bord, rapports et automatisations d'inventaire.",
        ],
      },
      {
        type: 'grid',
        title: 'Cartographie rapide',
        columns: [
          {
            heading: 'Frontend',
            points: [
              'React 18, routing client avec React Router 6.',
              'Gestion d’état globale avec Recoil, stockage du token dans localStorage.',
              'Architecture fonctionnelle par “features” (auth, dashboard, inventory…).',
            ],
          },
          {
            heading: 'Backend',
            points: [
              'Laravel (routes API dédiées) + Sanctum pour l’authentification par tokens.',
              'Eloquent structure les entités cœur (Product, PurchaseOrder, Sale, Supplier, Store).',
              'Mises à jour de stock transactionnelles lors des ventes et réceptions.',
            ],
          },
          {
            heading: 'DevOps',
            points: [
              'MySQL 8 orchestré via docker-compose pour le développement.',
              'Configuration centralisée par `.env` côté backend et frontend (Vite).',
              'Build Vite pour le SPA, déployable derrière Nginx ou tout serveur statique.',
            ],
          },
        ],
      },
      {
        type: 'bullets',
        title: 'Points d’entrée clés',
        bullets: [
          {
            label: 'Routes API',
            description:
              'Définitions publiques/protégées, regroupées avec `ApiRoute` pour limiter la duplication.',
            path: 'BACKEND/routes/api.php:17',
          },
          {
            label: 'Tableau de bord',
            description:
              'Agrégats multi-sources (ventes, achats, inventaire) exposés par `DashboardController`.',
            path: 'BACKEND/app/Http/Controllers/DashboardController.php:16',
          },
          {
            label: 'Vue SPA',
            description:
              'App.jsx déclare le routing, l’injection Recoil et conditionne l’accès au tableau de bord.',
            path: 'frontend/src/App.jsx:1',
          },
        ],
      },
    ],
  },
  {
    id: 'frontend-structure',
    emoji: '🎨',
    badge: 'Frontend',
    title: 'Organisation du frontend (React / Vite)',
    summary:
      "Chaque feature React expose ses composants, hooks et API clients dédiés. Cette section détaille l’organisation et les flux d’écran.",
    items: [
      {
        type: 'callout',
        accent: 'teal',
        title: 'Arborescence à retenir',
        body: [
          '`src/features/<module>` : logique métier (UI + hooks + API spécifiques).',
          '`src/hooks` : hooks transverses (auth, gestion d’erreurs).',
          '`src/api` : client HTTP et ressources REST paramétrables.',
          '`src/pages` : pages de niveau route, orchestrant les features.',
        ],
      },
      {
        type: 'bullets',
        title: 'Points de focus',
        bullets: [
          {
            label: 'App.jsx',
            description:
              'Montre comment les routes publiques (Home, Docs, Auth) et privées (Dashboard) sont différenciées.',
            path: 'frontend/src/App.jsx:1',
          },
          {
            label: 'Auth state',
            description:
              'Recoil atomes `authTokenState` & `authUserState` avec persistance locale.',
            path: 'frontend/src/store/authState.js:9',
          },
          {
            label: 'useAuth',
            description:
              'Hook centralisant login/register/logout, gestion de Google Sign-In et rafraîchissement utilisateur.',
            path: 'frontend/src/hooks/useAuth.js:14',
          },
          {
            label: 'DashboardSection',
            description:
              'Consomme `dashboardApi.summary`, affiche stat cards, graphes SVG et listes dynamiques.',
            path: 'frontend/src/features/dashboard/DashboardSection.jsx:1',
          },
          {
            label: 'InventorySection',
            description:
              'Workflow complet CRUD produits avec modal, synchronisation magasin-produit et toasts.',
            path: 'frontend/src/features/inventory/InventorySection.jsx:1',
          },
          {
            label: 'Orders & Suppliers',
            description:
              'Relations croisées : création de commandes synchronisée avec produits et magasins.',
            path: 'frontend/src/features/orders/OrdersSection.jsx:1',
          },
        ],
      },
      {
        type: 'timeline',
        title: 'Parcours utilisateur type',
        events: [
          {
            label: 'Accueil public',
            detail:
              'HomePage oriente vers inscription/connexion. Quand la documentation publique est active, un CTA dirige vers /docs.',
            path: 'frontend/src/pages/HomePage.jsx:5',
          },
          {
            label: 'Onboarding',
            detail:
              'AuthPage propose login/register. Après succès, navigation automatique vers /dashboard.',
            path: 'frontend/src/pages/AuthPage.jsx:6',
          },
          {
            label: 'Dashboard',
            detail:
              'DashboardLayout charge les sections “Dashboard, Inventory, Reports, Suppliers, Orders, Manage Store”.',
            path: 'frontend/src/pages/DashboardPage.jsx:10',
          },
        ],
      },
      {
        type: 'code',
        title: 'Requête API standardisée',
        description:
          'Tous les appels passent par `apiRequest`, ce qui centralise les headers, la gestion d’erreurs et le parsing JSON.',
        language: 'js',
        code: `// frontend/src/api/client.js
export async function apiRequest(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(\`\${API_URL}/\${path.replace(/^\\/+/,'')}\`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}`,
      },
    ],
  },
  {
    id: 'backend-structure',
    emoji: '🧱',
    badge: 'Backend',
    title: 'Organisation du backend (Laravel)',
    summary:
      "Le serveur Laravel expose une API REST focalisée sur la gestion d’inventaire. Chaque ressource possède son contrôleur dédié et des règles de validation précises.",
    items: [
      {
        type: 'bullets',
        title: 'Contrôleurs stratégiques',
        bullets: [
          {
            label: 'ProductController',
            description:
              'Valide les produits, calcule le statut (in_stock/low_stock/out_of_stock) et synchronise les magasins associés.',
            path: 'BACKEND/app/Http/Controllers/ProductController.php:15',
          },
          {
            label: 'PurchaseOrderController',
            description:
              'Gère commandes fournisseurs et met à jour les stocks à la livraison/retour avec des transactions.',
            path: 'BACKEND/app/Http/Controllers/PurchaseOrderController.php:15',
          },
          {
            label: 'SaleController',
            description:
              'Enregistre les ventes, décrémente le stock produit et le stock magasin correspondant.',
            path: 'BACKEND/app/Http/Controllers/SaleController.php:12',
          },
          {
            label: 'DashboardController & ReportsController',
            description:
              'Agrégats statistiques, comparatifs mensuels et top ventes via `CarbonPeriod` et requêtes groupées.',
            path: 'BACKEND/app/Http/Controllers/DashboardController.php:16',
          },
          {
            label: 'AuthController & EmailVerificationController',
            description:
              'Inscriptions, connexion Sanctum, exigence de vérification email conditionnée par la config.',
            path: 'BACKEND/app/Http/Controllers/AuthController.php:15',
          },
        ],
      },
      {
        type: 'bullets',
        title: 'Modèles Eloquent',
        bullets: [
          {
            label: 'Product',
            description:
              'Relations vers Category, Supplier, Store (pivot `product_store`), PurchaseOrders et Sales.',
            path: 'BACKEND/app/Models/Product.php:15',
          },
          {
            label: 'PurchaseOrder',
            description:
              'Stocke quantité, valeur, statut et liens vers Product/Supplier/Store pour chaque commande.',
            path: 'BACKEND/app/Models/PurchaseOrder.php:13',
          },
          {
            label: 'Supplier & Store',
            description:
              'Suivi du nombre de commandes en cours (`on_the_way`) et du nombre de produits actifs par magasin.',
            path: 'BACKEND/app/Http/Controllers/SupplierController.php:15',
          },
        ],
      },
      {
        type: 'callout',
        accent: 'warning',
        title: 'Migrations & cohérence des données',
        body: [
          'Migrations datées (2025_xx) créent tables produits, fournisseurs, commandes, ventes et pivot produits↔magasins.',
          'Chaque migration applique des contraintes FK + cascade/NULL appropriées.',
          'Certaines migrations peuplent des données par défaut (création d’un “Main Store”).',
        ],
        path: 'BACKEND/database/migrations/2025_01_16_000008_create_stores_table.php:12',
      },
      {
        type: 'timeline',
        title: 'Cycle de vie d’une commande',
        events: [
          {
            label: 'Création',
            detail:
              'Une commande est créée par l’API → statut “Confirmed”, valeur calculée automatiquement (`buying_price * quantity`).',
            path: 'BACKEND/app/Http/Controllers/PurchaseOrderController.php:63',
          },
          {
            label: 'Livraison',
            detail:
              'Lors du passage au statut Delivered, les stocks produit + magasin sont incrémentés dans une transaction.',
            path: 'BACKEND/app/Http/Controllers/PurchaseOrderController.php:205',
          },
          {
            label: 'Retours/annulations',
            detail:
              'Les transitions hors “Delivered” restaurent les stocks; les commandes “Delivered” ne peuvent pas être supprimées.',
            path: 'BACKEND/app/Http/Controllers/PurchaseOrderController.php:231',
          },
        ],
      },
      {
        type: 'code',
        title: 'Déclaration des routes API',
        language: 'php',
        code: `// BACKEND/routes/api.php
ApiRoute::public('post', 'register', AuthController::class, 'register');
ApiRoute::public('post', 'login', AuthController::class, 'login');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('products', ProductController::class)->except(['create', 'edit']);
    Route::apiResource('orders', PurchaseOrderController::class)->except(['create', 'edit']);
    Route::get('dashboard/summary', [DashboardController::class, 'summary']);
    Route::prefix('reports')->group(function () {
        Route::get('overview', [ReportsController::class, 'overview']);
        Route::get('best-products', [ReportsController::class, 'bestProducts']);
    });
});`,
      },
    ],
  },
  {
    id: 'data-flows',
    emoji: '🔄',
    badge: 'Data flow',
    title: 'Flux fonctionnels & intégrations',
    summary:
      'Comprendre comment la donnée circule entre le front, l’API et la base est essentiel pour le déploiement et l’extension.',
    items: [
      {
        type: 'timeline',
        title: 'Cycle authentification → données',
        events: [
          {
            label: 'Login',
            detail:
              'AuthForm appelle `loginUser` → AuthController génère un token Sanctum → Recoil stocke le token et l’utilisateur.',
            path: 'frontend/src/features/auth/api.js:9',
          },
          {
            label: 'Hydratation',
            detail:
              'AuthInitializer (hook) vérifie le token et récupère `/api/me` pour rafraîchir le profil.',
            path: 'frontend/src/features/auth/components/AuthInitializer.jsx',
          },
          {
            label: 'Requêtes protégées',
            detail:
              'Chaque appel REST envoie `Authorization: Bearer <token>` via `apiRequest` et Sanctum protège la route.',
            path: 'frontend/src/api/client.js:1',
          },
        ],
      },
      {
        type: 'bullets',
        title: 'Synchronisation inventaire',
        bullets: [
          {
            label: 'Création produit',
            description:
              'Produit créé côté front → ProductController calcule le statut et, si stores fournis, synchronise le pivot.',
            path: 'BACKEND/app/Http/Controllers/ProductController.php:90',
          },
          {
            label: 'Commande livrée',
            description:
              'Changement de statut vers Delivered → stocks Eloquent mis à jour, pivot magasin incrémenté.',
            path: 'BACKEND/app/Http/Controllers/PurchaseOrderController.php:205',
          },
          {
            label: 'Vente enregistrée',
            description:
              'SaleController décrémente produit + pivot magasin, assure la cohérence via transaction.',
            path: 'BACKEND/app/Http/Controllers/SaleController.php:55',
          },
        ],
      },
      {
        type: 'callout',
        accent: 'info',
        title: 'Alertes & indicateurs',
        body: [
          'Dashboard agrège les ventes des 7 derniers jours, les achats et les stocks faibles.',
          'Rapports comparent profit MoM / YoY et listent les meilleures catégories/produits.',
          'Les sections Suppliers/Orders affichent les commandes “on the way” pour chaque fournisseur.',
        ],
      },
    ],
  },
  {
    id: 'deployment',
    emoji: '🚀',
    badge: 'Déploiement',
    title: 'Checklist déploiement & configuration',
    summary:
      "Liste des variables d’environnement, commandes artisan/npm et points d’attention pour passer en production sereinement.",
    items: [
      {
        type: 'callout',
        accent: 'danger',
        title: 'Secrets à régénérer',
        body: [
          'APP_KEY (Laravel) si le dépôt a tourné en public.',
          'GOOGLE_CLIENT_ID / SECRET si vous activez Google Sign-In.',
          'Identifiants SMTP (MAIL_USERNAME/MAIL_PASSWORD) → prévoir un fournisseur sécurisé.',
        ],
        path: 'BACKEND/.env:12',
      },
      {
        type: 'steps',
        title: 'Backend (Laravel)',
        steps: [
          'Copier `.env.example` → renseigner APP_URL, DB_*, FRONTEND_URL, mail.',
          '`composer install --optimize-autoloader`',
          '`php artisan migrate --force` (inclut tables sessions/jobs/cache).',
          '`php artisan storage:link` si vous gérez des fichiers.',
          '`php artisan config:cache && php artisan route:cache`',
        ],
      },
      {
        type: 'steps',
        title: 'Base de données',
        steps: [
          'MySQL ≥ 8.0 (support JSON, window functions).',
          'Utiliser les scripts docker-compose fournis en dev ou un service managé en prod.',
          'Sauvegardes automatiques (mysqldump ou snapshots) avant migrations critiques.',
        ],
      },
      {
        type: 'steps',
        title: 'Frontend (Vite)',
        steps: [
          '`npm install`',
          '`npm run build` → génère `frontend/dist` prêt à être servi statiquement.',
          'Configurer `VITE_API_URL` vers l’URL HTTPS de l’API et `VITE_DOCS_ENABLED` selon le besoin.',
        ],
      },
      {
        type: 'code',
        title: 'docker-compose de développement',
        language: 'yaml',
        code: `services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: appdb
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppwd
    ports:
      - "3306:3306"
  phpmyadmin:
    image: phpmyadmin:5
    ports:
      - "8080:80"`,
        description: 'Permet de reproduire localement la stack MySQL + PhpMyAdmin.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    emoji: '🛠️',
    badge: 'Support',
    title: 'Dépannage rapide & bonnes pratiques',
    summary:
      'Ce tableau sert de référence éclair pour résoudre les problèmes fréquents observés en phase de démo ou de prod.',
    items: [
      {
        type: 'table',
        title: 'Table des symptômes courants',
        headers: ['Symptôme', 'Cause probable', 'Résolution'],
        rows: [
          [
            'Impossible de se connecter (403 après inscription)',
            'EMAIL_VERIFICATION_REQUIRED=true mais SMTP inactif',
            'Configurer SMTP valide ou positionner EMAIL_VERIFICATION_REQUIRED=false pour tester',
          ],
          [
            'Dashboard vide',
            'Base vide ou token expiré',
            'Injecter des données de test (see `artisan tinker`) et relancer AuthInitializer (logout/login)',
          ],
          [
            'Commande livrée mais stock inchangé',
            'Transaction interrompue ou statut resté sur Confirmed',
            'Vérifier logs Laravel, confimer update PUT côté OrdersSection',
          ],
          [
            'Erreur CORS côté front',
            'APP_URL/FRONTEND_URL mal renseignés',
            'Aligner les URLs dans `.env` et redéployer config cache',
          ],
        ],
      },
      {
        type: 'bullets',
        title: 'Tests et validations recommandées',
        bullets: [
          {
            label: 'Feature tests Laravel',
            description:
              'Créer des tests pour ProductController/PurchaseOrderController afin de verrouiller les transitions de stock.',
            path: 'BACKEND/tests',
          },
          {
            label: 'Données de démo',
            description:
              'Utiliser des seeders ou des scripts artisan pour insérer produits, commandes, ventes crédibles avant une présentation.',
            path: 'BACKEND/database/seeders',
          },
          {
            label: 'Audit sécurité',
            description:
              'Vérifier expiration tokens, limiter throttle login, activer HTTPS en production.',
          },
        ],
      },
    ],
  },
];

export const quickFilters = [
  { id: 'overview', label: 'Architecture', matches: ['architecture', 'panorama', 'vision'] },
  { id: 'frontend', label: 'Frontend', matches: ['react', 'frontend', 'vite'] },
  { id: 'backend', label: 'Backend', matches: ['laravel', 'backend', 'eloquent'] },
  { id: 'data', label: 'Flux de données', matches: ['flux', 'data', 'workflow'] },
  { id: 'ops', label: 'Déploiement', matches: ['deploy', 'prod', 'infra', 'docker'] },
  { id: 'support', label: 'Support', matches: ['debug', 'support', 'troubleshooting'] },
];
