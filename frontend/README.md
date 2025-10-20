# Frontend – Stock App

Interface React minimale (Vite + Recoil + Sonner) pensée pour consommer l’API Laravel/Sanctum du dossier `BACKEND`.

## Configuration

1. Copie `.env.example` (s’il existe) ou crée `.env`, puis définis la cible API :

   ```ini
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

   En production, change simplement cette valeur vers ton domaine HTTPS. Tous les appels `fetch` utilisent automatiquement ce préfixe.

2. Installe les dépendances :

   ```bash
   npm install
   ```

## Scripts utiles

| Commande           | Description                |
|--------------------|----------------------------|
| `npm run dev`      | Démarre Vite (HMR)         |
| `npm run build`    | Génère la build production |
| `npm run preview`  | Prévisualise la build      |
| `npm run lint`     | Analyse ESLint             |

## Structure

```
src/
 ├─ api/           # Client Fetch vers le backend
 ├─ hooks/         # Hooks personnalisés (ex: useAuth)
 ├─ store/         # Atomes Recoil persistés (token)
 ├─ features/      # Modules métier (ex: products)
 └─ App.jsx        # Placeholder minimal "Frontend démarré"
```

`App.jsx` affiche simplement un message et un bouton de test. Remplace-le ensuite par tes vraies pages (login, dashboard…) en réutilisant `api/client.js`, `hooks/useAuth.js`, etc.
