import './AuthPage.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import AuthForm from '../features/auth/components/AuthForm';

function AuthPage({ mode = 'register' }) {
  const navigate = useNavigate();
  const isRegister = mode === 'register';

  const title = isRegister ? 'Create an account' : 'Log in to your account';
  const subtitle = isRegister
    ? 'Start your 30-day free trial.'
    : 'Enter your credentials to continue.';

  const toggleLabel = isRegister
    ? 'Already have an account? '
    : "Don't have an account? ";

  const toggleLink = isRegister ? 'Log in' : 'Sign up';
  const toggleHref = isRegister ? '/login' : '/register';

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <img src={logo} alt="Kanban logo" className="auth-logo" />
        <h1>KANBAN</h1>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <img src={logo} alt="Kanban" className="auth-card-logo" />
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          <AuthForm
            mode={mode}
            onSuccess={() => navigate('/dashboard')}
            onVerificationRequired={
              isRegister
                ? ({ email }) => {
                    const searchParams = new URLSearchParams();
                    if (email) {
                      searchParams.set('email', email);
                    }
                    const query = searchParams.toString();
                    navigate(query ? `/verify-email?${query}` : '/verify-email');
                  }
                : undefined
            }
          />

          <p className="auth-toggle">
            {toggleLabel}
            <button
              type="button"
              className="auth-toggle-link"
              onClick={() => navigate(toggleHref)}
            >
              {toggleLink}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
