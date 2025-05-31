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
import { Locacion } from '@/domain/models/Locacion';
import { Producto } from '@/domain/models/Producto';

export default function AplicacionesPage() {
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const { withLoading } = useLoading();

    const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
    const [locaciones, setLocaciones] = useState<Locacion[]>([]);
    const [productos,setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchAplicaciones = async () => {
      try {
          const response = await withLoading(
            apiService.get<ResponseItems<Aplicacion>>('applications'),
            "Cargando aplicaciones..."
          );
          if (response.success) {
              setAplicaciones(response.data.content);
          } else {
            setError(response.error || "Error al obtener las aplicaciones");
          }
        } catch (err) {
          setError("Error al conectar con el servidor" + err);
        } finally {
          setLoading(false);
        }
  };

  const fetchLocaciones = async () => {
    try {
        const response = await withLoading(
        apiService.get<Locacion[]>('/locations?type=WAREHOUSE&type=FIELD'),
        "Cargando ubicaciones..."
        );
        if (response.success) {
            setLocaciones(response.data);
        } else {
          setError(response.error || "Error al obtener las locaciones");
        }
      } catch (err) {
        setError("Error al conectar con el servidor" + err);
      } finally {
        setLoading(false);
      }
  };

  const fetchProductos = async () => {
    try {
        const response = await withLoading(
          apiService.get<ResponseItems<Producto>>('/products?size=100'),
          "Cargando productps..."
        );
        if (response.success) {
            setProductos(response.data.content);
        } else {
          setError(response.error || "Error al obtener los productos");
        }
      } catch (err) {
        setError("Error al conectar con el servidor" + err);
      } finally {
        setLoading(false);
      }
  };  

  const fetchData = async () => {
    await Promise.all([
      fetchLocaciones(),
      fetchProductos(),
      fetchAplicaciones()
    ]);
  }

  useEffect(() => {
      if (!isReady) return;

      fetchData();
  }, [isReady]);


  return (
      <div className="page-container">
          <div className="content-wrap">
              <MenuBar showMenu={true} path="" />
              <h1 className={styles.title}>Aplicaciones</h1>
              <div className={styles.content}>
                  <AplicacionesTabs aplicaciones={aplicaciones} productos={productos} locaciones={locaciones}/>
              </div>
          </div>
          <Footer />
      </div>
  );
}
