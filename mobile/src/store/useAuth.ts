import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type AuthState = {
  token: string | null;
  mnemonic: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  setMnemonic: (phrase: string) => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  mnemonic: null,

  setToken: async (token) => {
    await SecureStore.setItemAsync('auth_token', token);
    set({ token });
  },

  setMnemonic: async (phrase) => {
    await SecureStore.setItemAsync('backup_phrase', phrase);
    set({ mnemonic: phrase });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('backup_phrase');
    set({ token: null, mnemonic: null });
  },
}));
