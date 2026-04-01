import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'admin' | 'staff';

interface User {
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (role) => {
        const name = role === 'admin' ? 'Quản trị viên' : 'Nhân viên vận hành';
        set({ user: { name, role }, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
