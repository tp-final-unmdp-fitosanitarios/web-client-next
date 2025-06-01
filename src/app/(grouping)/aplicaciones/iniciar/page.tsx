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
// import LoaderGlobal from "@/components/Loader/LoaderGlobal";

// MOCK DE DATOS
const mockAplicacion: AplicacionResponse = {
    id: "1",
    companyId: "Empresa123",
    locationId: "Campo Norte",
    status: EstadoAplicacion.Pendiente,
    createdAt: new Date(),
    updatedAt: new Date(),
    externalId: "Lote 5",
    surface: 100,
    type: "Soja",
    applicatorId: "Aplicador1",
    engineerId: "Ingeniero1",
    recipe: {
        type: "ENGINEER_RECIPE",
        recipeItems: [
            { productId: "prod1", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L1A" },
            { productId: "prod2", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L2B" },
            { productId: "prod3", amount: 20, unit: Unidad.Kilogramos, doseType: "SURFACE", lotNumber: "L3C" }
        ]
    },
    actualApplication: {
        type: "ENGINEER_RECIPE",
        recipeItems: [
            { productId: "prod1", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L1A" },
            { productId: "prod2", amount: 20, unit: Unidad.Litros, doseType: "SURFACE", lotNumber: "L2B" },
            { productId: "prod3", amount: 20, unit: Unidad.Kilogramos, doseType: "SURFACE", lotNumber: "L3C" }
        ]
    }
};

export default function IniciarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");
    const [aplicacion, setAplicacion] = useState<AplicacionResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // 2. Hacer el fetch de la aplicación (descomenta y adapta cuando tengas la API lista)
    /*
    useEffect(() => {
        if (!applicationId) return;
        setLoading(true);
        fetch(`/api/applications/${applicationId}`)
            .then(res => res.json())
            .then(data => {
                setAplicacion(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [applicationId]);
    */

    useEffect(() => {
        // Simula un fetch con mock
        setTimeout(() => {
            setAplicacion(mockAplicacion);
            setLoading(false);
        }, 500); // medio segundo de delay para simular carga
    }, [applicationId]);

    if (loading) 
        // return <LoaderGlobal />; // Descomenta esta línea para usar el loader global
        return <div>Cargando...</div>; // Elimina esta línea cuando uses el loader global
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const campo = aplicacion.locationId;
    const lote = aplicacion.externalId;
    const cultivo = aplicacion.type;
    const fecha = new Date(aplicacion.createdAt).toLocaleDateString();

    const productos = aplicacion.recipe.recipeItems.map((item, idx) => ({
        id: idx,
        title: `Producto ${idx + 1}`,
        description: `${item.unit.toLowerCase()} x ${item.amount}${item.unit} - ${item.doseType === "SURFACE" ? item.amount + "/Ha" : item.amount}`
    }));

    return (
        <div className={styles.iniciarAplicacionContainer}>
            <MenuBar showMenu={true} />
            <div className={styles.iniciarHeader}>Aplicacion a realizar</div>
            <div className={styles.container}>
            <div className={styles.iniciarInfo}>
                <div>Locacion: {campo}</div>
                <div>Lote: {lote}</div>
                <div>Cultivo: {cultivo}</div>
                <div>Fecha: {fecha}</div>
            </div>
            <h3 className={styles.productTitle}>Productos a aplicar</h3>
                <ItemList
                    items={productos.map(p => ({
                        id: p.id.toString(),
                        title: p.title,
                        description: p.description
                    }))}
                    displayKeys={["title", "description"]}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={false}
                />
            </div>
            <button className={"button button-primary"} style={{ marginBottom: 24 }}>Confirmar</button>
            
            <Footer />
        </div>
    );
}

