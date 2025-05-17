/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import NavigationLink from "@/components/NavigationLink/NavigationLink";
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
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";
import { sortAlphabeticallyUnique } from "@/utilities/sort";

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
    const { withLoading } = useLoading();
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

    useEffect(() => {
        console.log('isReady changed:', isReady);
        if (!isReady) return;
        
        let isMounted = true;
        const fetchData = async () => {
            try {
                console.log('Fetching locations...');
                const response = await withLoading(
                    apiService.get<Locacion[]>('/locations?type=WAREHOUSE&type=FIELD'),
                    "Cargando ubicaciones..."
                );
                console.log('Locations response:', response);
                if (response.success && isMounted) {
                    const locations = response.data as Locacion[];
                    const sortedLocations = sortAlphabeticallyUnique(locations, 'name', 'id');
                    console.log('Locations loaded:', sortedLocations);
                    setLocations(sortedLocations);
                    if (sortedLocations.length > 0) {
                        setActualLocation(sortedLocations[0].id);
                    }
                } else if (isMounted) {
                    console.error('Error loading locations:', response.error);
                    setError(response.error || "Error al obtener las ubicaciones");
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error in fetchLocations:', err);
                    setError("Error al conectar con el servidor: " + err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [isReady]);

    useEffect(() => {
        if (!isReady || !actualLocation) return;
        
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await withLoading(
                    apiService.get<ResponseItems<Stock>>(`stock?location=${actualLocation}`),
                    "Cargando stock..."
                );
                if (response.success && isMounted) {
                    const stock = response.data.content;
                    setStockFromServer(stock);
                } else if (isMounted) {
                    setError(response.error || "Error al obtener el stock");
                }
            } catch (err) {
                if (isMounted) {
                    setError("Error al conectar con el servidor: " + err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [actualLocation, isReady]);

    const {
        items: stock,
        deletedItems,
        isModalOpen,
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

    if (error) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Error: {error}</div>
            </div>
        );
    }

    const options = Array.from(
        new Set(locations?.map((l) => l.name))
    ).map(name => ({ label: name }));

    return (
        <div className="page-container">
            <div className="content-wrap">
            <MenuBar showMenu={true} path="" />
            <h1 className={styles.title}>Gestión de Stock</h1>

            {options.length > 0 && (
                <Autocomplete
                    disablePortal
                    options={options}
                    defaultValue={options[0]}
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
                        const selectedLocation = locations.find(l => l.name === newValue.label);
                        if (selectedLocation) {
                            setActualLocation(selectedLocation.id);
                        }
                      }
                    }}
                    sx={{ width: 300, margin: '0 auto', marginBottom: '10px' }}
                    className=""
                />
            )}

            {loading ? (
                <div>Cargando stock...</div>
            ) : items.length > 0 ? (
                <ItemList
                    items={items}
                    displayKeys={campos}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={false}
                />
            ) : (
                <h3 className={styles.title}>No hay elementos en el stock para esta ubicación</h3>
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
                    <NavigationLink key={index} href={button.path}>
                        <button className={`button button-primary ${styles.buttonHome}`}>
                            {button.label}
                        </button>
                    </NavigationLink>
                ))}
            </div>
            </div>
            <Footer />
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