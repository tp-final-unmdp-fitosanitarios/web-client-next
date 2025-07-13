"use client";
import MenuBar from '@/components/menuBar/MenuBar';
import styles from './movementsPage.module.scss'; // Importar estilos
import { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from "@/components/Auth/AuthProvider";
import { ResponseItems } from '@/domain/models/ResponseItems';
import MovementDetailModal from '@/components/MovementDetailModal/MovementDetailModal';
import Footer from '@/components/Footer/Footer';
import { Producto } from '@/domain/models/Producto';
import { Locacion } from '@/domain/models/Locacion';
import { useLoading } from "@/hooks/useLoading";
import { Pagination, TextField, MenuItem, Box, Typography } from "@mui/material";

interface Movement {
    id: string;
    product: Producto;
    origin: Locacion;
    destination: Locacion;
    amount: number;
    unit: string;
    created_at: string;
}

const StockMovements = () => {  //TODO: Cambiar los ids por los nombres de los producos y depositos. Evaluar cuando hacer los fetch. Anular el y-scroll.
    const [movements, setMovements] = useState<Movement[]>([]);
    const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [pageSize, setPageSize] = useState(10); // Tamaño de página
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageElements, setPageElements] = useState(0);
    const { getApiService, isReady } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    let latestDate: Date | null = null;

    useEffect(() => {
        if (!isReady) return;
        
        let isMounted = true;
        const fetchMovements = async () => {
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('size', pageSize.toString());
                const response = await withLoading(
                    apiService.get<ResponseItems<Movement>>(`/stock/movement?${queryParams.toString()}`),
                    "Cargando movimientos..."
                );
                if (response.success && isMounted) {
                    const movements = response.data.content;
                    movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setMovements(movements);
                    setTotalPages(response.data.total_pages || 0);
                    setTotalElements(response.data.total_elements || 0);
                    setPageElements(response.data.number_of_elements || 0);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching movements:', error);
                }
            }
        };
        
        fetchMovements();
        return () => {
            isMounted = false;
        };
    }, [isReady, page, pageSize]);

    // Handler para cambio de página
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); // MUI Pagination es 1-indexed
    };
    // Handler para cambio de tamaño de página
    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClickMovement = (movement: Movement) => {
        setSelectedMovement(movement);
        setSelectedId(movement.id);
        setShowDetailModal(true);
    }

    const handleDetailModalClose = () => {
        setShowDetailModal(false);
        setSelectedMovement(null);
        setSelectedId(null);
    }
    return (
        <div className="page-container">
            <div className="content-wrap">
            <MenuBar showMenu={false} showArrow={true} path="/stock" />
            <h1 className={styles.title}>Movimientos de stock</h1>
            <div className={styles.container}>
                <div className={styles.movementList}>
                {
                movements.map((movement) => {
                    if(latestDate == null || new Date(movement.created_at).toLocaleDateString() !== new Date(latestDate).toLocaleDateString()){
                        latestDate = new Date(movement.created_at)
                        return (
                            <div key={movement.id}>
                                <div className={styles.dateItem}>
                                    {new Date(movement.created_at).toLocaleDateString()}
                                </div>
                                <div 
                                    key={movement.id} 
                                    className={`${styles.item} ${selectedId === movement.id ? styles.selected : ''}`}
                                    onClick={() => handleClickMovement(movement)}
                                >
                                    <p className={styles.movementInfo}>{`${movement.product.name} - ${movement.amount} ${movement.unit}`}</p>
                                    <p className={styles.movementInfo}>{`Origen: ${movement.origin.name} - Destino: ${movement.destination.name}`}</p>
                                </div>
                            </div>
                        )
                    }
                    else
                        return (
                            <div 
                                key={movement.id} 
                                className={`${styles.item} ${selectedId === movement.id ? styles.selected : ''}`}
                                onClick={() => handleClickMovement(movement)}
                            >
                                <p className={styles.movementInfo}>{`${movement.product.name} - ${movement.amount} ${movement.unit}`}</p>
                                <p className={styles.movementInfo}>{`Origen: ${movement.origin.name} - Destino: ${movement.destination.name}`}</p>
                            </div>
                        )
                })}
                </div>
                {/* Paginación */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, marginTop: 2 }}>
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
            { showDetailModal && (
                <MovementDetailModal open={showDetailModal} setModalClose={handleDetailModalClose} movement={selectedMovement} />
            )}
            </div>
            <Footer />
        </div>
    )
}

export default StockMovements;
