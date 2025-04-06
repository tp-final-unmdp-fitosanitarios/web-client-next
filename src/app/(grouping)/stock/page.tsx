"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import Link from "next/link";
import styles from "./stock-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import { Stock } from "@/domain/models/Stock";
import GenericModal from "@/components/modal/GenericModal";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Locacion } from "@/domain/models/Locacion";
import { Autocomplete, TextField } from "@mui/material";
import { useAuth } from "@/components/Auth/AuthProvider";


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
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [actualLocation, setActualLocation] = useState<string>("");
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();

    const fetchLocations = async (): Promise<void> => {
        try {
            const response = await apiService.get<Locacion[]>("/locations?type=ZONE");
            const locaciones = response.data;

            setLocations(locaciones);
            if (locaciones.length > 0) {
                setActualLocation(locaciones[0].id); // Set the first location as the default
            }
        } catch (e: any) {
            console.log(e.message);
            setLocations([]); // Handle connection or forbidden errors
        }
    };

    const fetchStock = async (locationId: string) => {
        try {
            const response = await apiService.get<ResponseItems<Stock>>(
                `stock?size=2&page=1&location=${locationId}`
            );
            if (response.success) {
                const stock = response.data.content;
                setStockFromServer(stock);
            } else {
                setError(response.error || "Error al obtener el stock");
            }
        } catch (err) {
            setError("Error al conectar con el servidor: " + err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(!isReady) return; // Esperar a que el contexto esté listo
        fetchLocations();
    }, [isReady]);

    useEffect(() => {
        if(!isReady) return;
        if (actualLocation) {
            fetchStock(actualLocation);
        }
    }, [actualLocation,isReady]);

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

    const options = locations.map((l) => ({ label: l.name }));
    
    return (
        <div className="page-container">
            <MenuBar showMenu={true} path="" />
            <h1 className={styles.title}>Stock</h1>

            <Autocomplete
                disablePortal
                options={options}
                renderInput={(params) => <TextField {...params} label="Locacion" required/>}
                onChange={(e) => setActualLocation((e.target as HTMLInputElement).value)}
                sx={{ width: 300 }}
                className=""
            />

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
                <h3 className={styles.title}>No hay elementos en el stock</h3>
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