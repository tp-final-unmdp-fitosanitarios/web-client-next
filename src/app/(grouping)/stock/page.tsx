"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import Link from "next/link";
import styles from "./stock-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import { TipoLocacion } from "@/domain/enum/TipoLocacion";
import { Locacion } from "@/domain/models/Locacion";
import { Producto } from "@/domain/models/Producto";
import { Stock } from "@/domain/models/Stock";
import GenericModal from "@/components/modal/GenericModal";
// Para backend: import { useEffect } from "react";
// Para backend: import { apiService } from "@/services/api-service";

const productos: Producto[] = [
    { id: 1, nombre: "Glifosato 48%", unidad: "LITROS", cantidad: 20, marca: "AgroChem SA", descripcion: "Herbicida sistémico para el control de malezas." },
    { id: 2, nombre: "Clorpirifos 48%", unidad: "LITROS", cantidad: 15, marca: "Campo Verde Ltda", descripcion: "Insecticida organofosforado de amplio espectro." },
    { id: 3, nombre: "Atrazina 90%", unidad: "KILOGRAMOS", cantidad: 10, marca: "AgroSolutions", descripcion: "Herbicida selectivo para cultivos de maíz y sorgo." },
    { id: 4, nombre: "Metomilo 20%", unidad: "LITROS", cantidad: 25, marca: "FertiAgro", descripcion: "Insecticida de contacto y acción translaminar." },
    { id: 5, nombre: "2,4-D Amina", unidad: "LITROS", cantidad: 30, marca: "GreenField", descripcion: "Herbicida selectivo para cultivos de cereales y pasturas." },
    { id: 6, nombre: "Carbendazim 50%", unidad: "KILOGRAMOS", cantidad: 12, marca: "AgroBio", descripcion: "Fungicida sistémico para control de enfermedades foliares." }
];

const locaciones: Locacion[] = [
    { id: 1, direccion: "Yanquetruz 123", superficie: "50 Ha", tipo: TipoLocacion.Campo },
    { id: 2, direccion: "Tres Marias 456", superficie: "75 Ha", tipo: TipoLocacion.Campo },
    { id: 3, direccion: "Estancia La Pampa", superficie: "100 Ha", tipo: TipoLocacion.Campo },
    { id: 4, direccion: "Depósito Central", superficie: "500 m²", tipo: TipoLocacion.Campo },
    { id: 5, direccion: "Sucursal Norte", superficie: "300 m²", tipo: TipoLocacion.Campo }
];

const initialStock: Stock[] = [
    { id: 1, ultima_modificacion: new Date(), campo: locaciones[0], producto: productos[0], cantidad: 150 },
    { id: 2, ultima_modificacion: new Date(), campo: locaciones[1], producto: productos[1], cantidad: 20 },
    { id: 3, ultima_modificacion: new Date(), campo: locaciones[2], producto: productos[2], cantidad: 50 },
    { id: 4, ultima_modificacion: new Date(), campo: locaciones[3], producto: productos[3], cantidad: 70 },
    { id: 5, ultima_modificacion: new Date(), campo: locaciones[4], producto: productos[4], cantidad: 2 },
];

const buttons = [
    { label: "Agregar", path: "/stock/agregar" },
    { label: "Mover", path: "/stock/mover" },
    { label: "Retirar", path: "/stock/retirar" },
    { label: "Ver Movimientos", path: "/stock/movimientos" },
    { label: "Proveedores", path: "/stock/proveedores" },
];

export default function StockView() {
    // Para backend: const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
    // Para backend: const [loading, setLoading] = useState<boolean>(true);
    // Para backend: const [error, setError] = useState<string>("");

    // Para backend: useEffect(() => {
    //     const fetchStock = async () => {
    //         try {
    //             const response = await apiService.get<Stock[]>('stock');
    //             if (response.success) {
    //                 setStockFromServer(response.data);
    //             } else {
    //                 setError(response.error || "Error al obtener el stock");
    //             }
    //         } catch (err) {
    //             setError("Error al conectar con el servidor");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchStock();
    // }, []);

    const {
        items: stock,  // Usamos los datos mockeados como base
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(initialStock); // Para backend: pasar stockFromServer en lugar de initialStock

    const items = transformToItems(stock, "id", ["producto", "cantidad", "campo"]);
    const campos = ["producto", "cantidad", "campo"];

    // Para backend: agregar esta función para sincronizar eliminaciones con el servidor
    // const handleQuitarItems = async () => {
    //     try {
    //         const response = await apiService.delete('stock', { ids: selectedIds });
    //         if (response.success) {
    //             quitarItems(); // Solo llamamos a quitarItems si la eliminación en el backend es exitosa
    //         } else {
    //             alert("Error al eliminar items del stock");
    //         }
    //     } catch (err) {
    //         alert("Error al conectar con el servidor");
    //     }
    // };

    const modalText = deletedItems.length > 0
        ? `Se han eliminado los siguientes productos del stock:\n${deletedItems.map((s) => s.producto.nombre).join("\n")}`
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
            <h1 className={styles.title}>Stock</h1>

            {items.length > 0 ? (
                <ItemList
                    items={items}
                    displayKeys={campos}
                    onSelect={toggleSelectItem}
                    selectedIds={selectedIds}
                />
            ) : (
                <p>No hay elementos en el stock</p>
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
                title="Stock Eliminado"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
}