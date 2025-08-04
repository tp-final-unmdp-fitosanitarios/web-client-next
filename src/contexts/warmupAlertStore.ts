// contexts/warmupAlertStore.ts
import { create } from 'zustand';

interface WarmupAlertStore {
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
}

export const useWarmupAlertStore = create<WarmupAlertStore>((set) => ({
  visible: false,
  message: '',
  show: (message) => set({ visible: true, message }),
  hide: () => set({ visible: false, message: '' }),
}));
