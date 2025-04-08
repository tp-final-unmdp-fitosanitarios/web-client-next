"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import Link from "next/link";
import styles from "./maquinas-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import GenericModal from "@/components/modal/GenericModal";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Maquina } from "@/domain/models/Maquina";
import { useAuth } from "@/components/Auth/AuthProvider";


const buttons = [{ label: "Agregar", path: "/maquinas/agregar" }];

export default function MaquinasView() {
    const { getApiService } = useAuth();
    const apiService = getApiService();

    const [maquinasFromServer, setMaquinasFromServer] = useState<Maquina[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchMaquinas = async () => { //To do: ver porque falla la peticion
            try {
                const response = await apiService.get<ResponseItems<Maquina>>('machines');
                if (response.success) {
                    const machines = response.data.content;
                    setMaquinasFromServer(machines);
                } else {
                    setError(response.error || "Error al obtener las máquinas");
                }
            } catch (err) {
                setError("Error al conectar con el servidor" + err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaquinas();
    }, []);

    const {
        items: maquinas,
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(maquinasFromServer);

    const items = transformToItems(maquinas, "id", ["name", "internalPlate"]);
    const campos = ["name", "internalPlate"];

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


    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={false} path="home" />
                <div>Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <MenuBar showMenu={false} path="home" />
                <div>Error: {error}</div>
            </div>
        );
    }

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
                    selectItems={true}
                    deleteItems={false}
                />
            ) : (
                <p>No hay máquinas disponibles</p>
            )}

            <div className={styles.buttonContainer}>
                {selectedIds.length > 0 && (
                    <button
                        className={`button button-secondary ${styles.buttonHome}`}
                        onClick={quitarItems}  //Para backend: usar handleQuitarItems en lugar de quitarItems
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