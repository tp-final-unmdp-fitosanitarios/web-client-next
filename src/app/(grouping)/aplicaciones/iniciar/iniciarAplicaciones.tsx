"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import styles from "./iniciarAplicaciones-view.module.scss";
import Footer from "@/components/Footer/Footer";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { useAuth } from "@/components/Auth/AuthProvider";
import GenericModal from "@/components/modal/GenericModal";
import { useRouter } from 'next/navigation';
import { useLoading } from "@/hooks/useLoading";
import { Roles } from "@/domain/enum/Roles";
// import LoaderGlobal from "@/components/Loader/LoaderGlobal";


export default function IniciarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [loading, setLoading] = useState(true);
    const { getApiService, isReady, user } = useAuth();
    const apiService = getApiService();
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const router = useRouter();
    const { withLoading } = useLoading();
    

    const fetchApplication = async () => {
        try {
            const response = await apiService.get<Aplicacion>(`applications/${applicationId}`);
            setAplicacion(response.data);
            setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error("Error en la solicitud:", e.message);
            return null;
        }
    }

   useEffect(() => {
        if(!isReady) return;

        fetchApplication();
        
    }, [applicationId,isReady]);


    if (loading) 
        // return <LoaderGlobal />; // Descomenta esta línea para usar el loader global
        return <div>Cargando...</div>; // Elimina esta línea cuando uses el loader global
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const cultivo = aplicacion.location.name;
    const lote = aplicacion.location.parent_location.name
    const fecha = new Date(aplicacion.application_date).toLocaleDateString();

    const productos = aplicacion.recipe?.recipe_items?.map((item) => ({
        id: item.product_id,
        title: `${item.name}`,
        description: `${item.amount}${item.unit}${item.dose_type === "SURFACE" ?" /Ha" : " En total"}`
    }));

    const items = productos.map(p => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description
    }))

    function handleCloseConfirmationModal(): void {
        setConfirmationModalOpen(false);
        router.push("/aplicaciones");
    }

    const handleConfirm = async () => {
            const req = {
                "status":"IN_PROGRESS"
            }
            try {
                const response = await withLoading(
                    apiService.create(`applications/${aplicacion?.id}/status`,req),
                    "Iniciando aplicación..."
                );
                if (response.success) {
                    setConfirmationModalOpen(true);
                } else {
                    console.error("Error al crear la aplicacion:", response.error);
                }
            } catch (error) {
                console.error("Error al crear la aplicacion:", error);
            }
    }

    function handleEliminar(): void {
        //
        throw new Error("Function not implemented.");
    }

    function handleModificar(): void {
        throw new Error("Function not implemented.");
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
            <MenuBar showMenu={false} showArrow={true} path="/aplicaciones"/>
            <div className={styles.iniciarHeader}>Aplicacion a realizar</div>
            <div className={styles.container}>
            <div className={styles.iniciarInfo}>
                <div>Cultivo: {cultivo}</div>
                <div>Lote: {lote}</div>
                <div>Fecha: {fecha}</div>
            </div>
            <h3 className={styles.productTitle}>Productos a aplicar</h3>
                <ItemList
                    items={items}
                    displayKeys={["title", "description"]}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={false}
                />
            </div>
            
            {user?.roles.includes(Roles.Aplicador)?
                <div className={styles.buttonContainer}>
                    <button className={`button button-primary ${styles.button}`} onClick={handleConfirm}>Confirmar</button>
                </div>
            :
                <div className={styles.buttonContainer}>
                    <button 
                        className={`button button-danger ${styles.button}`} 
                        onClick={handleEliminar}
                    >
                        Eliminar
                    </button>
                    <button 
                        className={`button button-primary ${styles.button}`} 
                        onClick={handleModificar}
                    >
                        Modificar
                    </button>
                </div>
            }
            
            <GenericModal
                isOpen={confirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                title="Aplicación Iniciada"
                modalText={`Se inició la aplicacion correctamente`}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
            </div>
            <Footer />
        </div>
    );
}

