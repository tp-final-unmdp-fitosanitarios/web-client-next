"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { EstadoAplicacion } from "@/domain/enum/EstadoAplicacion";
import { Unidad } from "@/domain/enum/Unidad";
import styles from "./finalizarAplicaciones-view.module.scss";
import Footer from "@/components/Footer/Footer";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Maquina } from "@/domain/models/Maquina";
import GenericModal from "@/components/modal/GenericModal";
import { useRouter } from 'next/navigation';

// MOCK DE DATOS
const mockAplicacion: Aplicacion = {
    id: "1",
    status: EstadoAplicacion.EnCurso,
    location_id: "Campo Norte",
    created_at: new Date(),
    unidad: Unidad.Litros,
    cantidad: 100,
    surface: 100,
    aplicadorId: "Aplicador1",
    engineer_id: "Ingeniero1",
    recipe: {
        type: "ENGINEER_RECIPE",
        recipeItems: [
            { productId: "prod1", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L1A" },
            { productId: "prod2", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L2B" },
            { productId: "prod3", amount: 20, unit: Unidad.Kilogramos, doseType: "SURFACE", lotNumber: "L3C" }
        ]
    },
    actual_application: {
        id: "1-actual",
        status: EstadoAplicacion.EnCurso,
        location_id: "Campo Norte",
        created_at: new Date(),
        unidad: Unidad.Litros,
        cantidad: 100,
        surface: 100,
        aplicadorId: "Aplicador1",
        engineer_id: "Ingeniero1",
        recipe: {
            type: "ENGINEER_RECIPE",
            recipeItems: [
                { productId: "prod1", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L1A" },
                { productId: "prod2", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L2B" },
                { productId: "prod3", amount: 20, unit: Unidad.Kilogramos, doseType: "SURFACE", lotNumber: "L3C" }
            ]
        },
        actual_application: undefined as any
    }
};

export default function FinalizarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
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

    const handleFinalizarAplicacion = async () => {
        if (aplicacion) {
            try {
                const req = {
                    "status": "COMPLETED"
                }
                await apiService.create(`applications/${aplicacion.id}/status`, req);
                setConfirmationModalOpen(true);
            } catch (e: any) {
                console.error("Error al finalizar la aplicación:", e.message);
            }
        }
    }

    useEffect(() => {
        // Simula un fetch con mock
        setTimeout(() => {
            setAplicacion(mockAplicacion);
            setLoading(false);
        }, 500);
    }, [applicationId]);

    if (loading) 
        return <div>Cargando...</div>;
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const cultivo = aplicacion.location_id;
    const fecha = new Date(aplicacion.created_at).toLocaleDateString();

    const productos = aplicacion.recipe?.recipeItems?.map((item) => ({
        id: item.productId,
        title: `Producto ${item.productId + 1}`,
        description: `${item.unit.toLowerCase()} x ${item.amount}${item.unit} - ${item.doseType === "SURFACE" ? item.amount + "/Ha" : item.amount}`
    }));

    const items = productos.map(p => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description
    }));

    function handleCloseConfirmationModal(): void {
        setConfirmationModalOpen(false);
        router.push("/aplicaciones");
    }

    return (
        <div className={styles.finalizarAplicacionContainer}>
            <div className="content-wrap">
            <MenuBar showMenu={false} showArrow={true} path="/aplicaciones"/>
            <div className={styles.finalizarHeader}>Aplicación en progreso</div>
            <div className={styles.container}>
                <div className={styles.finalizarInfo}>
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
            </div>
            <button 
                className={`button button-primary ${styles.button}`}  
                onClick={handleFinalizarAplicacion}
            >
                Finalizar
            </button>
            
            <Footer />

            <GenericModal
                isOpen={confirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                title="Aplicación Finalizada"
                modalText="La aplicación ha sido finalizada exitosamente"
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    </div>
    );
}
