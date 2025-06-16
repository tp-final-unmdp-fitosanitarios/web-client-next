"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useLoading } from "@/hooks/useLoading";
import MenuBar from "@/components/menuBar/MenuBar";
import styles from "./consolidado.module.scss";
import { Locacion } from "@/domain/models/Locacion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NeededStock {
  productId: string;
  productName: string;
  amount: number;
  unit: string;
}

interface RecipeItem {
  product_id: string;
  amount: number;
  unit: string;
  dose_type: string;
  lot_number: string;
}

interface Recipe {
  type: string;
  recipeItems: RecipeItem[];
}

interface Application {
  id: string;
  companyId: string;
  locationId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  externalId: string;
  surface: number;
  type: string;
  applicatorId: string;
  engineerId: string;
  recipe: Recipe;
  actualApplication: Recipe;
  attachmentUrl: string;
  location: {
    id: string;
    name: string;
    address: string;
    area: string;
    parent_location: string;
    parent_location_id: string;
    type: string;
    created_at: string;
    end_of_sowing: string;
    crop_number: string;
    variety: string;
  };
}

interface ConsolidatedResponse {
  applications: Application[];
  needed_stocks: NeededStock[];
}

export default function ConsolidadoPage() {
  const [zones, setZones] = useState<Locacion[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState<string>(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());

  const { getApiService, isReady } = useAuth();
  const { withLoading } = useLoading();
  const apiService = getApiService();

  const fetchZones = async () => {
    try {
      const response = await withLoading(
        apiService.get<Locacion[]>("/locations?type=ZONE"),
        "Cargando zonas..."
      );
      if (response.success) {
        setZones(response.data);
        // Select the first zone by default if available
        if (response.data.length > 0) {
          setSelectedZone(response.data[0].id);
        }
      } else {
        setError(response.error || "Error al obtener las zonas");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  const fetchConsolidatedData = async () => {
    if (!selectedZone) return;

    try {
      const queryParams = new URLSearchParams({
        zoneId: selectedZone,
        from: new Date(fromDate).toISOString(),
        to: new Date(toDate).toISOString(),
      });

      const response = await withLoading(
        apiService.get<ConsolidatedResponse>(`/applications/recipes/consolidated?${queryParams}`),
        "Cargando datos consolidados..."
      );

      if (response.success) {
        setConsolidatedData(response.data);
      } else {
        setError(response.error || "Error al obtener los datos consolidados");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    fetchZones();
  }, [isReady]);

  useEffect(() => {
    if (selectedZone) {
      fetchConsolidatedData();
    }
  }, [selectedZone, fromDate, toDate]);

  const toggleApplication = (applicationId: string) => {
    setExpandedApplications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  return (
    <div className="page-container">
      <MenuBar showMenu={true} />
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Consolidado de Recetas</h1>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="zone">Zona:</label>
            <select
              id="zone"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccione una zona</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="fromDate">Desde:</label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="toDate">Hasta:</label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : consolidatedData ? (
          <div className={styles.content}>
            <div className={styles.stocksSection}>
              <h2>Stock Necesario</h2>
              {consolidatedData.needed_stocks.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidatedData.needed_stocks.map((stock) => (
                      <tr key={stock.productId}>
                        <td>{stock.productName}</td>
                        <td>{stock.amount}</td>
                        <td>{stock.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.noData}>No hay stock necesario para el período seleccionado</p>
              )}
            </div>

            <div className={styles.applicationsSection}>
              <h2>Aplicaciones</h2>
              {consolidatedData.applications.length > 0 ? (
                consolidatedData.applications.map((app) => (
                  <div key={app.id} className={styles.applicationCard}>
                    <div 
                      className={styles.applicationHeader}
                      onClick={() => toggleApplication(app.id)}
                    >
                      <h3>{app.location.name}</h3>
                      <span className={styles.expandIcon}>
                        {expandedApplications.has(app.id) ? "▼" : "▶"}
                      </span>
                    </div>
                    
                    {expandedApplications.has(app.id) && (
                      <div className={styles.applicationDetails}>
                        <p><strong>Estado:</strong> {app.status}</p>
                        <p><strong>Superficie:</strong> {app.surface} ha</p>
                        <p><strong>Fecha:</strong> {format(new Date(app.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                        
                        <div className={styles.recipeSection}>
                          <h4>Receta</h4>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Unidad</th>
                                <th>Tipo de Dosis</th>
                                <th>Lote</th>
                              </tr>
                            </thead>
                            <tbody>
                              {app.recipe.recipeItems.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.product_id}</td>
                                  <td>{item.amount}</td>
                                  <td>{item.unit}</td>
                                  <td>{item.dose_type}</td>
                                  <td>{item.lot_number}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.noData}>No hay aplicaciones para el período seleccionado</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 