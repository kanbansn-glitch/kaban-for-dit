import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { fetchGoogleAuthConfig } from '../api';
import logo from '../../../assets/img/google.png';

const INITIAL_STATE = { name: '', email: '', password: '' };

function AuthForm({ mode = 'register', onSuccess, onVerificationRequired }) {
  const isRegister = mode === 'register';
  const { register, login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleConfig, setGoogleConfig] = useState({ enabled: false, clientId: '' });
  const [isGoogleConfigLoaded, setIsGoogleConfigLoaded] = useState(false);
  const [isGoogleScriptReady, setIsGoogleScriptReady] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isRegister && form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        const result = await register(form);

        if (result?.requiresVerification) {
          if (onVerificationRequired) {
            onVerificationRequired({
              email: form.email,
              user: result.user ?? null,
            });
          }

          setForm(INITIAL_STATE);
          return;
        }
      } else {
        await login({ email: form.email, password: form.password });
      }

      if (onSuccess) {
        onSuccess();
      }

      setForm(INITIAL_STATE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredentialResponse = useCallback(async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      setIsGoogleLoading(false);
      toast.error('Réponse Google invalide.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(credential);
      setForm(INITIAL_STATE);
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // errors already surfaced through the auth hook
    } finally {
      setIsGoogleLoading(false);
    }
  }, [loginWithGoogle, onSuccess]);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const response = await fetchGoogleAuthConfig();
        const config = response?.data ?? response;

        if (!isMounted) {
          return;
        }

        setGoogleConfig({
          enabled: Boolean(config?.enabled),
          clientId: config?.client_id ?? '',
        });
      } catch {
        if (isMounted) {
          setGoogleConfig({ enabled: false, clientId: '' });
        }
      } finally {
        if (isMounted) {
          setIsGoogleConfigLoaded(true);
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!googleConfig.enabled || !googleConfig.clientId) {
      setIsGoogleScriptReady(false);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const initialize = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleConfig.clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: isRegister ? 'signup' : 'signin',
        ux_mode: 'popup',
      });
      setIsGoogleScriptReady(true);
    };

    const handleError = () => {
      setIsGoogleScriptReady(false);
      toast.error('Impossible de charger Google Identity Services.');
    };

    if (window.google?.accounts?.id) {
      initialize();
      return;
    }

    let script = document.getElementById('google-identity-services');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener('load', initialize);
    script.addEventListener('error', handleError);

    return () => {
      script.removeEventListener('load', initialize);
      script.removeEventListener('error', handleError);
    };
  }, [googleConfig, handleGoogleCredentialResponse, isRegister]);

  const handleGoogleSignIn = () => {
    if (!googleConfig.enabled || !googleConfig.clientId) {
      toast.error('La connexion Google est désactivée.');
      return;
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      toast.error('Google Identity Services est indisponible.');
      return;
    }

    setIsGoogleLoading(true);

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        setIsGoogleLoading(false);
        const reason = notification.getNotDisplayedReason();
        if (reason && reason !== 'suppressed_by_user') {
          toast.error(`Connexion Google indisponible (${reason}).`);
        }
      } else if (notification.isSkippedMoment()) {
        setIsGoogleLoading(false);
      } else if (notification.isDismissedMoment()) {
        if (notification.getDismissedReason() !== 'credential_returned') {
          setIsGoogleLoading(false);
          const dismissedReason = notification.getDismissedReason();
          if (dismissedReason && dismissedReason !== 'credential_returned') {
            toast.error(`Connexion Google annulée (${dismissedReason}).`);
          }
        }
      }
    });
  };

  const primaryLabel = isRegister ? 'Get started' : 'Sign in';
  const isGoogleConfigured = googleConfig.enabled && Boolean(googleConfig.clientId);
  const googleLabel = isGoogleLoading
    ? 'Connexion en cours…'
    : (isRegister ? 'Sign up with Google' : 'Sign in with Google');
  const isGoogleButtonDisabled =
    isLoading ||
    isGoogleLoading ||
    !isGoogleConfigLoaded ||
    (isGoogleConfigured && !isGoogleScriptReady);

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {isRegister && (
        <label>
          Name*
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
      )}

      <label>
        Email*
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Password*
        <input
          type="password"
          name="password"
          placeholder={isRegister ? 'Create a password' : 'Enter your password'}
          value={form.password}
          onChange={handleChange}
          required
          minLength={isRegister ? 8 : 1}
        />
        {isRegister ? (
          <span className="auth-helper">Must be at least 8 characters.</span>
        ) : (
          <span className="auth-helper">Enter the password for your account.</span>
        )}
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Please wait…' : primaryLabel}
      </button>

      <button
        type="button"
        className="auth-google"
        onClick={handleGoogleSignIn}
        disabled={isGoogleButtonDisabled}
      >
        <span className="auth-google-icon"><img src={logo} alt="" /></span>
        {googleLabel}
      </button>
    </form>
  );
}

export default AuthForm;
