/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Formulario from '@/components/formulario/formulario';
import MenuBar from '@/components/menuBar/MenuBar';
import { Unidad } from '@/domain/enum/Unidad';
import { Field } from '@/domain/models/Field';
import { Remito } from '@/domain/models/Remito';
import React, { useEffect, useState } from 'react';
import styles from "./agregarStock.module.scss"
import { Button, Link } from '@mui/material';
import ItemList from '@/components/itemList/ItemList';
import { transformToItems } from '@/utilities/transform';
import { Producto } from '@/domain/models/Producto';
import ModalAgregarProducto from "../../../../components/AgregarStock/modalStockAgregarProd/ModalAgregarProducto"
import ResumenOperacion from "../../../../components/AgregarStock//resumenOperacionAgregar/ResumenOperacion"
import { apiService } from '@/services/api-service';
import { Locacion } from '@/domain/models/Locacion';
import { useItemsManager } from '@/hooks/useItemsManager';
import { useRouter } from 'next/navigation';

type ProductoAAgregar = {
    id: number
    name: string;
    quantity: number;
    size: number;
    unit: string;
};

const AgregarStockPage: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const router = useRouter();
    const [remito, setRemito] = useState<any>(null);
    const [productosExistentes, setProductosExistentes] = useState<Producto[]>([]);
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [productosAAgregar, setProductosAAgregar] = useState<ProductoAAgregar[]>([]);
    const [addProductModalOpen, setAddProductModalOpen] = useState(false);
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const title = 'Agregar Stock'

    const handleAddProductOpenModal = () => setAddProductModalOpen(true);
    const handleAddProductCloseModal = () => setAddProductModalOpen(false);
    const handleFinishCloseModal = () => setFinishModalOpen(false);
    const handleFinishOpenModal = () => {
        //Valido los campos del form
        /*if(!remito)
            return
        if(productosAAgregar.length !== remito.cantProductos)
            return*/

        setFinishModalOpen(true);
    }
    
    const handleAddProducto = (producto: string, cantidad: number) => {
        if (!cantidad) return;

        const prod = productosExistentes.find((p) => p.name === producto);
        if (!prod) return;

        if (productosAAgregar.length >= remito.cantProductos) {
            console.warn("No se pueden agregar más productos.");
            return;
        }
        
        const existingProductIndex = productosAAgregar.findIndex((p) => p.id === prod.id);
        if (existingProductIndex !== -1) {
            const updatedProductos = [...productosAAgregar];
            updatedProductos[existingProductIndex].quantity += cantidad;
            setProductosAAgregar(updatedProductos);
        } else {
            setProductosAAgregar([...productosAAgregar, { id: prod.id, name: producto, size:prod.amount, unit:prod.unit+" x ", quantity: cantidad }]);
        }
    };

    const fetchProductos = async () => {
        try{
            const response = await apiService.get<any>("/products");
            return response.data.content;
        }
        catch(e: any){
            console.log(e.message);
            return [];
        }
        
    } 

    const fetchLocations = async () => {
        try{
            const response = await apiService.get<any>("/locations?type=WAREHOUSE");
            return response.data;
        }
        catch(e: any){
            console.log(e.message);
            return []; //Aca puede caer por falta de conexion o forbbiden. Chequear como lo manejamos
        }
        
    } 

    useEffect(() => {
        const fetchData = async () => {
            const [prods, locs] = await Promise.all([fetchProductos(), fetchLocations()]);
            setProductosExistentes(prods);
            setLocations(locs);
        };
        fetchData();
    }, [])
    
    const handleFormSubmit = (inputData: Record<string, string | number>) => {
        setRemito({
            campo: String(inputData.campo),
            cantProductos: inputData.cantProductos,
            archivo: String(inputData.archRemito),
            fecha: new Date()
        });
    };

    const handleCancel = () => {
        setAddProductModalOpen(false);
        setFinishModalOpen(false);
        setProductosAAgregar([]);
        router.push("/stock");
    }

    const handleFinish = () => {
        //Armo la request
        //Envio
        //Si sale bien vuelvo a
    }

    const fields: Field[] = [
        { name: "nroRemito", label: "Numero de Remito", type: "text"},
        { name: "campo", label: "Campo", type: "select" , options:locations ? locations.map((l) => l.name) : []},
        { name: "cantProductos", label: "Cantidad de Productos", type: "number"},
        { name: "archRemito", label: "Cargar Remito", type: "file" },
    ];

    const items = transformToItems(productosAAgregar, "id",["name","size","unit", "quantity"]);
    const campos = ["name","size","unit","quantity"]

    const buttons = [
        { label: "Cancelar", path: "/stock" },
        { label: "Mover", path: "/stock/mover" },
        { label: "Retirar", path: "/stock/retirar" },
        { label: "Ver Movimientos", path: "/stock/movimientos" },
        { label: "Proveedores", path: "/stock/proveedores" },
        ];

    const {
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(productosAAgregar);

    const quitarItem = (id: number) => {
        setProductosAAgregar((prev) => prev.filter((item) => item.id !== id));
      };
    
    return (
        <div className={styles.pageContainer}>
            <MenuBar showMenu={false} path='/stock' />
            <h1 className={styles.title}>{title}</h1>
            {!addProductModalOpen && !finishModalOpen ? 
            (
            <>
                <div className={styles.formAndItemListContainer}>
                    <div className={styles.formContainer}>
                        <h3>Nuevo Remito</h3>
                        <Formulario fields={fields} onSubmit={handleFormSubmit} buttonName="Guardar Remito" />
                    </div>
                    <div className={styles.itemListContainer}>
                        <h3>Agregar Stock</h3>
                        
                        {productosAAgregar.length > 0 ? (
                            <ItemList
                                items={items}
                                displayKeys={campos}
                                onSelect={toggleSelectItem}
                                selectedIds={selectedIds}
                                selectItems={false}
                                deleteItems={true}
                                onDelete={quitarItem}
                            />
                        ) : (
                            <p>Ingrese producttos para agregar stock</p>
                        )}
                        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleAddProductOpenModal} disabled={!remito}>
                            Agregar Producto
                        </button> {/*Agregarle el estilo al disabled}*/}
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <Link href="/stock">
                        <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} >
                            Cancelar
                        </button>
                    </Link>
                    <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`} onClick={handleFinishOpenModal}>
                        Finalizar
                    </button>
                </div>
            </>
            ) : addProductModalOpen ? (
                <ModalAgregarProducto handleAddProducto={handleAddProducto} products={productosExistentes} open={addProductModalOpen} setModalClose={handleAddProductCloseModal} cantActual={productosAAgregar.length}limite={remito.cantProductos}/>
            ) : (
                <ResumenOperacion handleFinish={handleFinish} products={productosAAgregar} open={finishModalOpen} setModalClose={handleFinishCloseModal} locacion={remito.campo} remito={remito.archivo}/>
            )}
        </div>
    );
};

export default AgregarStockPage;