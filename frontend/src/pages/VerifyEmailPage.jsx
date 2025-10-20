import './AuthPage.css';
import './VerifyEmailPage.css';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../assets/img/logo.png';
import { requestEmailVerification } from '../features/auth/api';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();

  const initialEmail = searchParams.get('email') ?? '';
  const status = searchParams.get('status') ?? null;

  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusInfo = useMemo(() => {
    switch (status) {
      case 'success':
        return {
          title: 'Adresse e-mail vérifiée',
          description: 'Votre adresse e-mail est maintenant confirmée. Vous pouvez vous connecter pour accéder à votre tableau de bord.',
          showRequestForm: false,
        };
      case 'already-verified':
        return {
          title: 'Adresse déjà vérifiée',
          description: 'Cette adresse e-mail est déjà confirmée. Connectez-vous pour continuer.',
          showRequestForm: false,
        };
      default:
        return {
          title: 'Vérifiez votre boîte mail',
          description: "Nous avons envoyé un lien de confirmation à l'adresse fournie. Si vous ne le trouvez pas, demandez un nouvel envoi ci-dessous.",
          showRequestForm: true,
        };
    }
  }, [status]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.error('Veuillez renseigner votre adresse e-mail.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestEmailVerification({ email });
      toast.success('Si un compte existe pour cette adresse, un e-mail de vérification vient de vous être envoyé.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <img src={logo} alt="Kanban logo" className="auth-logo" />
        <h1>KANBAN</h1>
      </div>

      <div className="auth-content">
        <div className="auth-card verify-card">
          <img src={logo} alt="Kanban" className="auth-card-logo" />
          <h2>{statusInfo.title}</h2>
          <p className="verify-card-description">{statusInfo.description}</p>

          {initialEmail && (
            <div className="verify-email-pill" title={initialEmail}>
              <span>{initialEmail}</span>
            </div>
          )}

          {statusInfo.showRequestForm && (
            <form className="verify-email-form" onSubmit={handleSubmit}>
              <label>
                Adresse e-mail
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="exemple@domaine.com"
                  required
                />
              </label>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours…' : 'Renvoyer le lien de vérification'}
              </button>
            </form>
          )}

          <button
            type="button"
            className="verify-login-button"
            onClick={() => navigate('/login')}
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
