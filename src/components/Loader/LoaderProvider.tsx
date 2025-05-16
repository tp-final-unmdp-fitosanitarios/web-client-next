"use client";

import React from 'react';
import { useLoaderStore } from '@/contexts/loaderStore';
import Loader from './Loader';

interface LoaderProviderProps {
  children: React.ReactNode;
}

const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const { isLoading, text } = useLoaderStore();

  return (
    <>
      {children}
      {isLoading && <Loader text={text} />}
    </>
  );
};

export default LoaderProvider; 