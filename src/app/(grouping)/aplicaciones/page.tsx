'use client';

import { useState } from 'react';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import styles from './aplicaciones-view.module.scss';
import AplicacionesTabs from '@/components/AplicacionesTabs/AplicacionesTabs';

export default function AplicacionesPage() {
    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={true} path="" />
                <h1 className={styles.title}>Aplicaciones</h1>
                <div className={styles.content}>
                    <AplicacionesTabs />
                </div>
            </div>
            <Footer />
        </div>
    );
}
