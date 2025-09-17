"use client";
import { useEffect, useState } from "react";
import MenuBar from "@/components/menuBar/MenuBar";
import Footer from "@/components/Footer/Footer";
import styles from "./estadisticas-v2.module.scss";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useUser } from "@/hooks/useUser";
import AnalyticsService, { 
  AnalyticsFilters,
  AnalyticsDashboardResponse,
  QuickStats,
  Alert as AnalyticsAlert,
  Recommendation,
  LocationPerformance,
  InventoryAnalytics,
  AgrochemicalCategory,
  TimeGranularity,
  ExportFormat
} from "@/services/analytics-service";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  OutlinedInput,
  SelectChangeEvent
} from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AgricultureIcon from '@mui/icons-material/Agriculture';

import AssessmentIcon from '@mui/icons-material/Assessment';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Component Props
interface StatCardV2Props {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
  format?: 'number' | 'percentage' | 'currency';
}

interface AlertsCardProps {
  alerts: AnalyticsAlert[];
}

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

// Custom Hook for Analytics Data
const useAnalyticsData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [dateRange, setDateRange] = useState<AnalyticsFilters>({
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    to_date: new Date().toISOString(),
    time_granularity: 'DAILY'
  });
  const { getApiService } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      
      const apiService = getApiService();
      if (!apiService) {
        throw new Error("API service not available");
      }

      // Fetch dashboard data
      const dashboardResponse = await apiService.create<AnalyticsDashboardResponse>(
        'api/analytics/dashboard',
        dateRange
      );

      if (!dashboardResponse.success) {
        throw new Error(dashboardResponse.error || "Error fetching dashboard data");
      }

      setDashboardData(dashboardResponse.data);

      // Fetch quick stats
      if (dateRange.from_date && dateRange.to_date) {
        const quickStatsResponse = await apiService.get<QuickStats>(
          `api/analytics/quick-stats?fromDate=${encodeURIComponent(dateRange.from_date)}&toDate=${encodeURIComponent(dateRange.to_date)}`
        );

        if (quickStatsResponse.success) {
          setQuickStats(quickStatsResponse.data);
        }
      }

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err instanceof Error ? err.message : "Error al cargar los datos analíticos");
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: ExportFormat = 'EXCEL') => {
    try {
      const apiService = getApiService();
      if (!apiService) {
        throw new Error("API service not available");
      }

      const exportResponse = await apiService.create<{ download_url: string }>(
        'api/analytics/export',
        {
          ...dateRange,
          format,
          include_sections: ['operational', 'inventory', 'usage']
        }
      );

      if (exportResponse.success && exportResponse.data.download_url) {
        window.open(exportResponse.data.download_url, '_blank');
      } else {
        throw new Error("Error generating export");
      }
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Error al exportar los datos");
    }
  };

  const updateDateRange = (updates: Partial<AnalyticsFilters>) => {
    setDateRange(prev => {
      const newRange = { ...prev, ...updates };
      
      // Auto-optimize granularity if date range changed
      if (updates.from_date || updates.to_date) {
        if (newRange.from_date && newRange.to_date) {
          newRange.time_granularity = AnalyticsService.getOptimalGranularity(
            newRange.from_date, 
            newRange.to_date
          );
        }
      }
      
      return newRange;
    });
  };

  const setQuickDateRange = (period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastyear') => {
    const newRange = AnalyticsService.getDateRange(period);
    setDateRange(newRange);
  };

  return { 
    dashboardData, 
    quickStats, 
    loading, 
    error, 
    dateRange, 
    setDateRange, 
    updateDateRange,
    setQuickDateRange,
    fetchDashboard, 
    exportData 
  };
};

// Utility Functions
const formatValue = (value: number | null | undefined, format: 'number' | 'percentage' | 'currency' = 'number'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    default:
      return value.toLocaleString();
  }
};

const formatSafeValue = (value: number | null | undefined, unit?: string): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  return unit ? `${value.toFixed(1)} ${unit}` : value.toLocaleString();
};

const getSeverityColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH'): string => {
  switch (severity) {
    case 'HIGH':
      return '#d32f2f';
    case 'MEDIUM':
      return '#f57c00';
    case 'LOW':
      return '#388e3c';
    default:
      return '#666';
  }
};

