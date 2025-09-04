"use client";

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
import { useEffect, useState, useRef } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Locacion } from "@/domain/models/Locacion";
import { Autocomplete, TextField, Paper, Box, Typography, IconButton, Collapse, Grid, Pagination, MenuItem } from "@mui/material";
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
    const [showMoverModal, setShowMoverModal] = useState(false);
    const [showRetirarModal, setShowRetirarModal] = useState(false);
    const { getApiService, isReady, user, isOnline } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    const [selectedStockItem, setSelectedStockItem] = useState<Stock | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchParams, setSearchParams] = useState({
        actualLocation: "",
        productId: "",
        lotNumber: "",
        expirationBefore: "",
        expirationAfter: ""
    });
    const isMounted = useRef(true);
    const [products, setProducts] = useState<Producto[]>([]);
    const [activeSearchParams, setActiveSearchParams] = useState(searchParams);
    const [filtrosExpandidos, setFiltrosExpandidos] = useState<boolean>(false);
    const [isShowingSummary, setIsShowingSummary] = useState<boolean>(true);
    const [selectedSummaryItem, setSelectedSummaryItem] = useState<any>(null);
    const [showSummaryDetailModal, setShowSummaryDetailModal] = useState(false);
    // Estados de paginación
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [pageSize, setPageSize] = useState(10); // Tamaño de página
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageElements, setPageElements] = useState(0);

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
        if (!isReady || !isShowingSummary) return;
        
        const loadInitialData = async () => {
            try {
                // Cargar resumen de stock
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('size', pageSize.toString());

                const summaryResponse = await withLoading(
                    apiService.get<ResponseItems<StockSummary>>(`stock/summary?${queryParams.toString()}`),
                    "Cargando resumen de stock..."
                );
                
                if (summaryResponse.success) {
                    //console.log("summaryResponse");
                    //console.log(summaryResponse);
                    setStockSummary(summaryResponse.data.content);
                    setTotalElements(summaryResponse.data.total_elements);
                    setPageElements(summaryResponse.data.number_of_elements);
                    setTotalPages(summaryResponse.data.total_pages || 0);
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

            
            } catch (err) {
                setError("Error al conectar con el servidor: " + err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isReady, page, pageSize, isShowingSummary]);

    const fetchProducts = async () => {
        try {
            const response = await withLoading(
                apiService.get<ResponseItems<Producto>>('/products'),
                "Cargando productos..."
            );
            if (response.success && isMounted.current) {
                setProducts(response.data.content);
            }
        } catch (err) {
            if (isMounted.current) {
                console.error('Error fetching products:', err);
            }
        }
    };

    useEffect(() => {
        if (!isReady) return;
        isMounted.current = true;
        fetchProducts();
        return () => {
            isMounted.current = false;
        };
    }, [isReady]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('size', pageSize.toString());
            
            if(activeSearchParams.actualLocation){
                queryParams.append('location', activeSearchParams.actualLocation);
            }
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
            fetchProducts();
            if (response.success && isMounted.current) {
                //console.log("stock response");
                //console.log(response);
                const stock = response.data.content;
                setStockFromServer(stock);
                setTotalPages(response.data.total_pages || 0);
                setTotalElements(response.data.total_elements || 0);
                setPageElements(response.data.number_of_elements);
                setIsShowingSummary(false);
            } else if (isMounted.current) {
                setError(response.error || "Error al obtener el stock");
            }
        } catch (err) {
            if (isMounted.current) {
                setError("Error al conectar con el servidor: " + err);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {  
       if (!isReady || isShowingSummary) {
            return;
        }
        
        isMounted.current = true;
        fetchData();
        
        return () => {
            isMounted.current = false;
        };
    }, [isReady, activeSearchParams, isShowingSummary, page, pageSize]);

    // Cuando se cambian los filtros o la ubicación, volver a la primera página
    useEffect(() => {
        setPage(0);
    }, [activeSearchParams, isShowingSummary]);

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
        const hasFilters = searchParams.actualLocation || searchParams.productId || searchParams.lotNumber || searchParams.expirationAfter || searchParams.expirationBefore;
        
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
        setSearchParams({
            actualLocation: "",
            productId: "",
            lotNumber: "",
            expirationBefore: "",
            expirationAfter: ""
        });
        setActiveSearchParams({
            actualLocation: "",
            productId: "",
            lotNumber: "",
            expirationBefore: "",
            expirationAfter: ""
        });
    };

    // Handler para cambio de página
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); // MUI Pagination es 1-indexed
    };
    // Handler para cambio de tamaño de página
    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (error && error !== "Network Error") {
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
            <Paper elevation={3} sx={{ p: 3, mb: 3, mx: { xs: 1, sm: 4, md: 8 } }}>
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
                                value={searchParams.actualLocation ? options.find(option => option.label === locations.find(l => l.id === searchParams.actualLocation)?.name) || null : null}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Locación"
                                        sx={{...customInputSx}}
                                    />
                                )}
                                onChange={(e, newValue) => {
                                    setSearchParams(prev => ({
                                        ...prev,
                                        actualLocation: newValue ? locations.find(l => l.name === newValue.label)?.id || "" : ""
                                    }));
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
                                onChange={(e) => {
                                    setSearchParams(prev => ({
                                        ...prev,
                                        lotNumber: e.target.value
                                    }));
                                }}
                                sx={{...customInputSx, width: '100%'}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Vencimiento Desde"
                                type="date"
                                value={searchParams.expirationAfter}
                                onChange={(e) => {
                                    setSearchParams(prev => ({
                                        ...prev,
                                        expirationAfter: e.target.value
                                    }));
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{...customInputSx, width: '100%'}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Vencimiento Hasta"
                                type="date"
                                value={searchParams.expirationBefore}
                                onChange={(e) => {
                                    setSearchParams(prev => ({
                                        ...prev,
                                        expirationBefore: e.target.value
                                    }));
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{...customInputSx, width: '100%'}}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
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
                                : `Stock disponible en locación: ${locations.find(l => l.id === activeSearchParams.actualLocation)?.name}`
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
                    {/* Paginación solo para stock específico */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, marginTop: 2 ,gap: "10px"}}>
                        <Pagination
                            count={totalPages}
                            page={page + 1}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                        <Box sx={{ mt: 1 }}>
                            <TextField
                                select
                                label="Elementos por página"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                sx={{ width: 180 }}
                                size="small"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <MenuItem key={size} value={size}>{size}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Mostrando {pageElements} de {totalElements} elementos
                        </Typography>
                    </Box>
                    
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
                                    disabled={!isOnline}
                                >
                                    {button.label}
                                </button>
                            ) : (
                                <NavigationLink key={index} href={button.path}>
                                    <button className={`button button-primary ${styles.buttonHome}`}
                                        disabled={!isOnline}
                                    >
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
                                `Lote de producto: ${lote.lot_number} | Ubicacion: ${lote.location_name} | Cantidad: ${lote.amount} ${selectedSummaryItem.unit} | Vencimiento: ${lote.expiration_date ? new Date(lote.expiration_date).toLocaleDateString() : "-"  }`
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