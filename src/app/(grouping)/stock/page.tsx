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
import StockDetailsModal from "@/components/StockDetailsModal/StockDetailsModal";
import { Roles } from "@/domain/enum/Roles";
import { Producto } from "@/domain/models/Producto";

export default function StockView() {
    const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [actualLocation, setActualLocation] = useState<string>("");
    const [showMoverModal, setShowMoverModal] = useState(false);
    const [showRetirarModal, setShowRetirarModal] = useState(false);
    const { getApiService, isReady, user } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    const [selectedStockItem, setSelectedStockItem] = useState<Stock | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchParams, setSearchParams] = useState({
        productId: "",
        lotNumber: "",
        expirationBefore: "",
        expirationAfter: ""
    });
    const [products, setProducts] = useState<Producto[]>([]);
    const [activeSearchParams, setActiveSearchParams] = useState(searchParams);

    const isAdmin = user?.roles.includes(Roles.Admin);
    const isAplicador = user?.roles.includes(Roles.Aplicador);

    const adminButtons = [
        { label: "Agregar", path: "/stock/agregar" },
        { label: "Ver Movimientos", path: "/stock/movimientos" },
        { label: "Proveedores", path: "/stock/proveedores" }
    ];

    const aplicadorButtons = [
        { label: "Mover", action: () => setShowMoverModal(true) },
        { label: "Retirar", action: () => setShowRetirarModal(true) },
        { label: "Agregar", path: "/stock/agregar" },
    ];

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
        if (!isReady) return;
        
        let isMounted = true;
        const fetchProducts = async () => {
            try {
                const response = await withLoading(
                    apiService.get<ResponseItems<Producto>>('/products'),
                    "Cargando productos..."
                );
                if (response.success && isMounted) {
                    setProducts(response.data.content);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching products:', err);
                }
            }
        };

        fetchProducts();
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
                const queryParams = new URLSearchParams();
                queryParams.append('location', actualLocation);
                
                if (activeSearchParams.productId) {
                    queryParams.append('product', activeSearchParams.productId);
                }
                if (activeSearchParams.lotNumber) {
                    queryParams.append('lot_number', activeSearchParams.lotNumber);
                }
                if (activeSearchParams.expirationBefore) {
                    const date = new Date(activeSearchParams.expirationBefore);
                    queryParams.append('expiration_before', date.toISOString());
                }
                if (activeSearchParams.expirationAfter) {
                    const date = new Date(activeSearchParams.expirationAfter);
                    queryParams.append('expiration_after', date.toISOString());
                }

                const response = await withLoading(
                    apiService.get<ResponseItems<Stock>>(`stock?${queryParams.toString()}`),
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
    }, [actualLocation, isReady, activeSearchParams]);

    const {
        items: stock,
        deletedItems,
        isModalOpen,
        closeModal,
    } = useItemsManager(stockFromServer);

    let displayStock: any[] = [];
    if (stock.length > 0) {
        displayStock = stock
            .filter(item => item.amount > 0)
            .map((item) => {
                return {
                    id: item.id,
                    producto: item.product?.name || '',
                    amount: item.amount,
                    unit: item.unit || '',
                    lot_number: item.lot_number || '',
                    expiration_date: item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : ''
                };
            });
    }

    const items = transformToItems(displayStock, "id", ["producto", "amount", "unit", "lot_number", "expiration_date"]).map((item) => {
        return {
            ...item,
            display: `${item.producto}: ${item.amount}${item.unit} - Lote: ${item.lot_number} - Vencimiento: ${item.expiration_date}`,
        };
    });

    const campos = ["display"];

    const modalText = deletedItems.length > 0
        ? `Se han eliminado los siguientes productos del stock:\n${deletedItems.map((s) => s.product.name).join("\n")}`
        : "";

    const handleItemClick = (id: string) => {
        const stockItem = stockFromServer.find(item => item.id === id);
        if (stockItem) {
            setSelectedStockItem(stockItem);
            setShowDetailsModal(true);
        }
    };

    const handleSearch = () => {
        setActiveSearchParams(searchParams);
    };

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
    ).sort().map(name => ({ label: name }));

    return (
        <div className="page-container">
            <div className="content-wrap">
            <MenuBar showMenu={true} path="" />
            <h1 className={styles.title}>Gestión de Stock</h1>

            <div className={styles.searchForm}>
                <div className={styles.searchRow}>
                    <Autocomplete
                        disablePortal
                        options={options}
                        value={options.find(option => option.label === locations.find(l => l.id === actualLocation)?.name) || null}
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
                        sx={{ width: '100%' }}
                    />
                    <Autocomplete
                        disablePortal
                        options={products.map(p => ({ label: p.name, id: p.id }))}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Producto"
                                sx={{...customInputSx}}
                            />
                        )}
                        onChange={(e, newValue) => {
                            setSearchParams(prev => ({
                                ...prev,
                                productId: newValue?.id || ""
                            }));
                        }}
                        sx={{ width: '100%' }}
                    />
                    <TextField
                        label="Número de Lote"
                        value={searchParams.lotNumber}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            lotNumber: e.target.value
                        }))}
                        sx={{...customInputSx, width: '100%'}}
                    />
                </div>
                <div className={styles.searchRow}>
                    <TextField
                        label="Vencimiento Desde"
                        type="date"
                        value={searchParams.expirationAfter}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            expirationAfter: e.target.value
                        }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{...customInputSx, width: '100%'}}
                    />
                    <TextField
                        label="Vencimiento Hasta"
                        type="date"
                        value={searchParams.expirationBefore}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            expirationBefore: e.target.value
                        }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{...customInputSx, width: '100%'}}
                    />
                    <button 
                        className={`button button-primary ${styles.searchButton}`}
                        onClick={handleSearch}
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {loading ? (
                <div>Cargando stock...</div>
            ) : items.length > 0 ? (<div>
                <h3 className={styles.informationText}> Stock disponible en locacion: {locations.find(l => l.id === actualLocation)?.name}</h3>
                <ItemList
                    items={items}
                    displayKeys={campos}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={true}
                    onSelectSingleItem={handleItemClick}
                />
                </div>
            ) : (
                <h3 className={styles.title}>No hay elementos en el stock para esta ubicación</h3>
            )}

            <div className={styles.buttonContainer}>
                {isAdmin ? (
                    <>
                        {adminButtons.map((button, index) => (
                            <NavigationLink key={index} href={button.path}>
                                <button className={`button button-primary ${styles.buttonHome}`}>
                                    {button.label}
                                </button>
                            </NavigationLink>
                        ))}
                    </>
                ) : isAplicador ? (
                    <>
                        {aplicadorButtons.map((button, index) => (
                            button.action ? (
                                <button
                                    key={index}
                                    className={`button button-primary ${styles.buttonHome}`}
                                    onClick={button.action}
                                >
                                    {button.label}
                                </button>
                            ) : (
                                <NavigationLink key={index} href={button.path}>
                                    <button className={`button button-primary ${styles.buttonHome}`}>
                                        {button.label}
                                    </button>
                                </NavigationLink>
                            )
                        ))}
                    </>
                ) : null}
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
            <StockDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                stockItem={selectedStockItem}
            />
        </div>
    );
}