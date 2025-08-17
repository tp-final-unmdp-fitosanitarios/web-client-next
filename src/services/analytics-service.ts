import ApiService from './api-service';

// Enum definitions based on Analytics API README
export type AgrochemicalCategory = 
  | 'HERBICIDE' 
  | 'FUNGICIDE' 
  | 'INSECTICIDE' 
  | 'BACTERICIDE' 
  | 'NEMATICIDE' 
  | 'ADJUVANT' 
  | 'OTHER';

export type MovementType = 'INGRESS' | 'EGRESS';

export type ApplicationStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'FINISHED' 
  | 'REJECTED' 
  | 'CANCELED' 
  | 'NEEDS_REUPLOAD' 
  | 'APPROVED';

export type LocationType = 'ZONE' | 'WAREHOUSE' | 'FIELD' | 'LOT' | 'CROP';

export type ProductUnit = 'KG' | 'LT' | 'UN';

export type TimeGranularity = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type ExportFormat = 'CSV' | 'EXCEL' | 'PDF';

export interface AnalyticsFilters {
  from_date?: string;
  to_date?: string;
  location_ids?: string[];
  agrochemical_categories?: AgrochemicalCategory[];
  time_granularity?: TimeGranularity;
}

export interface AnalyticsDashboardResponse {
  period_start: string;
  period_end: string;
  operational_metrics: OperationalMetrics;
  inventory_analytics: InventoryAnalytics;
  product_usage_analytics: ProductUsageAnalytics;
  location_performance: LocationPerformance;
  time_series_analytics: TimeSeriesAnalytics;
  alerts: Alert[];
  recommendations: Recommendation[];
}

export interface OperationalMetrics {
  application_success_rate: number;
  total_surface_treated: number;
  average_fuel_efficiency: number;
  average_lead_time_hours: number;
  stock_out_events: number;
  period_start: string;
  period_end: string;
}

export interface InventoryAnalytics {
  current_stock_levels: Record<string, number>;
  low_stock_alerts: LowStockAlert[];
  expiration_alerts: ExpirationAlert[];
  total_inventory_value: number;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  location_id: string;
  location_name: string;
  current_stock: number;
  suggested_reorder_level: number;
  unit: ProductUnit;
}

export interface ExpirationAlert {
  product_id: string;
  product_name: string;
  location_id: string;
  location_name: string;
  expiration_date: string;
  days_to_expiration: number;
  amount: number;
  unit: ProductUnit;
}

export interface ProductUsageAnalytics {
  product_usage_by_category: Record<string, number>;
  top_used_products: TopProduct[];
  seasonal_usage_patterns: Record<string, number>;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_usage: number;
  unit: ProductUnit;
}

export interface LocationPerformance {
  location_metrics: Record<string, LocationMetric>;
}

export interface LocationMetric {
  location_id: string;
  location_name: string;
  total_applications: number;
  successful_applications: number;
  success_rate: number;
  total_surface_treated: number;
  average_fuel_efficiency: number;
}

export interface TimeSeriesAnalytics {
  stock_movements: TimeSeriesPoint[];
  application_volume: TimeSeriesPoint[];
  granularity: string;
}

export interface TimeSeriesPoint {
  period: string;
  value: number;
}

export interface Alert {
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  action_required: string;
  created_at: string;
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  potential_savings: string | null;
  priority: RecommendationPriority;
}

export interface QuickStats {
  total_applications: number;
  successful_applications: number;
  application_success_rate: number;
  total_surface_treated: number;
  low_stock_alerts_count: number;
  expiration_alerts_count: number;
  average_fuel_efficiency: number;
  total_inventory_value: number;
  period_start: string;
  period_end: string;
}

export interface ExportRequest {
  from_date?: string;
  to_date?: string;
  format: ExportFormat;
  include_sections: string[];
  location_ids?: string[];
  agrochemical_categories?: AgrochemicalCategory[];
}

export interface ExportResponse {
  download_url: string;
  file_name: string;
  file_size: number;
  expires_at: string;
  format: string;
  generated_at: string;
}

export class AnalyticsService {
  constructor(private apiService: ApiService) {}

