"use client";

import React from 'react';
import styles from './Loader.module.scss';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = 'Cargando...' }) => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
        <span className={styles.text}>{text}</span>
      </div>
    </div>
  );
};

export default Loader;
