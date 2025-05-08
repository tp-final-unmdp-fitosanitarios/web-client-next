import { create } from 'zustand'
import { User } from '@/domain/models/User'

interface UserState {
  user: User | null
  setUserGlobally: (u: User) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUserGlobally: (u) => set({ user: u }),
}))