  // Enum validation utilities
  static readonly AGROCHEMICAL_CATEGORIES: AgrochemicalCategory[] = [
    'HERBICIDE', 'FUNGICIDE', 'INSECTICIDE', 'BACTERICIDE', 'NEMATICIDE', 'ADJUVANT', 'OTHER'
  ];

  static readonly APPLICATION_STATUSES: ApplicationStatus[] = [
    'PENDING', 'IN_PROGRESS', 'FINISHED', 'REJECTED', 'CANCELED', 'NEEDS_REUPLOAD', 'APPROVED'
  ];

  static readonly MOVEMENT_TYPES: MovementType[] = ['INGRESS', 'EGRESS'];

  static readonly LOCATION_TYPES: LocationType[] = ['ZONE', 'WAREHOUSE', 'FIELD', 'LOT', 'CROP'];

  static readonly PRODUCT_UNITS: ProductUnit[] = ['KG', 'LT', 'UN'];

  static readonly TIME_GRANULARITIES: TimeGranularity[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

  static readonly EXPORT_FORMATS: ExportFormat[] = ['CSV', 'EXCEL', 'PDF'];

  // Validation methods
  static isValidAgrochemicalCategory(category: string): category is AgrochemicalCategory {
    return this.AGROCHEMICAL_CATEGORIES.includes(category as AgrochemicalCategory);
  }

  static isValidApplicationStatus(status: string): status is ApplicationStatus {
    return this.APPLICATION_STATUSES.includes(status as ApplicationStatus);
  }

  static isValidTimeGranularity(granularity: string): granularity is TimeGranularity {
    return this.TIME_GRANULARITIES.includes(granularity as TimeGranularity);
  }

  static isValidExportFormat(format: string): format is ExportFormat {
    return this.EXPORT_FORMATS.includes(format as ExportFormat);
  }

  /**
   * Get comprehensive dashboard with all metrics and KPIs
   */
  async getDashboard(filters?: AnalyticsFilters): Promise<AnalyticsDashboardResponse> {
    const response = await this.apiService.create<AnalyticsDashboardResponse>(
      'api/analytics/dashboard',
      filters || {}
    );

    if (!response.success) {
      throw new Error(response.error || 'Error fetching dashboard data');
    }

    return response.data;
  }

  /**
   * Get high-level KPIs for dashboard widgets and quick reports
   */
  async getQuickStats(fromDate?: string, toDate?: string): Promise<QuickStats> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const endpoint = `api/analytics/quick-stats${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await this.apiService.get<QuickStats>(endpoint);

    if (!response.success) {
      throw new Error(response.error || 'Error fetching quick stats');
    }

    return response.data;
  }

  /**
   * Get operational efficiency metrics
   */
  async getOperationalMetrics(filters?: AnalyticsFilters): Promise<OperationalMetrics> {
    const response = await this.apiService.create<OperationalMetrics>(
      'api/analytics/operational-metrics',
      filters || {}
    );

    if (!response.success) {
      throw new Error(response.error || 'Error fetching operational metrics');
    }

    return response.data;
  }

  /**
   * Get current stock levels, alerts, and inventory optimization insights
   */
  async getInventoryAnalytics(filters?: AnalyticsFilters): Promise<InventoryAnalytics> {
    const response = await this.apiService.create<InventoryAnalytics>(
      'api/analytics/inventory',
      filters || {}
    );

    if (!response.success) {
      throw new Error(response.error || 'Error fetching inventory analytics');
    }

    return response.data;
  }

  /**
   * Get product usage patterns, top products, and consumption trends
   */
  async getProductUsageAnalytics(filters?: AnalyticsFilters): Promise<ProductUsageAnalytics> {
    const response = await this.apiService.create<ProductUsageAnalytics>(
      'api/analytics/product-usage',
      filters || {}
    );

    if (!response.success) {
      throw new Error(response.error || 'Error fetching product usage analytics');
    }

    return response.data;
  }

  /**
   * Get performance comparison across different locations and zones
   */
  async getLocationPerformance(filters?: AnalyticsFilters): Promise<LocationPerformance> {
    const response = await this.apiService.create<LocationPerformance>(
      'api/analytics/location-performance',
      filters || {}
    );

    if (!response.success) {
      throw new Error(response.error || 'Error fetching location performance');
    }

    return response.data;
  }

  /**
   * Get historical trends and time-based analytics
   */
  async getTimeSeriesData(filters?: AnalyticsFilters): Promise<TimeSeriesAnalytics> {
    const response = await this.apiService.create<TimeSeriesAnalytics>(
      'api/analytics/time-series',
      filters || {}
    );

    if (!response.success) {
      throw new Error(response.error || 'Error fetching time series data');
    }

    return response.data;
  }

  /**
   * Export comprehensive data in various formats
   */
  async exportAnalytics(exportRequest: ExportRequest): Promise<ExportResponse> {
    const response = await this.apiService.create<ExportResponse>(
      'api/analytics/export',
      exportRequest
    );

    if (!response.success) {
      throw new Error(response.error || 'Error exporting analytics data');
    }

    return response.data;
  }

  /**
   * Helper method to get common date ranges with optimal granularity
   * Based on Performance Tips from the API documentation
   */
  static getDateRange(period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastyear'): AnalyticsFilters {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          from_date: today.toISOString(),
          to_date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          time_granularity: 'DAILY'
        };
      
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          from_date: yesterday.toISOString(),
          to_date: today.toISOString(),
          time_granularity: 'DAILY'
        };
      
      case 'last7days':
        return {
          from_date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          to_date: now.toISOString(),
          time_granularity: 'DAILY' // DAILY for <30 days
        };
      
      case 'last30days':
        return {
          from_date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to_date: now.toISOString(),
          time_granularity: 'DAILY' // DAILY for <30 days
        };
      
      case 'last3months':
        return {
          from_date: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString(),
          to_date: now.toISOString(),
          time_granularity: 'WEEKLY' // WEEKLY for <6 months
        };
      
      case 'last6months':
        return {
          from_date: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString(),
          to_date: now.toISOString(),
          time_granularity: 'WEEKLY' // WEEKLY for <6 months
        };
      
      case 'lastyear':
        return {
          from_date: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString(),
          to_date: now.toISOString(),
          time_granularity: 'MONTHLY' // MONTHLY for longer periods
        };
      
      default:
        return {
          from_date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to_date: now.toISOString(),
          time_granularity: 'DAILY'
        };
    }
  }

  /**
   * Helper method to get optimal time granularity based on date range
   * Implements Performance Tips from API documentation
   */
  static getOptimalGranularity(fromDate: string, toDate: string): TimeGranularity {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const daysDifference = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference <= 30) {
      return 'DAILY'; // DAILY for <30 days
    } else if (daysDifference <= 180) {
      return 'WEEKLY'; // WEEKLY for <6 months
    } else {
      return 'MONTHLY'; // MONTHLY for longer periods
    }
  }

  /**
   * Helper method to format dates for the API
   */
  static formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Helper method to validate date ranges
   */
  static validateDateRange(fromDate: string, toDate: string): boolean {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return from <= to;
  }

  /**
   * Helper method to safely format values, returning "N/A" for null/undefined
   */
  static formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "N/A";
    }
    
    if (typeof value === 'number') {
      if (isNaN(value)) {
        return "N/A";
      }
      return value.toLocaleString();
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return String(value);
  }

  /**
   * Helper method to safely format percentages
   */
  static formatPercentage(value: number | null | undefined, decimals: number = 1): string {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Helper method to safely format currency
   */
  static formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  /**
   * Helper method to safely format integers
   */
  static formatInteger(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }
    return value.toLocaleString();
  }

  /**
   * Helper method to safely get array length or return 0
   */
  static safeArrayLength(array: any[] | null | undefined): number {
    return array?.length || 0;
  }

  /**
   * Helper method to safely access object properties
   */
  static safeGet<T>(obj: Record<string, unknown> | null | undefined, key: string, defaultValue: T): T {
    if (!obj || obj[key] === undefined || obj[key] === null) {
      return defaultValue;
    }
    return obj[key] as T;
  }
}

export default AnalyticsService;
