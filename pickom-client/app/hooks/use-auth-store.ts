import { create, StoreApi } from 'zustand';
import { User } from '../api/dto/user';

export type AuthStore = {
  status: 'authenticated' | 'loading' | 'unauthenticated';
  user: User | null;
  clear: () => void;
  set: StoreApi<AuthStore>['setState'];
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: 'loading',
  clear: () => {
    const { user } = get();
    //if (user) socketService.leaveRoom(user.uid);
    set({ user: null, status: 'unauthenticated' });
  },
  set: (newData) => {
    const { user: prevUser } = get();
    const newUser = (typeof newData === 'function' ? newData(get()) : newData).user;
    if (!prevUser && newUser) {
      //socketService.createRoom(newUser.uid);
    }
    set(newData);
  },
}));