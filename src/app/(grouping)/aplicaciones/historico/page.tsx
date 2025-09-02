"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import styles from './historicoAplicaciones.module.scss';
import { Aplicacion } from '@/domain/models/Aplicacion';
import { useAuth } from "@/components/Auth/AuthProvider";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useLoading } from "@/hooks/useLoading";
import { Locacion } from '@/domain/models/Locacion';
import { Producto } from '@/domain/models/Producto';
import { User } from '@/domain/models/User';
import { EstadoAplicacion } from '@/domain/enum/EstadoAplicacion';
import {
    Box,
    Paper,
    TextField,
    MenuItem,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Grid,
    Chip,
    IconButton,
    Collapse,
    Card,
    CardContent,
    useTheme, useMediaQuery
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface FiltrosAplicacion {
    fechaDesde: Dayjs | null;
    fechaHasta: Dayjs | null;
    producto: string;
    superficieMin: number | null;
    superficieMax: number | null;
    externalId: string;
    type: string;
    status: string;
    locationName: string;
    applicatorName: string;
    engineerName: string;
}

interface PaginacionRequest {
    page: number;
    size: number;
    sort: string[];
}

export default function HistoricoAplicacionesPage() {
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const { withLoading } = useLoading();

    // Estados principales
    const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
    const [locaciones, setLocaciones] = useState<Locacion[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [aplicadores, setAplicadores] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Estados de paginación
    const [paginacion, setPaginacion] = useState<PaginacionRequest>({
        page: 0,
        size: 10,
        sort: ["createdAt,desc"]
    });
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);

    // Estados de filtros
    const [filtros, setFiltros] = useState<FiltrosAplicacion>({
        externalId: "",
        type: "",
        status: "",
        locationName: "",
        applicatorName: "",
        engineerName: "",
        producto: "",
        fechaDesde: null,
        fechaHasta: null,
        superficieMin: null,
        superficieMax: null
    });

    // Estados de UI
    const [filtrosExpandidos, setFiltrosExpandidos] = useState<boolean>(false);
    const [aplicacionExpandida, setAplicacionExpandida] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const construirQueryParams = () => {
        const params = new URLSearchParams();

        // Parámetros de paginación
        params.append('page', paginacion.page.toString());
        params.append('size', paginacion.size.toString());
        paginacion.sort.forEach(sort => params.append('sort', sort));

        // Filtros según contrato Java
        if (filtros.fechaDesde) {
            params.append('from', filtros.fechaDesde.toISOString());
        }
        if (filtros.fechaHasta) {
            params.append('to', filtros.fechaHasta.toISOString());
        }
        if (filtros.status) {
            params.append('status', filtros.status);
        }
        if (filtros.locationName) {
            params.append('locationId', filtros.locationName);
        }
        if (filtros.applicatorName) {
            params.append('applicatorId', filtros.applicatorName);
        }
        if (filtros.engineerName) {
            params.append('engineerId', filtros.engineerName);
        }
        if (filtros.producto) {
            params.append('productId', filtros.producto);
        }
        if (filtros.externalId) {
            params.append('externalId', filtros.externalId);
        }
        if (filtros.type) {
            params.append('type', filtros.type);
        }

        // Filtro por estado finalizado (siempre agregar si así lo requiere la lógica)
        // params.append('status', EstadoAplicacion.Finalizada); // <-- Si quieres forzar solo finalizadas, descomenta esto

        return params.toString();
    };

    const fetchAplicaciones = async () => {
        try {
            const queryParams = construirQueryParams();
            //console.log(queryParams);
            const response = await withLoading(
                apiService.get<ResponseItems<Aplicacion>>(`applications?${queryParams}`),
                "Cargando aplicaciones..."
            );
            if (response.success) {
                if (response.data) {
                    setAplicaciones(response.data.content);
                    setTotalPages(response.data.total_pages);
                    setTotalElements(response.data.total_elements);
                }
            } else {
                setError(response.error || "Error al obtener las aplicaciones");
            }
        } catch (err) {
            setError("Error al conectar con el servidor: " + err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocaciones = async () => {
        try {
            const response = await withLoading(
                apiService.get<Locacion[]>('locations?type=CROP&type=FIELD'),
                "Cargando ubicaciones..."
            );
            if (response.success) {
                setLocaciones(response.data);
            } else {
                setError(response.error || "Error al obtener las locaciones");
            }
        } catch (err) {
            setError("Error al conectar con el servidor: " + err);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await withLoading(
                apiService.get<ResponseItems<Producto>>('/products?size=100'),
                "Cargando productos..."
            );
            if (response.success) {
                setProductos(response.data.content);
            } else {
                setError(response.error || "Error al obtener los productos");
            }
        } catch (err) {
            setError("Error al conectar con el servidor: " + err);
        }
    };

    const fetchAplicadores = async () => {
        try {
            const response = await withLoading(
                apiService.get<any>("users/applicators"),
                "Cargando aplicadores..."
            );
            if (response.success) {
                setAplicadores(response.data.users || []);
            } else {
                setError(response.error || "Error al obtener los aplicadores");
            }
        } catch (err) {
            setError("Error al conectar con el servidor: " + err);
        }
    };

    const fetchData = async () => {
        await Promise.all([
            fetchLocaciones(),
            fetchProductos(),
            fetchAplicadores()
        ]);
    };

    useEffect(() => {
        if (!isReady) return;
        fetchData();
    }, [isReady]);

    useEffect(() => {
        if (isReady) {
            fetchAplicaciones();
        }
    }, [paginacion, filtros, isReady]);

    const handleFiltroChange = (campo: keyof FiltrosAplicacion, valor: any) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        setPaginacion(prev => ({ ...prev, page: 0 })); // Resetear a primera página
    };

    const handleLimpiarFiltros = () => {
        setFiltros({
            fechaDesde: null,
            fechaHasta: null,
            status: "",
            locationName: "",
            applicatorName: "",
            producto: "",
            superficieMin: null,
            superficieMax: null,
            externalId: "",
            type: "",
            engineerName: ""
        });
        setPaginacion(prev => ({ ...prev, page: 0 }));
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPaginacion(prev => ({ ...prev, page: value - 1 }));
    };

    const handleSortChange = (campo: string) => {
        const currentSort = paginacion.sort[0] || "";
        const isAscending = currentSort.startsWith(campo) && currentSort.endsWith("asc");
        const newSort = isAscending ? `${campo},desc` : `${campo},asc`;
        setPaginacion(prev => ({ ...prev, sort: [newSort] }));
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case EstadoAplicacion.Finalizada:
                return "success";
            case EstadoAplicacion.EnCurso:
            case EstadoAplicacion.NecesitaRevision:
                return "warning";
            case EstadoAplicacion.Pendiente:
                return "info";
            default:
                return "default";
        }
    };

    const getEstadoLabel = (estado: string) => {
        switch (estado) {
            case EstadoAplicacion.Finalizada:
                return "Finalizada";
            case EstadoAplicacion.EnCurso:
                return "En Curso";
            case EstadoAplicacion.NecesitaRevision:
                return "Necesita Atencion";
            case EstadoAplicacion.Pendiente:
                return "Pendiente";
            default:
                return estado;
        }
    };

    const getTipoAplicacion = (tipo: string) => {
        switch (tipo) {
            case "INSTANT":
                return "Aplicación Instantánea";
            case "REGULAR":
                return "Aplicación Normal";
            default:
                return tipo;
        }
    }

    const formatDate = (date: Date | string) => {
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    if (loading && aplicaciones.length === 0) {
        return <div>Cargando aplicaciones...</div>;
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={true} path="" />
                <h1 className={styles.title}>Histórico de Aplicaciones</h1>

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
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Fecha desde"
                                        value={filtros.fechaDesde}
                                        onChange={(newDate) => handleFiltroChange('fechaDesde', newDate)}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: customInputSx
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Fecha hasta"
                                        value={filtros.fechaHasta}
                                        onChange={(newDate) => handleFiltroChange('fechaHasta', newDate)}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: customInputSx
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Ubicación"
                                    value={filtros.locationName}
                                    onChange={(e) => handleFiltroChange('locationName', e.target.value)}
                                    sx={customInputSx}
                                >
                                    <MenuItem value="">Todas las ubicaciones</MenuItem>
                                    {locaciones.map((loc) => (
                                        <MenuItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Aplicador"
                                    value={filtros.applicatorName}
                                    onChange={(e) => handleFiltroChange('applicatorName', e.target.value)}
                                    sx={customInputSx}
                                >
                                    <MenuItem value="">Todos los aplicadores</MenuItem>
                                    {aplicadores.map((app) => (
                                        <MenuItem key={app.id} value={app.id}>
                                            {app.first_name} {app.last_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Producto"
                                    value={filtros.producto}
                                    onChange={(e) => handleFiltroChange('producto', e.target.value)}
                                    sx={customInputSx}
                                >
                                    <MenuItem value="">Todos los productos</MenuItem>
                                    {productos.map((prod) => (
                                        <MenuItem key={prod.id} value={prod.id}>
                                            {prod.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Superficie mínima (Ha)"
                                    value={filtros.superficieMin || ''}
                                    onChange={(e) => handleFiltroChange('superficieMin', e.target.value ? Number(e.target.value) : null)}
                                    sx={customInputSx}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Superficie máxima (Ha)"
                                    value={filtros.superficieMax || ''}
                                    onChange={(e) => handleFiltroChange('superficieMax', e.target.value ? Number(e.target.value) : null)}
                                    sx={customInputSx}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleLimpiarFiltros}
                                        className="button button-secondary"
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Collapse>
                </Paper>

                {/* Tabla de aplicaciones */}
                <Paper elevation={3} sx={{ mb: 3, p: isMobile ? 2 : 0 }}>
                    {isMobile ? (
                        <Box display="flex" flexDirection="column" gap={2}>
                            {aplicaciones.map((aplicacion) => (
                                <Card key={aplicacion.id} variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {formatDate(aplicacion.created_at)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Aplicación:</strong> {aplicacion.application_date ? formatDate(aplicacion.application_date) : 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Ubicación:</strong> {aplicacion.location?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Superficie:</strong> {aplicacion.surface || 0} Ha
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Aplicador:</strong>{aplicacion.applicator_name}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Ingeniero:</strong>{aplicacion.engineer_name}
                                        </Typography>
                                        <Box mt={1}>
                                            <Chip
                                                label={getEstadoLabel(aplicacion.status)}
                                                color={getEstadoColor(aplicacion.status) as any}
                                                size="small"
                                            />
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mt={2}>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setAplicacionExpandida(aplicacionExpandida === aplicacion.id ? null : aplicacion.id)
                                                }
                                            >
                                                {aplicacionExpandida === aplicacion.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                            
                                        </Box>
                                        <Collapse in={aplicacionExpandida === aplicacion.id} timeout="auto" unmountOnExit>
                                            <Box mt={2}>
                                                <Typography variant="body2" fontWeight="bold">Productos:</Typography>
                                                {(aplicacion.actual_application || aplicacion.recipe)?.recipe_items?.map((item, idx) => (
                                                    <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                                                        {item.name || 'N/A'} -
                                                        • {item.amount} {item.unit}{' '}
                                                        {item.dose_type === 'SURFACE' ? '/Ha' : ' en total'}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                            onClick={() => handleSortChange('created_at')}
                                        >
                                            Fecha Creación
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                            onClick={() => handleSortChange('application_date')}
                                        >
                                            Fecha Aplicación
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Ubicación</TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                            onClick={() => handleSortChange('surface')}
                                        >
                                            Superficie (Ha)
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Aplicador</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aplicaciones.map((aplicacion) => (
                                        <React.Fragment key={aplicacion.id}>
                                            <TableRow hover>
                                                <TableCell>{formatDate(aplicacion.created_at)}</TableCell>
                                                <TableCell>
                                                    {aplicacion.application_date ? formatDate(aplicacion.application_date) : 'N/A'}
                                                </TableCell>
                                                <TableCell>{aplicacion.location?.name || 'N/A'}</TableCell>
                                                <TableCell>{aplicacion.surface || 0}</TableCell>
                                                <TableCell>
                                                    {aplicacion.applicator_id ?
                                                        aplicadores.find(a => a.id === aplicacion.applicator_id)?.first_name + ' ' +
                                                        aplicadores.find(a => a.id === aplicacion.applicator_id)?.last_name :
                                                        'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getEstadoLabel(aplicacion.status)}
                                                        color={getEstadoColor(aplicacion.status) as any}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setAplicacionExpandida(
                                                            aplicacionExpandida === aplicacion.id ? null : aplicacion.id
                                                        )}
                                                    >
                                                        {aplicacionExpandida === aplicacion.id ?
                                                            <ExpandLessIcon /> : <ExpandMoreIcon />
                                                        }
                                                    </IconButton>
                                                  
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                    <Collapse in={aplicacionExpandida === aplicacion.id} timeout="auto" unmountOnExit>
                                                        <Card sx={{ margin: 1 }}>
                                                            <CardContent>
                                                                <Typography variant="h6" gutterBottom>
                                                                    Detalles de la Aplicación
                                                                </Typography>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12} md={6}>
                                                                        <Typography variant="body2">
                                                                            <strong>Ubicación:</strong> {aplicacion.location?.name}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Superficie:</strong> {aplicacion.surface} Ha
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Fecha de aplicación:</strong> {aplicacion.application_date ? formatDate(aplicacion.application_date) : 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Fecha de creación:</strong> {aplicacion.created_at ? formatDate(aplicacion.created_at) : 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Estado:</strong> {getEstadoLabel(aplicacion.status)}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Ingeniero:</strong> {aplicacion.engineer_name || 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Aplicador:</strong> {aplicacion.applicator_name || 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Tipo de aplicación:</strong> {getTipoAplicacion(aplicacion.type)}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} md={6}>
                                                                        <Typography variant="body2">
                                                                            <strong>Productos:</strong>
                                                                        </Typography>
                                                                        {aplicacion.recipe?.recipe_items?.map((item, index) => (
                                                                            <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                                                                {item.name || 'N/A'} • {item.amount} {item.unit}
                                                                                {item.dose_type === 'SURFACE' ? '/Ha' : ' en total'}
                                                                            </Typography>
                                                                        ))}
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    )}
                </Paper>

                {!isMobile && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Pagination
                                count={totalPages}
                                page={paginacion.page + 1}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Mostrando {aplicaciones.length} de {totalElements} aplicaciones
                            </Typography>
                        </Box>

                        {error && (
                            <Typography color="error" sx={{ textAlign: 'center' }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                )}

            </div>
            <Footer />
        </div>
    );
} 