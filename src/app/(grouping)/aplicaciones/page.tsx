"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
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
import NavigationLink from '@/components/NavigationLink/NavigationLink';
import { EstadoAplicacion } from '@/domain/enum/EstadoAplicacion';

export default function AplicacionesPage() {
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const { withLoading } = useLoading();

    const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
    const [locaciones, setLocaciones] = useState<Locacion[]>([]);
    const [productos,setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [status, setStatus] = useState<string>(EstadoAplicacion.Pendiente);
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [pageSize, setPageSize] = useState(10); // Tamaño de página
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageElements, setPageElements] = useState(0);

    const fetchAplicaciones = async () => {
      try {
          const queryParams = new URLSearchParams();
          queryParams.append('status', status);
          queryParams.append('page', page.toString());
          queryParams.append('size', pageSize.toString());
          const response = await withLoading(
            apiService.get<ResponseItems<Aplicacion>>(`applications?${queryParams.toString()}`),
            "Cargando aplicaciones..."
          );
          console.log(response);
          if (response.success) {
              setAplicaciones(response.data.content);
              setTotalPages(response.data.total_pages || 0);
              setTotalElements(response.data.total_elements || 0);
              setPageElements(response.data.number_of_elements || 0);
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
    console.log('Starting fetchLocaciones');
    try {
        const response = await withLoading(
        apiService.get<Locacion[]>('locations?type=CROP'),
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

      if(locaciones.length>0 && productos.length>0 && aplicaciones.length>0)
        fetchAplicaciones();
      else
        fetchData();

  }, [isReady, page, pageSize,status]);

  // Handler para cambio de página
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination es 1-indexed
  };
  // Handler para cambio de tamaño de página
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const buttons = [
    { label: "Crear", path: "/aplicaciones/crear" },
    { label: "Ver Todas", path: "/aplicaciones/historico" },
  ];


  return (
      <div className="page-container">
          <div className="content-wrap">
              <MenuBar showMenu={true} path="" />
              <h1 className={styles.title}>Aplicaciones</h1>
              <div className={styles.content}>
                  <AplicacionesTabs
                    aplicaciones={aplicaciones}
                    productos={productos}
                    locaciones={locaciones}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageElements={pageElements}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    changeStatus={setStatus}
                  />
              </div>
              <div className={styles.buttonContainer}>
                {buttons.map((button, index) => (
                    <NavigationLink key={index} href={button.path}>
                        <button className={`button button-primary ${styles.buttonHome}`}>
                            {button.label}
                        </button>
                    </NavigationLink>
                ))}
              </div>
          </div>
          <Footer />
      </div>
  );
}
