"use client";
import { useEffect, useState } from "react";
import MenuBar from "@/components/menuBar/MenuBar";
import Footer from "@/components/Footer/Footer";
import styles from "./estadisticas-view.module.scss";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useUser } from "@/hooks/useUser";
import { Box, Card, CardContent, Typography, Grid, Paper, Button } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useRouter } from 'next/navigation';

// Types and Interfaces
interface StatisticsData {
    totalAplicaciones: number;
    aplicacionesPendientes: number;
    aplicacionesEnCurso: number;
    aplicacionesFinalizadas: number;
    totalProductos: number;
    totalStock: number;
    stockBajo: number;
    totalLocaciones: number;
    totalPersonal: number;
    totalMaquinas: number;
    movimientosEsteMes: number;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

interface ApplicationStatusProps {
    stats: StatisticsData;
}

// Constants
const MOCK_STATISTICS: StatisticsData = {
    totalAplicaciones: 156,
    aplicacionesPendientes: 23,
    aplicacionesEnCurso: 8,
    aplicacionesFinalizadas: 125,
    totalProductos: 89,
    totalStock: 1247,
    stockBajo: 12,
    totalLocaciones: 15,
    totalPersonal: 24,
    totalMaquinas: 8,
    movimientosEsteMes: 45
};

const STAT_CARDS_CONFIG = [
    {
        title: "Total Aplicaciones",
        key: "totalAplicaciones" as keyof StatisticsData,
        icon: AssessmentIcon,
        color: "#aebc86",
        subtitle: "Todas las aplicaciones registradas"
    },
    {
        title: "Stock Total",
        key: "totalStock" as keyof StatisticsData,
        icon: InventoryIcon,
        color: "#6a7349",
        subtitle: "Unidades en inventario"
    },
    {
        title: "Productos",
        key: "totalProductos" as keyof StatisticsData,
        icon: AgricultureIcon,
        color: "#cbcabd",
        subtitle: "Productos registrados"
    },
    {
        title: "Personal",
        key: "totalPersonal" as keyof StatisticsData,
        icon: PeopleIcon,
        color: "#444d5e",
        subtitle: "Usuarios activos"
    }
];

const APPLICATION_STATUS_CONFIG = [
    {
        key: "aplicacionesPendientes" as keyof StatisticsData,
        label: "Pendientes",
        backgroundColor: "#fff3cd",
        borderColor: "#ffeaa7",
        textColor: "#856404"
    },
    {
        key: "aplicacionesEnCurso" as keyof StatisticsData,
        label: "En Curso",
        backgroundColor: "#d1ecf1",
        borderColor: "#bee5eb",
        textColor: "#0c5460"
    },
    {
        key: "aplicacionesFinalizadas" as keyof StatisticsData,
        label: "Finalizadas",
        backgroundColor: "#d4edda",
        borderColor: "#c3e6cb",
        textColor: "#155724"
    }
];

// Custom Hooks
const useStatistics = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [stats, setStats] = useState<StatisticsData>({
        totalAplicaciones: 0,
        aplicacionesPendientes: 0,
        aplicacionesEnCurso: 0,
        aplicacionesFinalizadas: 0,
        totalProductos: 0,
        totalStock: 0,
        stockBajo: 0,
        totalLocaciones: 0,
        totalPersonal: 0,
        totalMaquinas: 0,
        movimientosEsteMes: 0
    });

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 500));
            setStats(MOCK_STATISTICS);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Error al cargar las estadísticas");
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, error, fetchStatistics };
};

