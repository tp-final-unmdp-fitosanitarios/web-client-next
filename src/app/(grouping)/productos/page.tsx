"use client";
import styles from "./productos-view.module.scss";
import Link from "next/link";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { Producto } from "@/domain/models/Producto";
import { transformToItems } from "@/utilities/transform";
import { useItemsManager } from "@/hooks/useItemsManager";
import GenericModal from "@/components/modal/GenericModal";
// Para backend: import { useEffect, useState } from "react";
// Para backend: import { apiService } from "@/services/api-service";

const initialProductos: Producto[] = [
    {
        id: 1,
        nombre: "Glifosato 48%",
        unidad: "LITROS",
        cantidad: 20,
        marca: "AgroChem SA",
        descripcion: "Herbicida sistémico para el control de malezas."
    },
    {
        id: 2,
        nombre: "Clorpirifos 48%",
        unidad: "LITROS",
        cantidad: 15,
        marca: "Campo Verde Ltda",
        descripcion: "Insecticida organofosforado de amplio espectro."
    },
    {
        id: 3,
        nombre: "Atrazina 90%",
        unidad: "KILOGRAMOS",
        cantidad: 10,
        marca: "AgroSolutions",
        descripcion: "Herbicida selectivo para cultivos de maíz y sorgo."
    },
    {
        id: 4,
        nombre: "Metomilo 40%",
        unidad: "LITROS",
        cantidad: 5,
        marca: "Fertichem",
        descripcion: "Insecticida y acaricida de acción rápida."
    },
    {
        id: 5,
        nombre: "2,4-D Amina 72%",
        unidad: "LITROS",
        cantidad: 25,
        marca: "AgroBioTech",
        descripcion: "Herbicida hormonal para control de malezas de hoja ancha."
    },
    {
        id: 6,
        nombre: "Carbendazim 50%",
        unidad: "KILOGRAMOS",
        cantidad: 8,
        marca: "GreenField Agro",
        descripcion: "Fungicida sistémico para enfermedades de cultivos."
    },
    {
        id: 7,
        nombre: "Paraquat 20%",
        unidad: "LITROS",
        cantidad: 12,
        marca: "RuralQuim",
        descripcion: "Herbicida no selectivo de contacto."
    },
    {
        id: 8,
        nombre: "Cipermetrina 25%",
        unidad: "LITROS",
        cantidad: 18,
        marca: "PampaAgro",
        descripcion: "Insecticida piretroide para control de plagas."
    },
    {
        id: 9,
        nombre: "Mancozeb 80%",
        unidad: "KILOGRAMOS",
        cantidad: 15,
        marca: "EcoAgro",
        descripcion: "Fungicida protector de amplio espectro."
    },
    {
        id: 10,
        nombre: "Tebuconazol 25%",
        unidad: "LITROS",
        cantidad: 10,
        marca: "BioCrop Solutions",
        descripcion: "Fungicida sistémico para control de hongos."
    }
];

const buttons = [{ label: "Agregar", path: "/productos/agregar" }];

export default function ProductosView() {
    // Para backend: const [productosFromServer, setProductosFromServer] = useState<Producto[]>([]);
    // Para backend: const [loading, setLoading] = useState<boolean>(true);
    // Para backend: const [error, setError] = useState<string>("");

    // Para backend: useEffect(() => {
    //     const fetchProductos = async () => {
    //         try {
    //             const response = await apiService.get<Producto[]>('productos');
    //             if (response.success) {
    //                 setProductosFromServer(response.data);
    //             } else {
    //                 setError(response.error || "Error al obtener los productos");
    //             }
    //         } catch (err) {
    //             setError("Error al conectar con el servidor");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchProductos();
    // }, []);

    const {
        items: productos,  // Usamos los datos mockeados como base
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager<Producto>(initialProductos); // Para backend: pasar productosFromServer en lugar de initialProductos

    const items = transformToItems(productos, "id", ["nombre", "marca"]);
    const campos = ["nombre", "marca"];

    // Para backend: agregar esta función para sincronizar eliminaciones con el servidor
    // const handleQuitarItems = async () => {
    //     try {
    //         const response = await apiService.delete('productos', { ids: selectedIds });
    //         if (response.success) {
    //             quitarItems(); // Solo llamamos a quitarItems si la eliminación en el backend es exitosa
    //         } else {
    //             alert("Error al eliminar productos");
    //         }
    //     } catch (err) {
    //         alert("Error al conectar con el servidor");
    //     }
    // };

    const modalText =
        deletedItems.length > 0
            ? `Se han eliminado los siguientes productos:\n${deletedItems.map((p) => p.nombre).join("\n")}`
            : "";

    // Para backend: agregar manejo de loading y error
    // if (loading) {
    //     return (
    //         <div className="page-container">
    //             <MenuBar showMenu={true} path="" />
    //             <div>Cargando...</div>
    //         </div>
    //     );
    // }
    //
    // if (error) {
    //     return (
    //         <div className="page-container">
    //             <MenuBar showMenu={true} path="" />
    //             <div>Error: {error}</div>
    //         </div>
    //     );
    // }

    return (
        <div className="page-container">
            <MenuBar showMenu={true} path="" />
            <h1 className={styles.title}>Productos</h1>

            {items.length > 0 ? (
                <ItemList
                    items={items}
                    displayKeys={campos}
                    onSelect={toggleSelectItem}
                    selectedIds={selectedIds}
                />
            ) : (
                <p>No hay productos disponibles</p>
            )}

            <div className={styles.buttonContainer}>
                {selectedIds.length > 0 && (
                    <button
                        className={`button button-secondary ${styles.buttonHome}`}
                        onClick={quitarItems} // Para backend: usar handleQuitarItems en lugar de quitarItems
                    >
                        Quitar
                    </button>
                )}
                {buttons.map((button, index) => (
                    <Link key={index} href={button.path}>
                        <button className={`button button-primary ${styles.buttonHome}`}>
                            {button.label}
                        </button>
                    </Link>
                ))}
            </div>

            <GenericModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Productos Eliminados"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
}