/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import NavigationLink from "@/components/NavigationLink/NavigationLink";
import styles from "./stock-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import { Stock } from "@/domain/models/Stock";
import { StockSummary } from "@/domain/models/StockSummary";
import GenericModal from "@/components/modal/GenericModal";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Locacion } from "@/domain/models/Locacion";
import { Autocomplete, TextField, Paper, Box, Typography, IconButton, Collapse, Grid } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
    const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [actualLocation, setActualLocation] = useState<string>("");
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
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
    const [filtrosExpandidos, setFiltrosExpandidos] = useState<boolean>(false);
    const [isShowingSummary, setIsShowingSummary] = useState<boolean>(true);
    const [selectedSummaryItem, setSelectedSummaryItem] = useState<any>(null);
    const [showSummaryDetailModal, setShowSummaryDetailModal] = useState(false);

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

    const engineerButtons = [
        { label: "Agregar", path: "/stock/agregar" },
        { label: "Ver Movimientos", path: "/stock/movimientos" },
        { label: "Proveedores", path: "/stock/proveedores" },
        { label: "Mover", action: () => setShowMoverModal(true) },
        { label: "Retirar", action: () => setShowRetirarModal(true) }
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



    // Cargar datos iniciales (resumen y ubicaciones)
    useEffect(() => {
        if (!isReady || initialLoadComplete) return;
        
        const loadInitialData = async () => {
            try {
                // Cargar resumen de stock
                const summaryResponse = await withLoading(
                    apiService.get<ResponseItems<StockSummary>>('stock/summary'),
                    "Cargando resumen de stock..."
                );
                
                if (summaryResponse.success) {
                    setStockSummary(summaryResponse.data.content);
                    setIsShowingSummary(true);
                } else {
                    setError(summaryResponse.error || "Error al obtener el resumen de stock");
                }

                // Cargar ubicaciones
                const locationsResponse = await withLoading(
                    apiService.get<Locacion[]>('/locations?type=WAREHOUSE&type=FIELD'),
                    "Cargando ubicaciones..."
                );
                
                if (locationsResponse.success) {
                    const locations = locationsResponse.data as Locacion[];
                    const sortedLocations = sortAlphabeticallyUnique(locations, 'name', 'id');
                    setLocations(sortedLocations);
                    // NO establecer actualLocation aquí - se mantiene vacío inicialmente
                } else {
                    setError(locationsResponse.error || "Error al obtener las ubicaciones");
                }

                setInitialLoadComplete(true);
            } catch (err) {
                setError("Error al conectar con el servidor: " + err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isReady, initialLoadComplete]);



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
        if (!isReady || !actualLocation || isShowingSummary) return;
        
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
    }, [actualLocation, isReady, activeSearchParams, isShowingSummary]);

    const {
        items: stock,
        deletedItems,
        isModalOpen,
        closeModal,
    } = useItemsManager(stockFromServer);

    // Procesar datos según si estamos mostrando resumen o stock específico
    let items: any[] = [];
    let campos: string[] = [];

    if (isShowingSummary) {
        // Procesar resumen de stock
        items = stockSummary.map((item) => ({
            ...item,
            id: item.product_id, // Necesario para identificar el item al clickear
            display: `${item.product_name} (${item.brand}) - ${item.amount} ${item.unit}${item.category ? " - " + item.category : ""}`,
            lotes: item.sum || []
        }));
        campos = ["display"];
    } else {
        // Procesar stock específico
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
                console.log("Stock from server:: ",stock);
                console.log("Stock to display:: ",displayStock);
        }

        items = transformToItems(displayStock, "id", ["producto", "amount", "unit", "lot_number", "expiration_date"]).map((item) => {
            return {
                ...item,
                display: `${item.producto}: ${item.amount}${item.unit} - Lote: ${item.lot_number} - Vencimiento: ${item.expiration_date}`,
            };
        });
        campos = ["display"];
    }

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

    const handleSummaryItemClick = (id: string) => {
        const summaryItem = stockSummary.find(item => item.product_id === id);
        if (summaryItem) {
            setSelectedSummaryItem(summaryItem);
            setShowSummaryDetailModal(true);
        }
    };

    const handleSearch = () => {
        // Si hay algún filtro aplicado, mostrar stock específico
        const hasFilters = searchParams.productId || searchParams.lotNumber || searchParams.expirationAfter || searchParams.expirationBefore;
        
        if (hasFilters) {
            setActiveSearchParams(searchParams);
            setIsShowingSummary(false);
        } else {
            // Si no hay filtros, mostrar resumen total
            handleShowSummary();
        }
    };

    const handleShowSummary = () => {
        setIsShowingSummary(true);
        setActiveSearchParams({
            productId: "",
            lotNumber: "",
            expirationBefore: "",
            expirationAfter: ""
        });
        setSearchParams({
            productId: "",
            lotNumber: "",
            expirationBefore: "",
            expirationAfter: ""
        });
        // Limpiar también la selección de ubicación para mostrar resumen total
        setActualLocation("");
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

            {/* Filtros */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="#404e5c">
                        Filtros de búsqueda
                    </Typography>
                    <IconButton
                        onClick={() => setFiltrosExpandidos(!filtrosExpandidos)}
                        size="small"
                    >
                        {filtrosExpandidos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={filtrosExpandidos}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Autocomplete
                                disablePortal
                                options={options}
                                value={actualLocation ? options.find(option => option.label === locations.find(l => l.id === actualLocation)?.name) || null : null}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Locación"
                                        sx={{...customInputSx}}
                                    />
                                )}
                                onChange={(e, newValue) => {
                                    if (newValue) {
                                        const selectedLocation = locations.find(l => l.name === newValue.label);
                                        if (selectedLocation) {
                                            setActualLocation(selectedLocation.id);
                                            // Al cambiar ubicación, mostrar stock específico de esa ubicación
                                            setIsShowingSummary(false);
                                        }
                                    } else {
                                        // Si se limpia la selección, volver al resumen
                                        setActualLocation("");
                                        setIsShowingSummary(true);
                                    }
                                }}
                                sx={{ width: '100%' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Autocomplete
                                disablePortal
                                options={products.map(p => ({ label: p.name, id: p.id }))}
                                value={products.find(p => p.id === searchParams.productId) ? 
                                    { label: products.find(p => p.id === searchParams.productId)?.name || '', 
                                      id: searchParams.productId } : null}
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
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Número de Lote"
                                value={searchParams.lotNumber}
                                onChange={(e) => setSearchParams(prev => ({
                                    ...prev,
                                    lotNumber: e.target.value
                                }))}
                                sx={{...customInputSx, width: '100%'}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <button 
                                    className={`button button-primary ${styles.searchButton}`}
                                    onClick={handleSearch}
                                >
                                    Buscar
                                </button>
                                <button 
                                    className="button button-secondary"
                                    onClick={handleShowSummary}
                                >
                                    Ver Total
                                </button>
                            </Box>
                        </Grid>
                    </Grid>
                </Collapse>
            </Paper>

            {loading ? (
                <div>Cargando stock...</div>
            ) : items.length > 0 ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className={styles.informationText}>
                            {isShowingSummary 
                                ? "Stock total disponible" 
                                : `Stock disponible en locación: ${locations.find(l => l.id === actualLocation)?.name}`
                            }
                        </h3>
                     
                    </div>
                    <ItemList
                        items={items}
                        displayKeys={campos}
                        selectItems={false}
                        deleteItems={false}
                        selectSingleItem={isShowingSummary ? true : !isShowingSummary}
                        onSelectSingleItem={isShowingSummary ? handleSummaryItemClick : (isShowingSummary ? undefined : handleItemClick)}
                    />
                </div>
            ) : (
                <h3 className={styles.title}>
                    {isShowingSummary 
                        ? "No hay elementos en el stock" 
                        : "No hay elementos en el stock para esta ubicación"
                    }
                </h3>
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
                ) : (
                    <>
                    {engineerButtons.map((button, index) => (
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
                )}
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
            {/* Modal de detalle de lotes para el resumen */}
            {showSummaryDetailModal && selectedSummaryItem && (
                <GenericModal
                    isOpen={showSummaryDetailModal}
                    onClose={() => setShowSummaryDetailModal(false)}
                    title={`Detalle de lotes para ${selectedSummaryItem.product_name}`}
                    modalText={[
                        "Lotes:",
                        ...(((selectedSummaryItem as any).sum || [])
                            .filter((lote: any) => lote.amount > 0)
                            .map((lote: any) =>
                                `Lote: ${lote.lot_number} | Cantidad: ${lote.amount} ${selectedSummaryItem.unit} | Vencimiento: ${lote.expiration_date ? new Date(lote.expiration_date).toLocaleDateString() : "-"}`
                            ))
                    ].join('\n')}
                    buttonTitle="Cerrar"
                    showSecondButton={false}
                />
            )}
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