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
import { Producto } from "@/domain/models/Producto";
import Footer from "@/components/Footer/Footer";
const ProvidersPage = () => { //TODO: Modificar los proveedores
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [showAddProvider, setShowAddProvider] = useState(false);
    const [formData, setFormData] = useState<{ name: string, description: string }>({ name: "", description: "" });
    const [selectedProviderProducts, setSelectedProviderProducts] = useState<Producto[]>([]);

    useEffect(() => {
        const fetchProviders = async () => {
            const providers = await apiService.get<ResponseItems<Proveedor>>("/providers");
            setProviders(providers.data.content);
            setSelectedProviderProducts(providers.data.content[0].products || []);
            setFormData({
                name: providers.data.content[0].name,
                description: providers.data.content[0].description,
            });
        };
        
        if (isReady)
            fetchProviders();
        
    }, [isReady]);
    
    const handleSelectSingleItem = (id: string) => {
        const provider = providers.find(provider => provider.id === id);
        if (provider) {
          setFormData({
            name: provider.name,
            description: provider.description,
          });
          setSelectedProviderProducts(provider.products || []);
        }
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

    const handleModifyProvider = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const name = formData.get("providerName") as string;
        const description = formData.get("providerDescription") as string;
        
        const provider = providers.find(provider => provider.name === name);
        if (provider){
            const modifyProviderRequest = {
                name: name,
                description: description
            }
            const res = await apiService.update("/providers", provider.id, modifyProviderRequest);
            console.log(res);
        }
    }


    const productItems = transformToItems(selectedProviderProducts, "id", ["name", "unit","amount"]).map((item) => {
        return {
            ...item,
            display: `${item.name} x ${item.amount}${item.unit}`,
        }; 
        });

    const productCampos = ["display"];


    return (
        <div className="page-container">
            <div className="content-wrap">
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
                <form className={styles.form} onSubmit={handleModifyProvider}>
                    <div className={styles.formRow}>
                        <label htmlFor="providerName" className={styles.label}>Nombre del proveedor</label>
                        <input 
                        type="text" 
                        id="providerName" 
                        name="providerName" 
                        value={formData.name} 
                        className={styles.input}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
                    </div>
                    <div className={styles.formRow}>
                        <label htmlFor="providerDescription" className={styles.label}>Descripcion</label>
                        <input 
                        type="text" 
                        id="providerDescription" 
                        name="providerDescription" 
                        value={formData.description} 
                        className={styles.input}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
                    </div>
                    <div className={styles.formButtons}>
                    <h4 className={styles.subtitle}>Productos</h4>
                    {productItems.length > 0 ? 
                    (<ItemList
                    items={productItems}
                    displayKeys={productCampos}
                    selectItems={false}
                    deleteItems={false}
                    selectSingleItem={false} />
                    ) : (<p>El proveedor no tiene productos asociados</p>)
                    }
                    <button className={`button button-primary ${styles.buttonHome} ${styles.buttonSubmit}`} type="submit">
                        Modificar
                    </button>
                    </div>
                </form>           
            </div>
            </div>
            <div className={styles.buttonContainer}>
                <button className={`button button-primary ${styles.buttonHome}`} onClick={handleShowAddProvider}>
                    Agregar
                </button>
            </div>
            {showAddProvider && (
                <AddProviderModal open={showAddProvider} setModalClose={() => setShowAddProvider(false)} saveProvider={handleAddProvider}/>
            )}
            </div>
            <Footer />
        </div>
    )
};

export default ProvidersPage;


