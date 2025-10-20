import { useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';

function AuthInitializer() {
  const { token, user, loadCurrentUser } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || user || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    loadCurrentUser()
      .catch(() => {
        // error already handled in hook
      })
      .finally(() => {
        hasFetched.current = false;
      });
  }, [token, user, loadCurrentUser]);

  return null;
}

export default AuthInitializer;
