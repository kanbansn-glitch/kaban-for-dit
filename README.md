# KANBAN Inventory Platform

KANBAN est une plateforme de gestion d’inventaire pensée pour les PME qui souhaitent suivre leurs produits, leurs fournisseurs et leurs flux financiers en temps réel. L’application combine une API Laravel sécurisée et une interface React riche, le tout accompagné d’une documentation interactive activable à la demande.

## Sommaire

1. [Fonctionnalités majeures](#fonctionnalités-majeures)
2. [Architecture technique](#architecture-technique)
3. [Prérequis](#prérequis)
4. [Mise en route rapide](#mise-en-route-rapide)
5. [Variables d’environnement](#variables-denvironnement)
6. [Documentation intégrée](#documentation-intégrée)
7. [Tests & Qualité](#tests--qualité)
8. [Checklist déploiement](#checklist-déploiement)
9. [Dépannage express](#dépannage-express)

---

## Fonctionnalités majeures

- **Tableau de bord temps réel** : Indicateurs de ventes, achats, marges et alertes de stock faible.
- **Gestion d’inventaire avancée** : Produits liés à des catégories, fournisseurs et magasins avec seuils d’alerte.
- **Suivi des commandes** : Workflow complet de la commande fournisseur à la réception avec mise à jour automatique des stocks.
- **Rapports décisionnels** : Top produits, catégories performantes, comparatifs mensuels et annuels.
- **Authentification solide** : Sanctum, vérification d’email, connexion Google optionnelle.
- **Documentation publique** : Page `/docs` interactive pour présenter le projet en détail lorsque souhaité.

## Architecture technique

```
Frontend (React 18 + Vite)
│
├── pages/ (routage, pages publiques)
├── features/ (modules Dashboard, Inventory, Orders, Suppliers, Reports…)
├── store/ (Recoil : authTokenState, authUserState)
└── api/ (client HTTP générique + endpoints REST)

Backend (Laravel 10 + Sanctum)
│
├── app/Http/Controllers/ (API REST, agrégations, logique métier)
├── app/Models/ (Product, Supplier, Store, PurchaseOrder, Sale, Category)
├── routes/api.php (points d’entrée publics/protégés)
├── database/migrations/ (schéma MySQL)
└── config/ (auth, services, mail…)

Infrastructure
│
├── docker-compose.yml (MySQL 8 + phpMyAdmin pour le dev)
└── .env & frontend/.env (configuration complète)
```

## Prérequis

- Node.js ≥ 18
- npm ou pnpm
- PHP ≥ 8.2
- Composer
- MySQL ≥ 8.0 (ou Docker)

## Mise en route rapide

```bash
# 1. Backend
cd BACKEND
cp .env.example .env        # puis éditer les variables (voir section dédiée)
composer install
php artisan key:generate
php artisan migrate --seed   # si vous avez des seeders, sinon supprimez --seed
php artisan serve

# 2. Frontend (dans un autre terminal)
cd ../frontend
cp .env.example .env         # ou mettez à jour frontend/.env existant
npm install
npm run dev
```

L’API est accessible par défaut sur `http://127.0.0.1:8000/api` et le frontend sur `http://127.0.0.1:5173`.

## Variables d’environnement

### Backend (`BACKEND/.env`)

| Clé                          | Description                                                   |
|-----------------------------|----------------------------------------------------------------|
| `APP_URL`                   | URL publique de l’API (ex: `https://api.mondomaine.com`)       |
| `FRONTEND_URL`              | URL du frontend pour configurer CORS et redirections           |
| `EMAIL_VERIFICATION_REQUIRED` | Active la validation d’email avant connexion                  |
| `GOOGLE_AUTH_ENABLED`       | Active/désactive Google Sign-In                                |
| `DB_*`                      | Paramètres MySQL                                               |
| `MAIL_*`                    | Paramètres SMTP (obligatoire si vérification mail activée)     |

### Frontend (`frontend/.env`)

| Clé                 | Description                                                         |
|---------------------|---------------------------------------------------------------------|
| `VITE_API_URL`      | URL de base pour les appels API                                     |
| `VITE_DOCS_ENABLED` | `true` pour exposer la page documentaire `/docs`, sinon `false`     |

## Documentation intégrée

- Lorsque `VITE_DOCS_ENABLED=true`, la route publique `/docs` propose :
  - un sommaire interactif,
  - la recherche plein texte,
  - des filtres thématiques (architecture, backend, frontend, déploiement…),
  - des extraits de code copiables et des timelines de flux métier.
- Utile pour présenter le projet ou onboarder une équipe rapidement.
- Masquez la page en production publique si nécessaire en mettant `VITE_DOCS_ENABLED=false`.

## Tests & Qualité

- **Backend** : utilisez PHPUnit (`php artisan test`) pour couvrir les contrôleurs critiques (produits, commandes, ventes).
- **Frontend** : React Testing Library / Vitest peuvent être ajoutés pour tester les hooks et composants.
- **Lint** : `npm run lint` analyse le code JS/JSX selon la config ESLint.

## Checklist déploiement

1. Régénérer et sécuriser les secrets (`APP_KEY`, identifiants SMTP, clés OAuth).
2. Exécuter `composer install --optimize-autoloader` puis `php artisan config:cache`.
3. Lancer `php artisan migrate --force` sur l’environnement cible.
4. Construire le frontend (`npm run build`) et servir le dossier `frontend/dist`.
5. Configurer un reverse proxy (Nginx/Apache) pour pointer `/api` vers Laravel et `/` vers la SPA.
6. Mettre en place des sauvegardes MySQL et un monitoring (logs Laravel, erreurs JS).

## Dépannage express

| Problème                                       | Diagnostic rapide                                      | Solution proposée                             |
|-----------------------------------------------|--------------------------------------------------------|----------------------------------------------|
| 403 après inscription                         | Mail de vérification non reçu                          | Vérifier SMTP ou désactiver temporairement `EMAIL_VERIFICATION_REQUIRED` |
| Dashboard vide                                | Base vide ou token expiré                              | Alimenter la base, relancer la session auth   |
| Stocks incohérents après livraison/retour     | Statut de commande inchangé ou requête partielle       | Confirmer la transition via PUT/DELETE et consulter les logs |
| Erreur CORS côté front                        | `APP_URL` / `FRONTEND_URL` non alignés                 | Fixer les URLs et rafraîchir le cache config  |

---

Besoin d’un aperçu guidé ? Activez `/docs`, parcourez les sections et lancez une démonstration avec des données d’exemple pour mettre en valeur l’ensemble du produit. Bonne présentation ! 🚀
