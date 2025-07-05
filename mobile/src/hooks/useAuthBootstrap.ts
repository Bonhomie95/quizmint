import { useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import * as SecureStore from 'expo-secure-store';
import axios from '../api/axios';
import { v4 as uuidv4 } from 'uuid';

export const useAuthBootstrap = () => {
  const { setToken, setMnemonic } = useAuth();

  useEffect(() => {
    const bootstrap = async () => {
      let token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        setToken(token);
        return;
      }

      // Auto-register
      const uuid = uuidv4();
      try {
        const res = await axios.post('/auth/auto-register', { uuid });
        setToken(res.data.token);
      } catch (err) {
        console.error('Auto-registration failed', err);
      }
    };

    bootstrap();
  }, []);
};
