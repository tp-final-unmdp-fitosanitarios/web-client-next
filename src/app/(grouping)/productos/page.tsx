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
const buttons = [{ label: "Agregar", path: "/productos/agregar" }];

export default function ProductosView() {
     const [productosFromServer, setProductosFromServer] = useState<Producto[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string>("");
     const [searchName, setSearchName] = useState<string>("");
     const [debouncedSearchName, setDebouncedSearchName] = useState<string>("");
     const { getApiService } = useAuth();
     const { withLoading } = useLoading();
     const apiService = getApiService();
     const router = useRouter();

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
                queryParams.append('size', '100');
                if (debouncedSearchName) {
                    queryParams.append('name', debouncedSearchName);
                }
                
                const response = await withLoading(
                    apiService.get<ResponseItems<Producto>>(`/products?${queryParams.toString()}`),
                    "Cargando productos..."
                );
                if (response.success && isMounted) {
                    setProductosFromServer(response.data.content);
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
    }, [debouncedSearchName]);



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
        console.log("Se modificara el item: "+selectedIds[0]);
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
            <h1 className={styles.title}>Productos</h1>
            <Link href="/productos/agroquimicos" style={{textDecoration: "none"}}>
              
              <h3 className={styles.subtitle}>  Gestionar Agroquímicos </h3>     
           
            </Link>

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
                <ItemList
                    items={items}
                    displayKeys={campos}
                    onSelect={toggleSelectItem}
                    selectedIds={selectedIds} selectItems={true} deleteItems={false}  selectSingleItem={false}  />
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