/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import styles from "./agroquimicos-view.module.scss";
import Link from "next/link";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { Agroquimico } from "@/domain/models/Agroquimico";
import { transformToItems } from "@/utilities/transform";
import { useItemsManager } from "@/hooks/useItemsManager";
import GenericModal from "@/components/modal/GenericModal";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useAuth } from "@/components/Auth/AuthProvider";
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import { Pagination, TextField, MenuItem, Box, Typography } from "@mui/material";


const buttons = [{ label: "Agregar", path: "agroquimicos/agregar" }];

export default function AgroquimicosView() {
    const [agroquimicosFromServer, setAgroquimicosFromServer] = useState<Agroquimico[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchName, setSearchName] = useState<string>("");
    const [debouncedSearchName, setDebouncedSearchName] = useState<string>("");
    const { getApiService, isReady } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    const router = useRouter();

    // Estados de paginación
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [pageSize, setPageSize] = useState(10); // Tamaño de página
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageElements, setPageElements] = useState(0);

    // Handler para cambio de página
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); // MUI Pagination es 1-indexed
    };
    // Handler para cambio de tamaño de página
    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchName(searchName);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchName]);


    useEffect(() => {
        if (!isReady) return;

        let isMounted = true;
        const fetchAgroquimicos = async () => {
            try {

                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('size', pageSize.toString());
                if (debouncedSearchName) {
                    queryParams.append('name', debouncedSearchName);
                }
                
                // const response = await withLoading(
                //     apiService.get<ResponseItems<Agroquimico>>(`/agrochemical?${queryParams.toString()}`),
                //     "Cargando productos..."
                // ); // para implementar la busqueda de agroquimicos

                const response = await withLoading(
                    apiService.get<ResponseItems<Agroquimico>>(`/agrochemicals?${queryParams.toString()}`),
                    "Cargando agroquímicos..."
                );
                if (response.success && isMounted) {
                    setAgroquimicosFromServer(response.data.content);
                    setTotalPages(response.data.total_pages || 0);
                    setTotalElements(response.data.total_elements || 0);
                    setPageElements(response.data.number_of_elements || 0);
                } else if (isMounted) {
                    setError(response.error || "Error al obtener los agroquímicos");
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching agrochemicals:', error);
                    setError("Error al conectar con el servidor");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchAgroquimicos();
        return () => {
            isMounted = false;
        };
    }, [isReady, page, pageSize]);

    const {
        items: agroquimicos,  
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager<Agroquimico>(agroquimicosFromServer); 

    const items = transformToItems(agroquimicos, "id", ["active_principle", "category"]);
    const campos = ["active_principle", "category"];
    
    const handleQuitarItems = async () => {
        try {
            const deleteResults = await Promise.all(
                selectedIds.map(async (id) => {
                    const response = await apiService.delete("agrochemicals", id);
                    return response.success;
                })
            );
    
            const allDeleted = deleteResults.every((success) => success);
    
            if (allDeleted) {
                quitarItems();
            } else {
                alert("Algunos agroquímicos no pudieron ser eliminados.");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    const handleDeleteSingleItem = async (id: string) => {
        try {
            const response = await apiService.delete("agrochemicals", id);
            if (response.success) {
                // Actualizar la lista local eliminando el item
                setAgroquimicosFromServer(prev => prev.filter(item => item.id !== id));
            } else {
                alert("No se pudo eliminar el agroquímico.");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };
    
    const handleModificarItems = async () => {
        router.push(`agroquimicos/edit?Id=${selectedIds[0]}`);
    };
    
    const modalText =
        deletedItems.length > 0
            ? `Se han eliminado los siguientes agroquímicos:\n${deletedItems.map((a) => a.active_principle).join("\n")}`
            : "";

    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Cargando...</div>
            </div>
        );
    }
    
    if (error && error !== "Network Error") {
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
                <h1 className={styles.title}>Agroquímicos</h1>

                <div className={styles.filterContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por principio activo..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

            
                {items.length > 0 ? (
                    <>
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            onSelect={toggleSelectItem}
                            selectedIds={selectedIds}
                            selectItems={true}
                            deleteItems={false}
                            selectSingleItem={false}
                        />
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
                    </>
                ) : (
                    <p>No hay agroquímicos disponibles</p>
                )}
                <div className={styles.buttonContainer}>
                <>
                    <button
                        className={`button button-secondary ${styles.buttonHome}`}
                        onClick={handleModificarItems}
                        disabled={selectedIds.length !== 1}
                    >
                        Modificar
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
            <Footer />
            <GenericModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Agroquímicos Eliminados"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
} 