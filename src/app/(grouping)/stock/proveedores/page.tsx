/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import MenuBar from "@/components/menuBar/MenuBar";
import styles from "./providersPage.module.scss";
import ItemList from "@/components/itemList/ItemList";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Proveedor } from "@/domain/models/Proveedor";
import { transformToItems } from "@/utilities/transform";
import { ResponseItems } from "@/domain/models/ResponseItems";
import GenericModal from "@/components/modal/GenericModal";
import AddProviderModal from "@/components/AddProviderModal/AddProviderModal";
import { Producto } from "@/domain/models/Producto";
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";
import ModalConfirmacionEliminacion from "@/components/ModalConfimacionEliminacion/ModalConfirmacionEliminacion";
import { Pagination, TextField, MenuItem, Box, Typography } from "@mui/material";

const ProvidersPage = () => {
    const { getApiService, isReady } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [showAddProvider, setShowAddProvider] = useState(false);
    const [formData, setFormData] = useState<{ name: string, description: string }>({ name: "", description: "" });
    const [selectedId, setSelectedId] = useState<string>("");
    const [selectedProviderProducts, setSelectedProviderProducts] = useState<Producto[]>([]);
    const [confirmationModalOpen,setConfirmationModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingProvider, setIsDeletingProvider] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState<any>({});
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [pageSize, setPageSize] = useState(5); // Tamaño de página
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageElements, setPageElements] = useState(0);
    const [addProviderModalOpen, setAddProviderModalOpen] = useState(false); // Nuevo estado para modal de alta

    useEffect(() => {
        if (!isReady) return;
        
        let isMounted = true;
        const fetchProviders = async () => {
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('size', pageSize.toString());
                const response = await withLoading(
                    apiService.get<ResponseItems<Proveedor>>(`/providers?${queryParams.toString()}`),
                    "Cargando proveedores..."
                );
                if (response.success && isMounted) {
                    console.log(response.data.content);
                    setProviders(response.data.content);
                    setTotalPages(response.data.total_pages || 0);
                    setTotalElements(response.data.total_elements || 0);
                    setPageElements(response.data.number_of_elements || 0);
                    if (response.data.content.length > 0) {
                        setSelectedProviderProducts(response.data.content[0].products || []);
                        setFormData({
                            name: response.data.content[0].name,
                            description: response.data.content[0].description,
                        });
                        setSelectedId(response.data.content[0].id);
                    } else {
                        setSelectedProviderProducts([]);
                        setFormData({ name: "", description: "" });
                        setSelectedId("");
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching providers:', error);
                }
            }
        };
        
        fetchProviders();
        return () => {
            isMounted = false;
        };
    }, [isReady, page, pageSize]);

    // Cuando se cambian los filtros, volver a la primera página (no hay filtros, pero si se agregan en el futuro)
    // useEffect(() => {
    //     setPage(0);
    // }, [algúnFiltro]);

    // Handler para cambio de página
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); // MUI Pagination es 1-indexed
    };
    // Handler para cambio de tamaño de página
    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleSelectSingleItem = (id: string) => {
        const provider = providers.find(provider => provider.id === id);
        if (provider) {
          setFormData({
            name: provider.name,
            description: provider.description,
          });
          setSelectedProviderProducts(provider.products || []);
          setSelectedId(provider.id);
        }
    };
    
    const items = providers ? transformToItems(providers, "id", ["name", "description"]).map((item) => {
        return {
            ...item,
            display: `${item.name} : ${item.description}`,
        };
        }) : [];
    
    const campos = ["display"];
    
    const handleAddProvider = async (name: string, description: string) => {
        const addProviderRequest = {
            name: name,
            description: description
        }

        const addProviderResponse = await apiService.create<Proveedor>("/providers", addProviderRequest);
        
        if(addProviderResponse.success){
            const newProvider = addProviderResponse.data
            setAddProviderModalOpen(true); // Mostrar modal de alta
            setProviders([...providers, newProvider]);
        }
    }
    
    const handleShowAddProvider = () => {
        setShowAddProvider(true);
    }

   

    const handleConfirmDeleteProduct= () => {
        setShowDeleteModal(false);
        //Request para eliminar producto de un provider
        apiService.delete(`/providers/remove-product?providerId=${selectedId}&productId=${entityToDelete.id}`,"");
        setSelectedProviderProducts(selectedProviderProducts.filter(p => p.id!== entityToDelete.id));
    }

    const handleDeleteProvider = (id: string) => {
        setIsDeletingProvider(true);
        setEntityToDelete(providers.find(p => p.id===id))
        setShowDeleteModal(true);
    }

    const handleConfirmDeleteProvider = () => {
        setShowDeleteModal(false);
        //Request para eliminar un provider
        apiService.delete("/providers",entityToDelete.id);
        setProviders(providers.filter(p => p.id!== entityToDelete.id));
    }

    const handleModifyProvider = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const name = formData.get("providerName") as string;
        const description = formData.get("providerDescription") as string;
        
        const provider = providers.find(provider => provider.id===selectedId);
        if (provider){
            provider.name = name;
            provider.description = description;
            const res = await apiService.update(`/providers`,provider.id,provider);
            if (res.success) {
                setConfirmationModalOpen(true);
            } else {
                console.error("Error al modificar proveedor:", res.error);
            }
        }
    }

    const handleCloseConfirmationModal = () => {
        setConfirmationModalOpen(false);
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={false} showArrow={true} path="/stock" />
                <h1 className={styles.title}>Proveedores</h1>
                <div className={styles.formAndItemListContainer}>
                    <div className={styles.itemListContainer}>
                        <h2 className={styles.subtitle}>Lista de Proveedores</h2>
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            selectItems={false}
                            deleteItems={true}
                            onDelete={handleDeleteProvider}
                            selectSingleItem={true}
                            onSelectSingleItem={handleSelectSingleItem}
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
                    </div>
                    <div className={styles.formContainer}>
                        <h2 className={styles.subtitle}>Detalle del Proveedor</h2>
                        <form className={styles.form} onSubmit={handleModifyProvider}>
                            <div className={styles.formRow}>
                                <label htmlFor="providerName" className={styles.label}>Nombre del proveedor</label>
                                <input 
                                    type="text" 
                                    id="providerName" 
                                    name="providerName" 
                                    value={formData.name} 
                                    className={styles.input}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ingrese el nombre del proveedor"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label htmlFor="providerDescription" className={styles.label}>Descripción</label>
                                <input 
                                    type="text" 
                                    id="providerDescription" 
                                    name="providerDescription" 
                                    value={formData.description} 
                                    className={styles.input}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ingrese la descripción del proveedor"
                                />
                            </div>
                            <div className={styles.formButtons}>
                                <button className={`button button-secondary `} type="submit">
                                    Modificar 
                                </button>
                            </div>
                        </form>           
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <button className={`button button-primary`} onClick={handleShowAddProvider}>
                        Agregar 
                    </button>
                </div>
                {showAddProvider && (
                    <AddProviderModal 
                        open={showAddProvider} 
                        setModalClose={() => setShowAddProvider(false)} 
                        saveProvider={handleAddProvider}
                    />
                )}
                {showDeleteModal && (
                    <ModalConfirmacionEliminacion
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={
                            isDeletingProvider
                            ? handleConfirmDeleteProvider
                            : handleConfirmDeleteProduct
                        }
                        text={
                            isDeletingProvider
                            ? `el proveedor ${entityToDelete.name}`
                            : `el producto ${entityToDelete.name} del proveedor`
                        }
                    />
                )}
                <GenericModal
                    isOpen={confirmationModalOpen}
                    onClose={handleCloseConfirmationModal}
                    title="Proveedor Modificado"
                    modalText="Se modificó el proveedor correctamente"
                    buttonTitle="Cerrar"
                    showSecondButton={false}
                />
                {/* Modal para alta de proveedor */}
                <GenericModal
                    isOpen={addProviderModalOpen}
                    onClose={() => setAddProviderModalOpen(false)}
                    title="Proveedor Creado"
                    modalText="Se creó el proveedor correctamente."
                    buttonTitle="Cerrar"
                    showSecondButton={false}
                />
            </div>
            <Footer />
        </div>
    )
};

export default ProvidersPage;


