"use client";

import { useLoaderStore } from '@/contexts/loaderStore';

export const useLoading = () => {
  const { showLoader, hideLoader } = useLoaderStore();

  const withLoading = async <T>(
    promise: Promise<T>,
    loadingText?: string
  ): Promise<T> => {
    try {
      showLoader(loadingText);
      const result = await promise;
      return result;
    } finally {
      hideLoader();
    }
  };

  return {
    showLoader,
    hideLoader,
    withLoading,
  };
}; 