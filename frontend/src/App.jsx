import { Navigate, Route, Routes } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authTokenState } from './store/authState';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import HtmlErrorOverlay from './components/HtmlErrorOverlay';
import AuthInitializer from './features/auth/components/AuthInitializer';
import DocsPage from './pages/DocsPage.jsx';

const IS_DEV = import.meta.env.DEV;
const DOCS_ENABLED = import.meta.env.VITE_DOCS_ENABLED === 'true';

function App() {
  const token = useRecoilValue(authTokenState);

  return (
    <>
      {IS_DEV && <HtmlErrorOverlay />}
      <AuthInitializer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        {DOCS_ENABLED ? <Route path="/docs" element={<DocsPage />} /> : null}
        <Route
          path="/dashboard"
          element={token ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
