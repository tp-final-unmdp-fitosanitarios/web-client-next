"use client";

import { create } from 'zustand';

interface LoaderStore {
  isLoading: boolean;
  text: string;
  showLoader: (text?: string) => void;
  hideLoader: () => void;
}

export const useLoaderStore = create<LoaderStore>((set) => ({
  isLoading: false,
  text: 'Cargando...',
  showLoader: (text = 'Cargando...') => set({ isLoading: true, text }),
  hideLoader: () => set({ isLoading: false }),
})); 