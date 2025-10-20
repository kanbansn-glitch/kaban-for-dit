import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { toast } from 'sonner';
import { authTokenState, authUserState } from '../store/authState';
import {
  registerUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  loginWithGoogle as loginWithGoogleRequest,
} from '../features/auth/api';
import { useApiErrorHandler } from './useApiErrorHandler';

export function useAuth() {
  const [token, setToken] = useRecoilState(authTokenState);
  const [user, setUser] = useRecoilState(authUserState);
  const setAuthToken = useSetRecoilState(authTokenState);
  const setAuthUser = useSetRecoilState(authUserState);
  const handleApiError = useApiErrorHandler();

  const handleAuthResponse = useCallback((data, fallbackMessage) => {
    const authData = data?.data ?? data;
    const message = data?.message ?? fallbackMessage ?? 'Opération réussie.';

    if (authData?.requires_verification) {
      toast.success(message);
      return {
        requiresVerification: true,
        user: authData?.user ?? null,
        token: null,
      };
    }

    if (!authData?.token) {
      throw new Error("Réponse inattendue : token manquant.");
    }

    setToken(authData.token);
    setUser(authData.user ?? null);
    toast.success(message);

    return {
      requiresVerification: false,
      user: authData.user ?? null,
      token: authData.token,
    };
  }, [setToken, setUser]);

  const register = useCallback(async (payload) => {
    try {
      const data = await registerUser(payload);
      return handleAuthResponse(data, 'Inscription réussie');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [handleApiError, handleAuthResponse]);

  const login = useCallback(async (payload) => {
    try {
      const data = await loginUser(payload);
      return handleAuthResponse(data, 'Connexion réussie');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [handleApiError, handleAuthResponse]);

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const data = await loginWithGoogleRequest({ credential });
      return handleAuthResponse(data, 'Connexion Google réussie');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [handleApiError, handleAuthResponse]);

  const logout = useCallback(async () => {
    if (!token) {
      setAuthToken(null);
      setAuthUser(null);
      return;
    }

    try {
      await logoutUser(token);
      toast.success('Déconnexion réussie');
    } catch (error) {
      handleApiError(error);
    } finally {
      setAuthToken(null);
      setAuthUser(null);
    }
  }, [token, handleApiError, setAuthToken, setAuthUser]);

  const loadCurrentUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    try {
      const data = await fetchCurrentUser(token);
      const currentUser = data?.data?.user ?? data?.user ?? null;
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      if (error.status === 401) {
        setAuthToken(null);
        setAuthUser(null);
        return null;
      }

      handleApiError(error);
      throw error;
    }
  }, [token, setUser, setAuthToken, setAuthUser, handleApiError]);

  return {
    token,
    user,
    register,
    login,
    loginWithGoogle,
    logout,
    loadCurrentUser,
    setUser,
  };
}
