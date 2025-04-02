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
import { apiService } from "@/services/api-service";
import { ResponseItems } from "@/domain/models/ResponseItems";

const buttons = [{ label: "Agregar", path: "/productos/agregar" }];

export default function ProductosView() {
     const [productosFromServer, setProductosFromServer] = useState<Producto[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchProductos = async () => {//bearer token
            try {
                const response = await apiService.get<ResponseItems<Producto>>('products');
                if (response.success) {
                    const products = response.data.content;
                    setProductosFromServer(products);
                } else {
                    setError(response.error || "Error al obtener los productos");
                }
            } catch (err) {
                setError("Error al conectar con el servidor" + err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);



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

    // Para backend: agregar esta función para sincronizar eliminaciones con el servidor
    // const handleQuitarItems = async () => {
    //     try {
    //         const response = await apiService.delete('productos', { ids: selectedIds });
    //         if (response.success) {
    //             quitarItems(); // Solo llamamos a quitarItems si la eliminación en el backend es exitosa
    //         } else {
    //             alert("Error al eliminar productos");
    //         }
    //     } catch (err) {
    //         alert("Error al conectar con el servidor");
    //     }
    // };

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
            <MenuBar showMenu={true} path="" />
            <h1 className={styles.title}>Productos</h1>

            {items.length > 0 ? (
                <ItemList
                    items={items}
                    displayKeys={campos}
                    onSelect={toggleSelectItem}
                    selectedIds={selectedIds} selectItems={true} deleteItems={false}                />
            ) : (
                <p>No hay productos disponibles</p>
            )}

            <div className={styles.buttonContainer}>
                {selectedIds.length > 0 && (
                    <button
                        className={`button button-secondary ${styles.buttonHome}`}
                        onClick={quitarItems} // Para backend: usar handleQuitarItems en lugar de quitarItems
                    >
                        Quitar
                    </button>
                )}
                {buttons.map((button, index) => (
                    <Link key={index} href={button.path}>
                        <button className={`button button-primary ${styles.buttonHome}`}>
                            {button.label}
                        </button>
                    </Link>
                ))}
            </div>

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