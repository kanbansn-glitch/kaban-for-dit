import './HomePage.css';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const docsEnabled = import.meta.env.VITE_DOCS_ENABLED === 'true';

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1>Welcome to <span className="app_name">KANBAN</span></h1>
        <p className="home-subtitle">
          Gérez vos stocks en toute simplicité. Commencez par créer un compte ou
          connectez-vous pour rejoindre le tableau de bord.
        </p>
        <div className="home-actions">
          <button type="button" onClick={() => navigate('/register')}>
            S&apos;inscrire
          </button>
          <button
            type="button"
            className="outline"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
        {docsEnabled ? (
          <div className="home-docs-link">
            <button type="button" className="link-button" onClick={() => navigate('/docs')}>
              Explorer la documentation du projet
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default HomePage;
