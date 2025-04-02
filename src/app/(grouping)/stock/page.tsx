"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import Link from "next/link";
import styles from "./stock-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import { Stock } from "@/domain/models/Stock";
import GenericModal from "@/components/modal/GenericModal";
import { apiService } from "@/services/api-service";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";


const buttons = [
    { label: "Agregar", path: "/stock/agregar" },
    { label: "Mover", path: "/stock/mover" },
    { label: "Retirar", path: "/stock/retirar" },
    { label: "Ver Movimientos", path: "/stock/movimientos" },
    { label: "Proveedores", path: "/stock/proveedores" },
];

export default function StockView() {
    const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchStock = async () => {//To do: ver porque falla la peticion
            try {
                const response = await apiService.get<ResponseItems<Stock>>('stock');
                if (response.success) {
                    const stock = response.data.content;
                    setStockFromServer(stock);
                } else {
                    setError(response.error || "Error al obtener el stock");
                }
            } catch (err) {
                setError("Error al conectar con el servidor" + err);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, []);

    const {
        items: stock,  // Usamos los datos mockeados como base
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(stockFromServer);

    const items = transformToItems(stock, "id", ["producto", "amount", "location"]);
    const campos = ["producto", "amount", "location"];

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


    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Cargando...</div>
            </div>
        );
    }
    //
    if (error) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Error: {error}</div>
            </div>
        );
    }

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
                    selectItems={true}
                    deleteItems={false}
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