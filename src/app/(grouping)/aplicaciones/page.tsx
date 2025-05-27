'use client';

import { useEffect, useState } from 'react';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import styles from './aplicaciones-view.module.scss';
import AplicacionesTabs from '@/components/AplicacionesTabs/AplicacionesTabs';
import { Aplicacion } from '@/domain/models/Aplicacion';
import { useAuth } from "@/components/Auth/AuthProvider";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useLoading } from "@/hooks/useLoading";

export default function AplicacionesPage() {
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const { withLoading } = useLoading();

    const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!isReady) return;

        const fetchAplicaciones = async () => {
            try {
                const response = await withLoading(
                  apiService.get<ResponseItems<Aplicacion>>('applications'),
                  "Cargando aplicaciones..."
                );
                if (response.success) {
                    setAplicaciones(response.data.content);
                } else {
                  setError(response.error || "Error al obtener las máquinas");
                }
              } catch (err) {
                setError("Error al conectar con el servidor" + err);
              } finally {
                setLoading(false);
              }
        };
    
        fetchAplicaciones();
    }, [isReady]);


    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={true} path="" />
                <h1 className={styles.title}>Aplicaciones</h1>
                <div className={styles.content}>
                    <AplicacionesTabs aplicaciones={aplicaciones} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
