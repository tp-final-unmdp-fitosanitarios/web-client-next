/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import styles from "./productos-view.module.scss";
import Link from "next/link";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { Producto } from "@/domain/models/Producto";
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
import PaginationControls from "@/components/PaginationControls/paginationControls";
import { Roles } from "@/domain/enum/Roles";

const buttons = [
    { label: "Agregar", path: "/productos/agregar" },
    { label: "Agroquímicos", path: "/productos/agroquimicos" },
];

export default function ProductosView() {
    const [productosFromServer, setProductosFromServer] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchName, setSearchName] = useState<string>("");
    const [debouncedSearchName, setDebouncedSearchName] = useState<string>("");
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [pageSize, setPageSize] = useState(10); // Tamaño de página
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageElements, setPageElements] = useState(0);
    const { getApiService, user } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    const router = useRouter();

    if(!user || !user.roles.includes(Roles.Admin)){
        router.replace("/not-found");
    }

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchName(searchName);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchName]);

    useEffect(() => {
        let isMounted = true;
        const fetchProductos = async () => {
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('size', pageSize.toString());
                if (debouncedSearchName) {
                    queryParams.append('name', debouncedSearchName);
                }

                const response = await withLoading(
                    apiService.get<ResponseItems<Producto>>(`/products?${queryParams.toString()}`),
                    "Cargando productos..."
                );
                if (response.success && isMounted) {
                    setProductosFromServer(response.data.content);
                    setTotalPages(response.data.total_pages || 0);
                    setTotalElements(response.data.total_elements || 0);
                    setPageElements(response.data.number_of_elements || 0);
                } else if (isMounted) {
                    setError(response.error || "Error al obtener los productos");
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching products:', error);
                    setError("Error al conectar con el servidor");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchProductos();
        return () => {
            isMounted = false;
        };
    }, [debouncedSearchName, page, pageSize]);

    // Cuando se cambian los filtros, volver a la primera página
    useEffect(() => {
        setPage(0);
    }, [debouncedSearchName]);

    // Handler para cambio de página
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); // MUI Pagination es 1-indexed
    };
    // Handler para cambio de tamaño de página
    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };


    const {
        items: productos,
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager<Producto>(productosFromServer);

    console.log("productos", productos);

    const items = transformToItems(productos, "id", ["name"]);
    const campos = ["name"];

    const handleQuitarItems = async () => {
        try {
            const deleteResults = await Promise.all(
                selectedIds.map(async (id) => {
                    const response = await apiService.delete("products", id);
                    return response.success;
                })
            );

            const allDeleted = deleteResults.every((success) => success);

            if (allDeleted) {
                quitarItems(); // Esto actualiza los productos visibles y muestra la modal
            } else {
                alert("Algunos productos no pudieron ser eliminados.");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    const handleModificarItems = async () => {
        console.log("Se modificara el item: " + selectedIds[0]);
        //const prodToModify = apiService.get("products",selectedIds[0]);
        //Aca deberia tirar alert si selectedIds.length > 1
        router.push(`productos/edit?Id=${selectedIds[0]}`);
    };

    const modalText =
        deletedItems.length > 0
            ? `Se han eliminado los siguientes productos:\n${deletedItems.map((p) => p.name).join("\n")}`
            : "";

    // Para backend: agregar manejo de loading y error
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
                <h1 className={styles.title}>Productos</h1>
                <div className={styles.filterContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
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
                            selectedIds={selectedIds} selectItems={true} deleteItems={false} selectSingleItem={false} />
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
                    </>
                ) : (
                    <p>No hay productos disponibles</p>
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
                        <button
                            className={`button button-secondary `}
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
                title="Productos Eliminados"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
}