/* eslint-disable @typescript-eslint/no-explicit-any */
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
import MoverStockModal from "@/components/MoverStockModal/MoverStockModal";
import RetirarStockModal from "@/components/RetirarStockModal/RetirarStockModal";

const buttons = [
    { label: "Agregar", path: "/stock/agregar" },
    { label: "Ver Movimientos", path: "/stock/movimientos" },
    { label: "Proveedores", path: "/stock/proveedores" },
];

export default function StockView() {
    const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [actualLocation, setActualLocation] = useState<string>("");
    const [showMoverModal, setShowMoverModal] = useState(false);
    const [showRetirarModal, setShowRetirarModal] = useState(false);
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();

    const customInputSx = {
        '& .MuiInputBase-root': {
            borderRadius: '10px',
            backgroundColor: '#e6ebea',
            paddingX: 1,
            fontWeight: 'bold',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
            borderWidth: '2px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#404e5c',
        },
        '&.Mui-focused .MuiInputLabel-root': {
            color: '#404e5c',
        },
    };


    const fetchLocations = async (): Promise<void> => {
        try {
            const response = await apiService.get<Locacion[]>("/locations?type=WAREHOUSE&type=FIELD");
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
                `stock?location=${locationId}`
            );
            if (response.success) {
                const stock = response.data.content;
                console.log(stock);
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
        if (!isReady) return; // Esperar a que el contexto esté listo
        fetchLocations();
    }, [isReady]);

    useEffect(() => {
        if (!isReady) return;
        if (actualLocation) {
            fetchStock(actualLocation);
        }
    }, [actualLocation, isReady]);

    const {
        items: stock,  // Usamos los datos mockeados como base
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(stockFromServer);


    let displayStock: any[] = [];
    if (stock.length > 0) {
        displayStock = stock.map((item) => {
            return {
                id: item.id,
                producto: item.product?.name || '',
                amount: item.amount,
                unit: item.unit || ''
            };
        });
    }

    const items = transformToItems(displayStock, "id", ["producto", "amount", "unit"]).map((item) => {
            return {
                ...item,
                display: `${item.producto} : ${item.amount}${item.unit}`,
            };
            });

    const campos = ["display"];


    const modalText = deletedItems.length > 0
        ? `Se han eliminado los siguientes productos del stock:\n${deletedItems.map((s) => s.product.name).join("\n")}`
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
                defaultValue={locations[0]?.name ? {label: locations[0].name} : null}
                renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Locación"
                      required
                      sx={{...customInputSx}}
                    />
                  )}
                onChange={(e, newValue) => {
                  if (newValue) {
                    setActualLocation(locations.find(l => l.name === newValue.label)?.id || '');
                  }
                }}
                sx={{ width: 300, margin: '0 auto', marginBottom: '10px' }}
                className=""
            />

            {items.length > 0 ? (
                <ItemList
                    items={items}
                    displayKeys={campos}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={false}
                />
            ) : (
                <h3 className={styles.title}>No hay elementos en el stock</h3>
            )}

            <div className={styles.buttonContainer}>
                <button
                    className={`button button-primary ${styles.buttonHome}`}
                    onClick={() => setShowMoverModal(true)}
                >
                    Mover
                </button>
                <button
                    className={`button button-primary ${styles.buttonHome}`}
                    onClick={() => setShowRetirarModal(true)}
                >
                    Retirar
                </button>
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

            {showMoverModal && (
                <MoverStockModal onClose={() => setShowMoverModal(false)} />
            )}
            {showRetirarModal && (
                <RetirarStockModal onClose={() => setShowRetirarModal(false)} />
            )}
        </div>
    );
}