import { atom, selector } from 'recoil';

const TOKEN_STORAGE_KEY = 'auth_token';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const storedToken = isBrowser ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
const storedUser = isBrowser ? localStorage.getItem('auth_user') : null;

export const authTokenState = atom({
  key: 'authTokenState',
  default: storedToken ?? null,
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        if (!isBrowser) {
          return;
        }

        if (newValue) {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, newValue);
        } else {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      });
    },
  ],
});

export const authUserState = atom({
  key: 'authUserState',
  default: storedUser ? JSON.parse(storedUser) : null,
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        if (!isBrowser) {
          return;
        }

        if (newValue) {
          window.localStorage.setItem('auth_user', JSON.stringify(newValue));
        } else {
          window.localStorage.removeItem('auth_user');
        }
      });
    },
  ],
});

export const isAuthenticatedSelector = selector({
  key: 'isAuthenticatedSelector',
  get: ({ get }) => Boolean(get(authTokenState)),
});
