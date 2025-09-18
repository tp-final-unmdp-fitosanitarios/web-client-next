"use client";
import MenuBar from '@/components/menuBar/MenuBar';
import styles from './movementsPage.module.scss'; /// Importar estilos
import { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from "@/components/Auth/AuthProvider";
import { ResponseItems } from '@/domain/models/ResponseItems';
import MovementDetailModal from '@/components/MovementDetailModal/MovementDetailModal';
import Footer from '@/components/Footer/Footer';
import { Producto } from '@/domain/models/Producto';
import { Locacion } from '@/domain/models/Locacion';
import { useLoading } from "@/hooks/useLoading";
import {  Box, Typography } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { IconButton, Collapse, Paper, Grid, Button } from '@mui/material';
import  { Dayjs } from 'dayjs';
import PaginationControls from '@/components/PaginationControls/paginationControls';

interface Movement {
    id: string;
    product: Producto;
    origin: Locacion;
    destination: Locacion;
    amount: number;
    unit: string;
    created_at: string;
    reason: string;
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
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
    const [dateTo, setDateTo] = useState<Dayjs | null>(null);
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
                queryParams.append('sort', 'createdAt,desc')
                if (dateFrom) queryParams.append('from', dateFrom.toISOString());
                if (dateTo) queryParams.append('to', dateTo.toISOString());
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
    }, [isReady, page, pageSize, dateFrom, dateTo]);

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
            {/* Filtros */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, mx: { xs: 1, sm: 4, md: 8 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="#404e5c">
                        Filtros de búsqueda
                    </Typography>
                    <IconButton
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        size="small"
                    >
                        {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
                <Collapse in={filtersExpanded}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Desde"
                                    value={dateFrom}
                                    onChange={setDateFrom}
                                    format="DD/MM/YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            sx: {
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
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Hasta"
                                    value={dateTo}
                                    onChange={setDateTo}
                                    format="DD/MM/YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            sx: {
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
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => { setDateFrom(null); setDateTo(null); setPage(0); }}
                                    className="button button-secondary"
                                >
                                    Limpiar Filtros
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Collapse>
            </Paper>
            {/* Fin Filtros */}
            <div className={styles.container}>
                <div className={styles.movementList}>
                {/** deploy* */
                movements.map((movement) => {
                    const isForced = movement.reason.toLocaleLowerCase().includes('force');
                    if(latestDate == null || new Date(movement.created_at).toLocaleDateString() !== new Date(latestDate).toLocaleDateString()){
                        latestDate = new Date(movement.created_at)
                        return (
                            <div key={movement.id}>
                                <div className={styles.dateItem}>
                                    {new Date(movement.created_at).toLocaleDateString()}
                                </div>
                                <div 
                                    key={movement.id} 
                                    className={`${styles.item} ${selectedId === movement.id ? styles.selected : ''} ${isForced ? styles.forced : ''}`}
                                    onClick={() => handleClickMovement(movement)}
                                >
                                    <p className={styles.movementInfo}>{`${movement.product.name} - ${movement.amount} ${movement.unit}`}</p>
                                    <p className={styles.movementInfo}>
                                     {movement.origin && movement.destination
                                     ? `Origen: ${movement.origin ? movement.origin.name : 'N/a'} - Destino: ${movement.destination.name ? movement.destination.name : 'Desconocido'}` : movement.origin  ? `Origen: ${movement.origin ? movement.origin.name : 'N/a'}` : movement.destination
                                     ? `Destino: ${movement.destination ? movement.destination.name : 'Desconocido'}`
                                     : 'Sin origen ni destino'}
                                    </p>
                                </div>
                            </div>
                        )
                    }
                    else
                        return (
                            <div 
                                key={movement.id} 
                                className={`${styles.item} ${selectedId === movement.id ? styles.selected : ''} ${isForced ? styles.forced : ''}`}
                                onClick={() => handleClickMovement(movement)}
                            >
                                <p className={styles.movementInfo}>{`${movement.product.name} - ${movement.amount} ${movement.unit}`}</p>
                                <p className={styles.movementInfo}>{`Origen: ${movement.origin ? movement.origin.name : 'N/a'} - Destino: ${movement.destination ? movement.destination.name : 'Desconocido'}`}</p>
                            </div>
                        )
                })}
                </div>
                {/* Paginación */}
                <PaginationControls
                            page={page}
                            pageSize={pageSize}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageElements={pageElements}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
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
