import { handleLogout, handleMe } from '../api/auth';
import { AuthStore, useAuthStore } from './use-auth-store';
//import { handleLogout, handleMe } from '../fetch/AuthFetch';
//import { createSocket, disconnectSocket } from '../utils/socketManager';

interface UseSessionReturn {
  user: AuthStore['user'];
  status: AuthStore['status'];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const authStore = useAuthStore();
  //const dispatch = useDispatch();

  const signOut = async () => {
    try {
      await handleLogout();
      authStore.clear();
      //disconnectSocket();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await handleMe();
      authStore.set({
        status: 'authenticated',
        user: response.data.user,
      });
      //createSocket(dispatch, user, set);
    } catch (error) {
      authStore.set({
        status: 'unauthenticated',
      });
      //disconnectSocket();
    }
  };

  return {
    user: authStore.user,
    status: authStore.status,
    refresh: fetchUser,
    signOut,
  };
}