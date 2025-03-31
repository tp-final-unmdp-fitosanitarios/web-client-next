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
    { id: 1, name: "Glifosato 48%", unit: "LITROS", quantity: 20, brand: "AgroChem SA", description: "Herbicida sistémico para el control de malezas." },
    { id: 2, name: "Clorpirifos 48%", unit: "LITROS", quantity: 15, brand: "Campo Verde Ltda", description: "Insecticida organofosforado de amplio espectro." },
    { id: 3, name: "Atrazina 90%", unit: "KILOGRAMOS", quantity: 10, brand: "AgroSolutions", description: "Herbicida selectivo para cultivos de maíz y sorgo." },
    { id: 4, name: "Metomilo 20%", unit: "LITROS", quantity: 25, brand: "FertiAgro", description: "Insecticida de contacto y acción translaminar." },
    { id: 5, name: "2,4-D Amina", unit: "LITROS", quantity: 30, brand: "GreenField", description: "Herbicida selectivo para cultivos de cereales y pasturas." },
    { id: 6, name: "Carbendazim 50%", unit: "KILOGRAMOS", quantity: 12, brand: "AgroBio", description: "Fungicida sistémico para control de enfermedades foliares." }
];

const locaciones: Locacion[] = [
    { id: 1, name: "Deposito 1", addres: "Yanquetruz 123", area: "50 Ha", type: TipoLocacion.Campo, company_id:1 },
    { id: 2, name: "Deposito 2",addres: "Tres Marias 456", area: "75 Ha", type: TipoLocacion.Campo, company_id:1 },
    { id: 3, name: "Deposito 3",addres: "Estancia La Pampa", area: "100 Ha", type: TipoLocacion.Campo, company_id:1 },
    { id: 4, name: "Deposito 4",addres: "Depósito Central", area: "500 m²", type: TipoLocacion.Campo, company_id:1 },
    { id: 5, name: "Deposito 5",addres: "Sucursal Norte", area: "300 m²", type: TipoLocacion.Campo, company_id:1 }
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
        ? `Se han eliminado los siguientes productos del stock:\n${deletedItems.map((s) => s.producto.name).join("\n")}`
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