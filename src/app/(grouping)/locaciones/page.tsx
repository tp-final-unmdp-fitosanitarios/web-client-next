"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import styles from "./locaciones-view.module.scss";
import Link from "next/link";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { Locacion } from "@/domain/models/Locacion";
import { transformToItems } from "@/utilities/transform";
import { useItemsManager } from "@/hooks/useItemsManager";
import GenericModal from "@/components/modal/GenericModal";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useAuth } from "@/components/Auth/AuthProvider";
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import LocationDetailsModal from "@/components/LocationDetailsModal/LocationDetailsModal";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Roles } from "@/domain/enum/Roles";

const buttons = [{ label: "Agregar", path: "/locaciones/agregar" }];

const locationTypes = {
    ZONE: "Zona",
    WAREHOUSE: "Depósito",
    FIELD: "Campo",
    CROP: "Cultivo",
    LOT: "Lote"
};

export default function LocacionesView() {
    const [locacionesFromServer, setLocacionesFromServer] = useState<Locacion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("WAREHOUSE");
    const [shouldFetch, setShouldFetch] = useState<boolean>(true);
    const [selectedLocation, setSelectedLocation] = useState<Locacion | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const { getApiService, user } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    const router = useRouter();

    if(!user || !user.roles.includes(Roles.Admin)){
        router.replace("/not-found");
    }

    useEffect(() => {
        let isMounted = true;
        const fetchLocaciones = async () => {
            if (!shouldFetch) return;
            
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (typeFilter) queryParams.append('type', typeFilter);
                queryParams.append('size', '100');

                const response = await withLoading(
                    apiService.get<Locacion[]>(`/locations?${queryParams.toString()}`),
                    "Cargando locaciones..."
                );
                if (response.success && isMounted) {
                    setLocacionesFromServer(response.data);
                    setError("");
                } else if (isMounted) {
                    setError(response.error || "Error al obtener las locaciones");
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching locations:', error);
                    setError("Error al conectar con el servidor");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setShouldFetch(false);
                }
            }
        };
        fetchLocaciones();
        return () => {
            isMounted = false;
        };
    }, [shouldFetch, typeFilter]);

    const {
        items: locaciones,
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager<Locacion>(locacionesFromServer);

    const items = transformToItems(locaciones || [], "id", ["name", "type", "area"]);
    const campos = ["name", "type", "area"];

    const getLocalizedType = (type: string) => {
        return locationTypes[type as keyof typeof locationTypes] || type;
    };

    const transformedItems = items.map(item => ({
        ...item,
        type: getLocalizedType(item.type),
        area: (item.type === 'CROP' || item.type === 'FIELD') && item.area ? `${item.area} ha` : '-'
    }));

    const handleSearch = () => {
        setShouldFetch(true);
    };

    const handleQuitarItems = async () => {
        try {
            const deleteResults = await Promise.all(
                selectedIds.map(async (id) => {
                    const response = await apiService.delete("locations", id);
                    return response.success;
                })
            );

            const allDeleted = deleteResults.every((success) => success);

            if (allDeleted) {
                quitarItems();
                setShouldFetch(true); // Refresh the list after deletion
            } else {
                alert("Algunas locaciones no pudieron ser eliminadas.");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    const handleModificarItems = async () => {
        router.push(`locaciones/edit?Id=${selectedIds[0]}`);
    };

    const handleViewDetails = (e: React.MouseEvent, location: Locacion) => {
        e.stopPropagation();
        setSelectedLocation(location);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedLocation(null);
    };

    const renderActions = (item: Record<string, string>) => {
        const location = locacionesFromServer.find(l => l.id === item.id);
        if (!location) return null;
        
        return (
            <IconButton
                onClick={(e) => handleViewDetails(e, location)}
                color="primary"
                size="small"
            >
                <VisibilityIcon />
            </IconButton>
        );
    };

    const modalText =
        deletedItems.length > 0
            ? `Se han eliminado las siguientes locaciones:\n${deletedItems.map((l) => l.name).join("\n")}`
            : "";

    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div className={styles.loadingContainer}>Cargando...</div>
                <Footer />
            </div>
        );
    }

    /*if (error) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div className={styles.errorContainer}>Error: {error}</div>
                <Footer />
            </div>
        );
    }*/

    return (
        <div className="page-container">
            <div className={styles.contentWrap}>
                <MenuBar showMenu={true} path="" />
                <div className={styles.mainContent}>
                    <h1 className={styles.title}>Ubicaciones</h1>

                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="typeFilter" className={styles.filterLabel}>Tipo:</label>
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Todos los tipos</option>
                                {Object.entries(locationTypes).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            className={`button button-primary ${styles.searchButton}`}
                            onClick={handleSearch}
                        >
                            Buscar
                        </button>
                    </div>

                    {transformedItems.length > 0 ? (
                        <ItemList
                            items={transformedItems}
                            displayKeys={campos}
                            onSelect={toggleSelectItem}
                            selectedIds={selectedIds}
                            selectItems={true}
                            deleteItems={false}
                            selectSingleItem={false}
                            actions={renderActions}
                        />
                    ) : (
                        <p className={styles.noResults}>No hay locaciones disponibles</p>
                    )}

                    <div className={styles.buttonContainer}>
                        <>
                            <button
                                className={`button button-secondary ${styles.buttonHome}`}
                                onClick={handleQuitarItems}
                                disabled={selectedIds.length !== 1}
                            >
                                Quitar
                            </button>
                        </>
                        {buttons.map((button, index) => (
                            <Link key={index} href={button.path}>
                                <button className={`button button-primary ${styles.buttonHome}`}>
                                    {button.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
            <GenericModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Locaciones Eliminadas"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
            <LocationDetailsModal
                open={showDetailsModal}
                onClose={handleCloseDetailsModal}
                location={selectedLocation}
            />
        </div>
    );
} 