const getSeverityIcon = (severity: 'LOW' | 'MEDIUM' | 'HIGH') => {
  switch (severity) {
    case 'HIGH':
      return <ErrorIcon />;
    case 'MEDIUM':
      return <WarningIcon />;
    case 'LOW':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

// Components
const StatCardV2: React.FC<StatCardV2Props> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  trend, 
  format = 'number' 
}) => (
  <Card sx={{ 
    minHeight: 140, 
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
        {typeof value === 'number' ? formatValue(value, format) : (value || "N/A")}
      </Typography>
      {trend !== undefined && trend !== null && !isNaN(trend) && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TrendingUpIcon sx={{ 
            fontSize: 16, 
            color: trend >= 0 ? '#4caf50' : '#f44336',
            transform: trend < 0 ? 'rotate(180deg)' : 'none'
          }} />
          <Typography variant="body2" sx={{ 
            color: trend >= 0 ? '#4caf50' : '#f44336',
            fontSize: '12px',
            ml: 0.5
          }}>
            {Math.abs(trend).toFixed(1)}%
          </Typography>
        </Box>
      )}
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

const AlertsCard: React.FC<AlertsCardProps> = ({ alerts }) => (
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
      Alertas del Sistema ({AnalyticsService.safeArrayLength(alerts)})
    </Typography>
    {(!alerts || alerts.length === 0) ? (
      <Typography variant="body2" sx={{ color: '#666' }}>
        No hay alertas activas
      </Typography>
    ) : (
      <List>
        {alerts.map((alert, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemIcon sx={{ color: getSeverityColor(alert.severity) }}>
              {getSeverityIcon(alert.severity)}
            </ListItemIcon>
            <ListItemText 
              primary={alert.title || "N/A"}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {alert.description || "N/A"}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={alert.severity || "UNKNOWN"} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getSeverityColor(alert.severity),
                        color: 'white',
                        fontSize: '10px'
                      }}
                    />
                    {alert.action_required && (
                      <Chip 
                        label={alert.action_required} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '10px' }}
                      />
                    )}
                    <Chip 
                      label={new Date(alert.created_at).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '10px', opacity: 0.7 }}
                    />
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => (
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
      Recomendaciones ({AnalyticsService.safeArrayLength(recommendations)})
    </Typography>
    {(!recommendations || recommendations.length === 0) ? (
      <Typography variant="body2" sx={{ color: '#666' }}>
        No hay recomendaciones disponibles
      </Typography>
    ) : (
      <List>
        {recommendations.map((rec, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemIcon sx={{ color: getSeverityColor(rec.priority) }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary={rec.title || "N/A"}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {rec.description || "N/A"}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={rec.priority || "UNKNOWN"} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getSeverityColor(rec.priority),
                        color: 'white',
                        fontSize: '10px'
                      }}
                    />
                    <Chip 
                      label={rec.category || "GENERAL"} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '10px' }}
                    />
                    {rec.potential_savings && (
                      <Chip 
                        label={`Savings: ${rec.potential_savings}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '10px', color: '#4caf50' }}
                      />
                    )}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

const LocationPerformanceCard: React.FC<{ locationPerformance: LocationPerformance }> = ({ 
  locationPerformance 
}) => (
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
      Rendimiento por Ubicación
    </Typography>
    {!locationPerformance?.location_metrics || Object.keys(locationPerformance.location_metrics).length === 0 ? (
      <Typography variant="body2" sx={{ color: '#666' }}>
        No hay datos de rendimiento por ubicación disponibles
      </Typography>
    ) : (
      <Grid container spacing={2}>
        {Object.values(locationPerformance.location_metrics).map((location) => (
          <Grid item xs={12} md={6} key={location.location_id}>
            <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ color: '#aebc86', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {location.location_name || "N/A"}
                </Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Aplicaciones: {AnalyticsService.formatInteger(location.total_applications)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Exitosas: {AnalyticsService.formatInteger(location.successful_applications)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                   Tasa de éxito: {AnalyticsService.formatPercentage(location.average_application_success_rate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Superficie: {formatSafeValue(location.total_surface_treated, 'ha')}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Tasa de éxito
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={location.average_application_success_rate || 0} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: (location.average_application_success_rate || 0) >= 90 ? '#4caf50' : 
                                     (location.average_application_success_rate || 0) >= 80 ? '#ff9800' : '#f44336'
                    }
                  }}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}
  </Paper>
);

const InventoryOverviewCard: React.FC<{ inventory: InventoryAnalytics }> = ({ inventory }) => (
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
      Resumen de Inventario
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Stock por Producto
        </Typography>
        {!inventory?.current_stock_levels || Object.keys(inventory.current_stock_levels).length === 0 ? (
          <Typography variant="body2" sx={{ color: '#666' }}>
            No hay datos de stock disponibles
          </Typography>
        ) : (
          Object.entries(inventory.current_stock_levels).map(([category, amount]) => (
            <Box key={category} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{category}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {AnalyticsService.formatValue(amount)}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Alertas de Stock Bajo ({AnalyticsService.safeArrayLength(inventory?.low_stock_alerts)})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(!inventory?.low_stock_alerts || inventory.low_stock_alerts.length === 0) ? (
              <Typography variant="body2" color="textSecondary">
                No hay alertas de stock bajo
              </Typography>
            ) : (
              inventory.low_stock_alerts.map((alert, index) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{alert.product_name || "N/A"}</strong> en {alert.location_name || "N/A"}
                  </Typography>
                  <Typography variant="caption">
                    Actual: {AnalyticsService.formatValue(alert.current_stock)} {alert.unit || ""} | 
                    Mínimo: {AnalyticsService.formatValue(alert.suggested_reorder_level)} {alert.unit || ""}
                  </Typography>
                </Alert>
              ))
            )}
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Próximos a Vencer ({AnalyticsService.safeArrayLength(inventory?.expiration_alerts)})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(!inventory?.expiration_alerts || inventory.expiration_alerts.length === 0) ? (
              <Typography variant="body2" color="textSecondary">
                No hay productos próximos a vencer
              </Typography>
            ) : (
              inventory.expiration_alerts.map((alert, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{alert.product_name || "N/A"}</strong> en {alert.location_name || "N/A"}
                  </Typography>
                  <Typography variant="caption">
                    Vence en {alert.days_to_expiration || "N/A"} días | 
                    Cantidad: {AnalyticsService.formatValue(alert.amount)} {alert.unit || ""}
                  </Typography>
                </Alert>
              ))
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  </Paper>
);

const QuickDateSelector: React.FC<{
  onSelectRange: (period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastyear') => void;
  disabled?: boolean;
}> = ({ onSelectRange, disabled = false }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
    {[
      { key: 'today' as const, label: 'Hoy' },
      { key: 'yesterday' as const, label: 'Ayer' },
      { key: 'last7days' as const, label: '7 días' },
      { key: 'last30days' as const, label: '30 días' },
      { key: 'last3months' as const, label: '3 meses' },
      { key: 'last6months' as const, label: '6 meses' },
      { key: 'lastyear' as const, label: '1 año' }
    ].map(({ key, label }) => (
      <Chip
        key={key}
        label={label}
        onClick={() => !disabled && onSelectRange(key)}
        clickable={!disabled}
        size="small"
        sx={{
          backgroundColor: '#f5f5f5',
          '&:hover': disabled ? {} : {
            backgroundColor: '#aebc86',
            color: 'white'
          },
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
    ))}
  </Box>
);

const CategorySelector: React.FC<{
  selectedCategories: AgrochemicalCategory[];
  onCategoriesChange: (categories: AgrochemicalCategory[]) => void;
  disabled?: boolean;
}> = ({ selectedCategories, onCategoriesChange, disabled = false }) => {
  const handleChange = (event: SelectChangeEvent<AgrochemicalCategory[]>) => {
    const value = event.target.value;
    onCategoriesChange(typeof value === 'string' ? value.split(',') as AgrochemicalCategory[] : value);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>Categorías de Productos</InputLabel>
      <Select
        multiple
        value={selectedCategories}
        onChange={handleChange}
        input={<OutlinedInput label="Categorías de Productos" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip 
                key={value} 
                label={value} 
                size="small"
                sx={{ 
                  backgroundColor: '#aebc86', 
                  color: 'white',
                  fontSize: '10px'
                }}
              />
            ))}
          </Box>
        )}
      >
        {AnalyticsService.AGROCHEMICAL_CATEGORIES.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Main Component
export default function EstadisticasV2View() {
  const { user, isLoading } = useUser();
  const { isReady } = useAuth();
  const { 
    dashboardData, 
    quickStats, 
    loading, 
    error, 
    dateRange,
    updateDateRange,
    setQuickDateRange,
    fetchDashboard, 
    exportData 
  } = useAnalyticsData();

  useEffect(() => {
    if (!isReady) return;
    fetchDashboard();
  }, [isReady, dateRange]);

  const handleDateRangeChange = (field: keyof AnalyticsFilters, value: string) => {
    updateDateRange({
      [field]: value
    });
  };

  const handleCategoriesChange = (categories: AgrochemicalCategory[]) => {
    updateDateRange({
      agrochemical_categories: categories
    });
  };

  // Early returns for loading and error states
  if (isLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ color: '#aebc86' }} />
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="page-container">
        <MenuBar showMenu={true} path="" />
        <Alert severity="error" sx={{ m: 3 }}>
          Error: {error}
          <Button onClick={fetchDashboard} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={true} path="" />
        
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <h1 className={styles.title}>Analytics Dashboard V2</h1>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboard}
              disabled={loading}
              sx={{ color: '#aebc86', borderColor: '#aebc86' }}
            >
              Actualizar
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={() => exportData('EXCEL')}
              sx={{ color: '#aebc86', borderColor: '#aebc86' }}
            >
              Exportar
            </Button>
          </Box>
        </Box>

        {/* Date Range Controls */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Período de Análisis
          </Typography>
          
          {/* Quick Date Selector */}
          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
            Rangos rápidos:
          </Typography>
          <QuickDateSelector 
            onSelectRange={setQuickDateRange}
            disabled={loading}
          />
          
          {/* Custom Date Range */}
          <Typography variant="body2" sx={{ mb: 1, mt: 2, color: '#666' }}>
            Rango personalizado:
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Inicio"
                type="datetime-local"
                value={dateRange.from_date?.slice(0, 16) || ''}
                onChange={(e) => handleDateRangeChange('from_date', e.target.value + ':00.000Z')}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Fin"
                type="datetime-local"
                value={dateRange.to_date?.slice(0, 16) || ''}
                onChange={(e) => handleDateRangeChange('to_date', e.target.value + ':00.000Z')}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" disabled={loading}>
                <InputLabel>Granularidad</InputLabel>
                <Select
                  value={dateRange.time_granularity || 'DAILY'}
                  label="Granularidad"
                  onChange={(e) => handleDateRangeChange('time_granularity', e.target.value as TimeGranularity)}
                >
                  {AnalyticsService.TIME_GRANULARITIES.map((granularity) => (
                    <MenuItem key={granularity} value={granularity}>
                      {granularity === 'DAILY' ? 'Diario' :
                       granularity === 'WEEKLY' ? 'Semanal' :
                       granularity === 'MONTHLY' ? 'Mensual' : 'Anual'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <CategorySelector
                selectedCategories={dateRange.agrochemical_categories || []}
                onCategoriesChange={handleCategoriesChange}
                disabled={loading}
              />
            </Grid>
          </Grid>
          
          {/* Performance Tip */}
          {dateRange.from_date && dateRange.to_date && (
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#e8f5e8', borderRadius: 1, border: '1px solid #c8e6c9' }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon sx={{ fontSize: 16 }} />
                Granularidad recomendada: {AnalyticsService.getOptimalGranularity(dateRange.from_date, dateRange.to_date)}
                {dateRange.time_granularity !== AnalyticsService.getOptimalGranularity(dateRange.from_date, dateRange.to_date) && 
                  ' (para mejor rendimiento)'}
              </Typography>
            </Box>
          )}
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress sx={{ color: '#aebc86' }} />
          </Box>
        )}

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Stats Grid */}
        {quickStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCardV2
                title="Total Aplicaciones"
                value={quickStats.total_applications}
                icon={<AssessmentIcon />}
                color="#aebc86"
                subtitle="En el período seleccionado"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCardV2
                title="Tasa de Éxito"
                value={quickStats.application_success_rate}
                icon={<TrendingUpIcon />}
                color="#6a7349"
                format="percentage"
                subtitle="Aplicaciones exitosas"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCardV2
                title="Superficie Tratada"
                value={quickStats.total_surface_treated ? `${quickStats.total_surface_treated.toFixed(1)} ha` : "N/A"}
                icon={<AgricultureIcon />}
                color="#cbcabd"
                subtitle="Hectáreas totales"
              />
            </Grid>
          </Grid>
        )}

        {/* Operational Metrics */}
        {dashboardData?.operational_metrics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCardV2
                title="Eficiencia Combustible"
                value={`${(dashboardData?.operational_metrics?.average_fuel_efficiency || 0).toFixed(1)} L/ha`}
                icon={<SpeedIcon />}
                color="#4caf50"
                subtitle="Promedio por hectárea"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCardV2
                title="Tiempo Promedio"
                value={`${(dashboardData?.operational_metrics?.average_application_lead_time || 0).toFixed(1)} hrs`}
                icon={<AssessmentIcon />}
                color="#ff9800"
                subtitle="Lead time de aplicaciones"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCardV2
                title="Eventos Stock Out"
                value={dashboardData?.operational_metrics?.stock_out_events || 0}
                icon={<WarningIcon />}
                color="#f44336"
                subtitle="En el período"
              />
            </Grid>
          </Grid>
        )}

        {/* Alerts and Recommendations */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            {dashboardData?.alerts && <AlertsCard alerts={dashboardData.alerts} />}
          </Grid>
          <Grid item xs={12} md={6}>
            {dashboardData?.recommendations && <RecommendationsCard recommendations={dashboardData.recommendations} />}
          </Grid>
        </Grid>

        {/* Inventory Overview */}
        {dashboardData?.inventory_analytics && (
          <InventoryOverviewCard inventory={dashboardData.inventory_analytics} />
        )}

        {/* Location Performance */}
        {dashboardData?.location_performance && (
          <LocationPerformanceCard locationPerformance={dashboardData?.location_performance} />
        )}

        {/* Product Usage Analytics */}
        {dashboardData?.product_usage_analytics && (
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
              Análisis de Uso de Productos
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Uso por Categoría
                </Typography>
                {dashboardData?.product_usage_analytics?.product_usage_by_category ? 
                  Object.entries(dashboardData.product_usage_analytics.product_usage_by_category).map(([category, usage]) => (
                    <Box key={category} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{category}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {AnalyticsService.formatInteger(usage)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={
                          dashboardData?.product_usage_analytics?.product_usage_by_category ?
                          (usage / Math.max(...Object.values(dashboardData.product_usage_analytics.product_usage_by_category))) * 100 :
                          0
                        } 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )) : (
                    <Typography variant="body2" color="textSecondary">
                      No hay datos de uso por categoría disponibles
                    </Typography>
                  )
                }
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Productos Más Utilizados
                </Typography>
                {dashboardData?.product_usage_analytics?.top_used_products ? 
                  dashboardData.product_usage_analytics.top_used_products.slice(0, 5).map((product, index) => (
                  <Box key={product.product_id} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    mb: 1,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={index + 1} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#aebc86', 
                          color: 'white', 
                          mr: 1,
                          minWidth: 24
                        }} 
                      />
                      <Typography variant="body2">{product.product_name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {AnalyticsService.formatInteger(product.total_amount_used)} {product.unit || ""}
                    </Typography>
                  </Box>
                )) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay datos de productos más utilizados disponibles
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Time Series Chart Placeholder */}
        {dashboardData?.time_series_analytics && (
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
              Tendencias Temporales ({dashboardData?.time_series_analytics?.granularity || "N/A"})
            </Typography>
            
            <Box sx={{ 
              height: 200, 
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #dee2e6',
              flexDirection: 'column'
            }}>
              <ShowChartIcon sx={{ fontSize: 48, color: '#aebc86', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                Gráfico de series temporales
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', textAlign: 'center' }}>
                {AnalyticsService.safeArrayLength(dashboardData?.time_series_analytics?.application_count)} puntos de datos disponibles
              </Typography>
            </Box>
          </Paper>
        )}
        </Box>
      </div>
      <Footer />
    </div>
  );
}
