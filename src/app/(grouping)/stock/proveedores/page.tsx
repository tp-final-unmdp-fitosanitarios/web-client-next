"use client";
import MenuBar from "@/components/menuBar/MenuBar";
import styles from "./providersPage.module.scss";
import ItemList from "@/components/itemList/ItemList";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Proveedor } from "@/domain/models/Proveedor";
import { transformToItems } from "@/utilities/transform";
import Formulario from "@/components/formulario/formulario";
import { Field } from "@/domain/models/Field";
import { ResponseItems } from "@/domain/models/ResponseItems";
import GenericModal from "@/components/modal/GenericModal";
import AddProviderModal from "@/components/AddProviderModal/AddProviderModal";

const ProvidersPage = () => { //TODO: Modificar los proveedores
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Proveedor | null>(null);
    const [showAddProvider, setShowAddProvider] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            const providers = await apiService.get<ResponseItems<Proveedor>>("/providers");
            setProviders(providers.data.content);
            setSelectedProvider(providers.data.content[0]);
        };
        
        if (isReady)
            fetchProviders();
        
    }, [isReady]);
    
    const handleSelectSingleItem = (id: string) => {
        const provider = providers.find(provider => provider.id === id);
        if (provider) 
            setSelectedProvider(provider);
    };
    
    const items = providers ? transformToItems(providers, "id", ["name", "description"]).map((item) => {
        return {
            ...item,
            display: `${item.name} : ${item.description}`,
        };
        }) : [];
    
    const campos = ["display"];
    
    const fields: Field[] = [
        { name: "nombreProveedor", label: "Nombre del proveedor", type: "text"},
        { name: "descripcion", label: "Descripcion", type: "number"},
    ];
    
    const handleAddProvider = async (name: string, description: string) => {
        const addProviderRequest = {
            name: name,
            description: description
        }
        const addProviderResponse = await apiService.create("/providers", addProviderRequest);
        
        console.log(addProviderResponse);
    }
    
    const handleShowAddProvider = () => {
        setShowAddProvider(true);
    }

    const handleModifyProvider = async () => {
        console.log("");
    }


    return (
        <div className={styles.pageContainer}>
            <MenuBar showMenu={false} showArrow={true} path="/stock" />
            <div className={styles.formAndItemListContainer}>
                <div className={styles.itemListContainer}>
                    <h2 className={styles.subtitle}>Proveedores</h2>
                    <ItemList
                    items={items}
                    displayKeys={campos}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={true}
                    onSelectSingleItem={handleSelectSingleItem}
                    />
            </div>
            <div className={styles.formContainer}>
                <h2 className={styles.subtitle}>Detalle</h2>
                <form className={styles.form}>
                    <div className={styles.formRow}>
                        <label htmlFor="providerName" className={styles.label}>Nombre del proveedor</label>
                        <input type="text" id="providerName" name="providerName" value={selectedProvider?.name} className={styles.input}/>
                    </div>
                    <div className={styles.formRow}>
                        <label htmlFor="providerDescription" className={styles.label}>Descripcion</label>
                        <input type="text" id="providerDescription" name="providerDescription" value={selectedProvider?.description} className={styles.input}/>
                    </div>
                    <div className={styles.formButtons}>
                    <button className={`button button-primary ${styles.buttonHome}`} onClick={handleModifyProvider}>
                        Modificar
                    </button>
                    </div>
                </form>           
            </div>
            </div>
            <div className={styles.buttonContainer}>
                <button className={`button button-primary ${styles.buttonHome}`} onClick={handleShowAddProvider}>
                    Agregar proveedor
                </button>
            </div>
            {showAddProvider && (
                <AddProviderModal open={showAddProvider} setModalClose={() => setShowAddProvider(false)} saveProvider={handleAddProvider}/>
            )}
        </div>
    )
};

export default ProvidersPage;


