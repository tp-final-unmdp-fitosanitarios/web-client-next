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
// import LoaderGlobal from "@/components/Loader/LoaderGlobal";

// MOCK DE DATOS
const mockAplicacion: Aplicacion = {
    id: "1",
    status: EstadoAplicacion.Pendiente,
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
        status: EstadoAplicacion.Pendiente,
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
        actual_application: undefined as any // o null si el tipo lo permite
    }
};

export default function IniciarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [openModalMaquina, setOpenModalMaquina] = useState(false);
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const [maquinas, setMaquinas] = useState<Maquina[]>([]);
    const [selectedMaquina, setSelectedMaquina] = useState<Maquina>();

    const fetchMaquinas = async () => {
        try {
            const response = await apiService.get<Maquina[]>("machines");
            setMaquinas(response.data);
        } catch (e: any) {
            console.error("Error al obtener las máquinas:", e.message);
            setMaquinas([]);
        }
    };

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

    const handleSelectMaquina = (maquina: Maquina) => {
        if(maquina)
            setSelectedMaquina(maquina);
        else
            console.log("Error al guardar la maquina");
    }

   /* useEffect(() => {
        if(!isReady) return;

        fetchApplication();
        
    }, [applicationId,isReady]);*/
    useEffect(() => {
        // Simula un fetch con mock
        fetchMaquinas();

        setTimeout(() => {
            setAplicacion(mockAplicacion);
            setLoading(false);
        }, 500); // medio segundo de delay para simular carga
    }, [applicationId]);



    if (loading) 
        // return <LoaderGlobal />; // Descomenta esta línea para usar el loader global
        return <div>Cargando...</div>; // Elimina esta línea cuando uses el loader global
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const cultivo = aplicacion.location_id;
    const fecha = new Date(aplicacion.created_at).toLocaleDateString();

    const productos = aplicacion.recipe?.recipeItems?.map((item) => ({
        id: item.productId,
        title: `Producto ${item.productId+ 1}`,
        description: `${item.unit.toLowerCase()} x ${item.amount}${item.unit} - ${item.doseType === "SURFACE" ? item.amount + "/Ha" : item.amount}`
    }));

    const items = productos.map(p => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description
    }))

    return (
        <div className={styles.iniciarAplicacionContainer}>
            <MenuBar showMenu={true} />
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
            <button className={"button button-primary"} style={{ marginBottom: 24 }} onClick={() => setOpenModalMaquina(true)}>Confirmar</button>
            
            <Footer />

            {openModalMaquina && (
                <ModalElegirMaquina
                    open={openModalMaquina}
                    setModalClose={() => setOpenModalMaquina(false)}
                    maquinas={maquinas}
                    handleSelectMaquina={handleSelectMaquina}
                />
            )}
        </div>
    );
}

