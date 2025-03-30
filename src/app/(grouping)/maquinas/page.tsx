"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import Link from "next/link";
import styles from "./maquinas-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import GenericModal from "@/components/modal/GenericModal";
// Para backend: import { useEffect, useState } from "react";
// Para backend: import { apiService } from "@/services/api-service";

// Definimos una interfaz para las máquinas (recomendado para tipado fuerte en TypeScript)
interface Maquina {
    id: number;
    name: string;
    code: string;
}

const initialMaquinas: Maquina[] = [
    { id: 1, name: "Maquina 1", code: "EPP-123" },
    { id: 2, name: "Maquina 2", code: "EPP-678" },
    { id: 3, name: "Maquina 3", code: "EPP-101" },
    { id: 4, name: "Maquina 4", code: "EPP-223" },
    { id: 6, name: "Maquina 5", code: "EPP-668" },
    { id: 37, name: "Maquina 6", code: "EPP-156" },
    { id: 11, name: "Maquina 7", code: "EPP-112" },
    { id: 22, name: "Maquina 8", code: "EPP-768" },
    { id: 33, name: "Maquina 9", code: "EPP-571" },
    { id: 222, name: "Maquina 10", code: "EPP-623" },
    { id: 332, name: "Maquina 11", code: "EPP-478" },
    { id: 313, name: "Maquina 12", code: "EPP-091" },
];

const buttons = [{ label: "Agregar", path: "/maquinas/agregar" }];

export default function MaquinasView() {
    // Para backend: const [maquinasFromServer, setMaquinasFromServer] = useState<Maquina[]>([]);
    // Para backend: const [loading, setLoading] = useState<boolean>(true);
    // Para backend: const [error, setError] = useState<string>("");

    // Para backend: useEffect(() => {
    //     const fetchMaquinas = async () => {
    //         try {
    //             const response = await apiService.get<Maquina[]>('maquinas');
    //             if (response.success) {
    //                 setMaquinasFromServer(response.data);
    //             } else {
    //                 setError(response.error || "Error al obtener las máquinas");
    //             }
    //         } catch (err) {
    //             setError("Error al conectar con el servidor");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchMaquinas();
    // }, []);

    const {
        items: maquinas,  // Usamos los datos mockeados como base
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(initialMaquinas); // Para backend: pasar maquinasFromServer en lugar de initialMaquinas

    const items = transformToItems(maquinas, "id", ["name", "code"]);
    const campos = ["name", "code"];

    // Para backend: agregar esta función para sincronizar eliminaciones con el servidor
    // const handleQuitarItems = async () => {
    //     try {
    //         const response = await apiService.delete('maquinas', { ids: selectedIds });
    //         if (response.success) {
    //             quitarItems(); // Solo llamamos a quitarItems si la eliminación en el backend es exitosa
    //         } else {
    //             alert("Error al eliminar máquinas");
    //         }
    //     } catch (err) {
    //         alert("Error-unknown al conectar con el servidor");
    //     }
    // };

    const modalText =
        deletedItems.length > 0
            ? `Se han eliminado las siguientes máquinas:\n${deletedItems.map((m) => m.name).join("\n")}`
            : "";

    // Para backend: agregar manejo de loading y error
    // if (loading) {
    //     return (
    //         <div className="page-container">
    //             <MenuBar showMenu={false} path="home" />
    //             <div>Cargando...</div>
    //         </div>
    //     );
    // }
    //
    // if (error) {
    //     return (
    //         <div className="page-container">
    //             <MenuBar showMenu={false} path="home" />
    //             <div>Error: {error}</div>
    //         </div>
    //     );
    // }

    return (
        <div className="page-container">
            <MenuBar showMenu={false} path="home" />
            <h1 className={styles.title}>Máquinas</h1>

            {items.length > 0 ? (
                <ItemList
                    items={items}
                    displayKeys={campos}
                    onSelect={toggleSelectItem}
                    selectedIds={selectedIds}
                />
            ) : (
                <p>No hay máquinas disponibles</p>
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
                title="Máquinas Eliminadas"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
}