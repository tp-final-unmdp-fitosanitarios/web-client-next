"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import styles from "./confirmarAplicacion.module.scss";
import Footer from "@/components/Footer/Footer";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { useAuth } from "@/components/Auth/AuthProvider";
import GenericModal from "@/components/modal/GenericModal";
import { useLoading } from "@/hooks/useLoading";
import { useLoaderStore } from "@/contexts/loaderStore";

export default function ConfirmarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const router = useRouter();
    const { withLoading } = useLoading();
    const { hideLoader } = useLoaderStore();
    const [productosDetalles, setProductosDetalles] = useState<{ [key: string]: string }>({});

    const fetchProductosDetalles = async (aplicacion: Aplicacion) => {
        try {
            const productosIds = aplicacion?.recipe?.recipe_items?.map(item => item.product_id) || [];
            const detalles = await Promise.all(
                productosIds.map(async (id) => {
                    const response = await apiService.get<{ id: number; name: string }>(`products/${id}`);
                    return { id, name: response.data.name };
                })
            );
            const detallesMap = detalles.reduce((acc, curr) => {
                acc[curr.id] = curr.name;
                return acc;
            }, {} as { [key: string]: string });
            setProductosDetalles(detallesMap);
        } catch (error) {
            console.error("Error al obtener detalles de productos:", error);
        }
    };

    const fetchApplication = async () => {
        try {
            const response = await apiService.get<Aplicacion>(`applications/${applicationId}`);
            setAplicacion(response.data);
            await fetchProductosDetalles(response.data); // ⬅️ traer nombres después de cargar la aplicación
            setLoading(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error("Error en la solicitud:", e.message);
            return null;
        }
    };


    useEffect(() => {
        if (!isReady) return;
        fetchApplication();
    }, [applicationId, isReady]);

    useEffect(() => {
        if (!loading) {
            hideLoader();
        }
    }, [loading]);
    const handleRechazar = async () => {
        const req = {
            status: "REJECTED"    // 👈 este valor lo espera tu backend
        };

        try {
            const response = await withLoading(
                apiService.create(`applications/${aplicacion?.id}/status`, req),
                "Rechazando aplicación..."
            );
            if (response.success) {
                setModalTitle("Aplicación Rechazada");
                setModalMessage("La aplicación ha sido rechazada exitosamente");
                setConfirmationModalOpen(true);
            } else {
                console.error("Error al rechazar la aplicación:", response.error);
            }
        } catch (error) {
            console.error("Error al rechazar la aplicación:", error);
        }
    };
    const handleAceptar = async () => {
        const req = {
            "status": "APPROVED"
        }
        try {
            const response = await withLoading(
                apiService.create(`applications/${aplicacion?.id}/status`, req),
                "Aprobando aplicación..."
            );
            if (response.success) {
                setModalTitle("Aplicación Aprobada");
                setModalMessage("La aplicación ha sido aprobada exitosamente");
                setConfirmationModalOpen(true);
            } else {
                console.error("Error al crear la aplicacion:", response.error);
            }
        } catch (error) {
            console.error("Error al crear la aplicacion:", error);
        }
    };

    const handleModificar = async () => {
        const req = {
            "status": "NEEDS_REUPLOAD"
        }
        try {
            const response = await withLoading(
                apiService.create(`applications/${aplicacion?.id}/status`, req),
                "Modificando aplicación..."
            );
            if (response.success) {
                setModalTitle("Aplicación Modificado");
                setModalMessage("Se solicitó una nueva carga de la aplicacion exitosamente");
                setConfirmationModalOpen(true);
            } else {
                console.error("Error al crear la aplicacion:", response.error);
            }
        } catch (error) {
            console.error("Error al crear la aplicacion:", error);
        }
    };

    function handleCloseConfirmationModal(): void {
        setConfirmationModalOpen(false);
        router.push("/aplicaciones");
    }

    if (loading)
        return <div>Cargando...</div>;
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const cultivo = aplicacion.location.name;
    const fecha = new Date(aplicacion.created_at).toLocaleDateString();

    const productos = aplicacion.recipe?.recipe_items?.map((item) => ({
        id: item.product_id,
        title: productosDetalles[item.product_id] || item.product_id,
        description: item.dose_type === "SURFACE"
            ? item.amount + item.unit + "/Ha"
            : item.amount + item.unit + " en total"
    })) || [];

    const items = productos.map(p => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description
    }));
    //console.log("items:",items);

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={false} showArrow={true} path="/aplicaciones" />
                <div className={styles.confirmarHeader}>Confirmar Aplicación</div>
                <div className={styles.container}>
                    <div className={styles.confirmarInfo}>
                        <div>Cultivo: {cultivo}</div>
                        <div>Fecha: {fecha}</div>
                    </div>
                    <h3 className={styles.productTitle}>Productos aplicados</h3>
                    <ItemList
                        items={items}
                        displayKeys={["title", "description"]}
                        selectItems={false}
                        deleteItems={false}
                        selectSingleItem={false}
                    />
                    <div className={`${styles.buttonContainer}`}>
                        <button
                            className={`button ${styles.button} ${styles.rechazarButton}`}
                            onClick={handleRechazar}
                        >
                            Rechazar
                        </button>
                        <button
                            className={`button button-secondary ${styles.button}`}
                            onClick={handleModificar}
                        >
                            Solicitar edición
                        </button>
                        <button
                            className={`button button-primary ${styles.button}`}
                            onClick={handleAceptar}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>

                <GenericModal
                    isOpen={confirmationModalOpen}
                    onClose={handleCloseConfirmationModal}
                    title={modalTitle}
                    modalText={modalMessage}
                    buttonTitle="Cerrar"
                    showSecondButton={false}
                />
            </div>
            <Footer />
        </div>
    );
}