// Components
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
        minHeight: 120, 
        backgroundColor: '#e6ebea',
        border: `2px solid ${color}`,
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        }
    }}>
        <CardContent sx={{ padding: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ 
                    color: '#404e5c', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    {title}
                </Typography>
                <Box sx={{ color: color }}>
                    {icon}
                </Box>
            </Box>
            <Typography variant="h4" component="div" sx={{ 
                color: '#404e5c', 
                fontWeight: 'bold',
                fontSize: '28px'
            }}>
                {value.toLocaleString()}
            </Typography>
            {subtitle && (
                <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontSize: '12px',
                    mt: 1
                }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
    <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: '#e6ebea',
        borderRadius: '10px',
        border: '2px solid #aebc86'
    }}>
        <Typography variant="h6" sx={{ 
            color: '#404e5c', 
            fontWeight: 'bold',
            mb: 2
        }}>
            {title}
        </Typography>
        {children}
    </Paper>
);

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ stats }) => (
    <Grid container spacing={2}>
        {APPLICATION_STATUS_CONFIG.map((config) => (
            <Grid item xs={12} sm={4} key={config.key}>
                <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    backgroundColor: config.backgroundColor,
                    borderRadius: '8px',
                    border: `1px solid ${config.borderColor}`
                }}>
                    <Typography variant="h4" sx={{ color: config.textColor, fontWeight: 'bold' }}>
                        {stats[config.key]}
                    </Typography>
                    <Typography variant="body2" sx={{ color: config.textColor }}>
                        {config.label}
                    </Typography>
                </Box>
            </Grid>
        ))}
    </Grid>
);

const StatisticsGrid: React.FC<{ stats: StatisticsData }> = ({ stats }) => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS_CONFIG.map((config) => (
            <Grid item xs={12} sm={6} md={3} key={config.title}>
                <StatCard
                    title={config.title}
                    value={stats[config.key]}
                    icon={<config.icon />}
                    color={config.color}
                    subtitle={config.subtitle}
                />
            </Grid>
        ))}
    </Grid>
);

const AdditionalStats: React.FC<{ stats: StatisticsData }> = ({ stats }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <ChartCard title="Información de Stock">
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: '#404e5c', fontWeight: 'bold' }}>
                                {stats.stockBajo}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Stock Bajo
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: '#404e5c', fontWeight: 'bold' }}>
                                {stats.totalLocaciones}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Ubicaciones
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
            <ChartCard title="Actividad Reciente">
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: '#404e5c', fontWeight: 'bold' }}>
                                {stats.movimientosEsteMes}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Movimientos este mes
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: '#404e5c', fontWeight: 'bold' }}>
                                {stats.totalMaquinas}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Máquinas
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </ChartCard>
        </Grid>
    </Grid>
);

const ChartPlaceholder: React.FC = () => (
    <Box sx={{ 
        height: 200, 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #dee2e6'
    }}>
        <Box sx={{ textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 48, color: '#aebc86', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
                Gráfico de tendencias
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
                (Integración con librería de gráficos)
            </Typography>
        </Box>
    </Box>
);

// Main Component
export default function EstadisticasView() {
    const { user, isLoading } = useUser();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getApiService, isReady } = useAuth();
    const { stats, loading, error, fetchStatistics } = useStatistics();
    const router = useRouter();

    useEffect(() => {
        if (!isReady) return;
        fetchStatistics();
    }, [isReady]);

    // Early returns for loading and error states
    if (isLoading || !user) {
        return null;
    }

    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Cargando estadísticas...</div>
            </div>
        );
    }

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
            <div className="content-wrap">
                <MenuBar showMenu={true} path="" />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <h1 className={styles.title}>Estadísticas del Sistema</h1>
                    <Button
                        variant="outlined"
                        onClick={() => router.push('/estadisticas/v2')}
                        sx={{ 
                            color: '#aebc86', 
                            borderColor: '#aebc86',
                            '&:hover': {
                                backgroundColor: '#aebc86',
                                color: 'white'
                            }
                        }}
                    >
                        Ver Analytics V2
                    </Button>
                </Box>

                <StatisticsGrid stats={stats} />

                <ChartCard title="Estado de Aplicaciones">
                    <ApplicationStatus stats={stats} />
                </ChartCard>

                <AdditionalStats stats={stats} />

                <ChartCard title="Tendencia de Aplicaciones (Últimos 6 meses)">
                    <ChartPlaceholder />
                </ChartCard>
            </div>
            <Footer />
        </div>
    );
} 