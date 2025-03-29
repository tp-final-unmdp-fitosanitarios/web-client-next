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

const AgregarStockPage: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [remito, setRemito] = useState<any>(null);
    const [productosActuales, setProductosActuales] = useState([]);
    const [productosAAgregar, setProductosAAgregar] = useState<Producto[]>([
        {
            id: 1,
            nombre: "Glifosato 48%",
            unidad: "LITROS",
            cantidad: 20,
            marca: "AgroChem SA",
            descripcion: "Herbicida sistémico para el control de malezas."
        },
        {
            id: 2,
            nombre: "Clorpirifos 48%",
            unidad: "LITROS",
            cantidad: 15,
            marca: "Campo Verde Ltda",
            descripcion: "Insecticida organofosforado de amplio espectro."
        }]);
    const [addProductModalOpen, setAddProductModalOpen] = useState(false);
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const title = 'Agregar Stock'


    const handleAddProductOpenModal = () => setAddProductModalOpen(true);
    const handleAddProductCloseModal = () => setAddProductModalOpen(false);
    const handleFinishOpenModal = () => setFinishModalOpen(true);
    const handleFinishCloseModal = () => setFinishModalOpen(false);
    
    // Example usage of setProducto to avoid the unused variable warning
    const handleAddProducto = (producto: string,cantidad: number) => {
        //busco el producto seleccionado
        //lo agrego a la tabla
        //setProducto([...productos, producto]);
    };

    useEffect(() => {
        ///Traigo los productos que tengo actualmente y los meto en el use state
        ///Esto se hace para poder seleccionarlos al agregar producto
    },[])
    
    const handleFormSubmit = (inputData: Record<string, string | number>) => {
        setRemito({
            id: 0,
            campo: String(inputData.campo),
            cantProductos: inputData.cantProductos,
            archivo: String(inputData.archRemito),
            fecha: new Date()
        });
    };

    const handleCancel = () => {
        console.log('Cancel');
    }

    const handleFinish = () => {

    }

    const fields: Field[] = [
        { name: "nroRemito", label: "Numero de Remito", type: "text"},
        { name: "campo", label: "Campo", type: "select" , options:["campoA","campoB", "campoC"]},
        { name: "cantProductos", label: "Cantidad de Productos", type: "number"},
        { name: "archRemito", label: "Cargar Remito", type: "file" },
    ];

    const items = transformToItems(productosAAgregar, "id",["nombre", "marca"]);
    const campos = ["nombre","marca"]

    const buttons = [
        { label: "Cancelar", path: "/stock" },
        { label: "Mover", path: "/stock/mover" },
        { label: "Retirar", path: "/stock/retirar" },
        { label: "Ver Movimientos", path: "/stock/movimientos" },
        { label: "Proveedores", path: "/stock/proveedores" },
        ];

    return (
        <div className={styles.pageContainer}>
            <MenuBar showMenu={false} path='/productos' />
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
                        {<ItemList items={items} displayKeys={campos}/>}
                        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleAddProductOpenModal}>
                            Agregar Producto
                        </button>
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
                <ModalAgregarProducto handleAddProducto={handleAddProducto} products={productosActuales} open={addProductModalOpen} setModalClose={handleAddProductCloseModal} />
            ) : (
                <ResumenOperacion handleFinish={handleFinish} products={productosAAgregar} open={finishModalOpen} setModalClose={handleFinishCloseModal} />
            )}
        </div>
    );
};

export default AgregarStockPage;