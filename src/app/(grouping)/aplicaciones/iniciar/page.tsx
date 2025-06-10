"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { AplicacionResponse } from "@/domain/models/AplicacionResponse";
import { EstadoAplicacion } from "@/domain/enum/EstadoAplicacion";
import { Unidad } from "@/domain/enum/Unidad";
import styles from "./iniciarAplicaciones-view.module.scss";
import Footer from "@/components/Footer/Footer";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Maquina } from "@/domain/models/Maquina";
import ModalElegirMaquina from "@/components/ModalElegirMaquina/ModalElegirMaquina";
import GenericModal from "@/components/modal/GenericModal";
import { useRouter } from 'next/navigation';
// import LoaderGlobal from "@/components/Loader/LoaderGlobal";


export default function IniciarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [loading, setLoading] = useState(true);
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const router = useRouter();

    

    const fetchApplication = async () => {
        try {
            const response = await apiService.get<Aplicacion>(`applications/${applicationId}`);
            setAplicacion(response.data);
            setLoading(false);
        } catch (e: any) {
            console.error("Error en la solicitud:", e.message);
            return null;
        }
    }

   useEffect(() => {
        if(!isReady) return;

        fetchApplication();
        
    }, [applicationId,isReady]);
    /*useEffect(() => {
        // Simula un fetch con mock

        setTimeout(() => {
            setAplicacion(mockAplicacion);
            setLoading(false);
        }, 500); // medio segundo de delay para simular carga
    }, [applicationId]);*/



    if (loading) 
        // return <LoaderGlobal />; // Descomenta esta línea para usar el loader global
        return <div>Cargando...</div>; // Elimina esta línea cuando uses el loader global
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const cultivo = aplicacion.location_id;
    const fecha = new Date(aplicacion.created_at).toLocaleDateString();

    const productos = aplicacion.recipe?.recipe_items?.map((item) => ({
        id: item.product_id,
        title: `${item.product_id+ 1}`,
        description: `${item.amount}${item.unit}${item.dose_type === "SURFACE" ? " - "+item.amount + "/Ha" : item.amount}`
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

    const handleConfirm = () => {
            const req = {
                "status":"IN_PROGRESS"
            }
           apiService.create(`applications/${aplicacion?.id}/status`,req).then(
            (res)=>{
                if(res.status === 0)
                    setConfirmationModalOpen(true);
                else
                    alert("Error al inicar la aplicación");
            }
            );
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
            <MenuBar showMenu={false} showArrow={true} path="/aplicaciones"/>
            <div className={styles.iniciarHeader}>Aplicacion a realizar</div>
            <div className={styles.container}>
            <div className={styles.iniciarInfo}>
                <div>Cultivo: {cultivo}</div>
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
            <div className={styles.buttonContainer}>
                <button className={`button button-primary ${styles.button}`} onClick={handleConfirm}>Confirmar</button>
            </div>
            
            <GenericModal
                isOpen={confirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                title="Aplicació Iniciada"
                modalText={`Se inició la aplicacion correctamente`}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
            </div>
            <Footer />
        </div>
    );
}

