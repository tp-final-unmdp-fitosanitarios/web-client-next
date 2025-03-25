"use client"
import Formulario from '@/components/formulario/formulario';
import MenuBar from '@/components/menuBar/MenuBar';
import { Unidad } from '@/domain/enum/Unidad';
import { Field } from '@/domain/models/Field';
import { Remito } from '@/domain/models/Remito';
import React, { useState } from 'react';
import styles from "./agregarStock.module.scss"
import { Button, Link } from '@mui/material';
import ItemList from '@/components/itemList/ItemList';
import { transformToItems } from '@/utilities/transform';
import { Producto } from '@/domain/models/Producto';

const AgregarStockPage: React.FC = () => {
    const [remito, setRemito] = useState<any>(null);
    const [productos, setProducto] = useState<Producto[]>([
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
    const [modalOpen, setModalOpen] = useState(false);
    const title = 'Agregar Stock'
    
    

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
    
    /*  id: number,
        campo: Locacion,
        productos: Productos [],
        archivo: string,
        fecha: Date
    */

    // Example usage of setProducto to avoid the unused variable warning
    const addProducto = (producto: Producto) => {
        setProducto([...productos, producto]);
    };
    
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

    const fields: Field[] = [
        { name: "nroRemito", label: "Numero de Remito", type: "text"},
        { name: "campo", label: "Campo", type: "select" , options:["campoA","campoB", "campoC"]},
        { name: "cantProductos", label: "Cantidad de Productos", type: "number"},
        { name: "archRemito", label: "Cargar Remito", type: "file" },
    ];

    const items = transformToItems(productos, "id",["nombre", "marca"]);
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
            <div className={styles.formAndItemListContainer}>
                <div className={styles.formContainer}>
                    <h3>Nuevo Remito</h3>
                    <Formulario fields={fields} onSubmit={handleFormSubmit} buttonName="Guardar Remito" />
                </div>
                <div className={styles.itemListContainer}>
                    <h3>Agregar Stock</h3>
                    {<ItemList items={items} displayKeys={campos}/>}
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                        Agregar Producto
                    </button>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <Link href="/stock">
                    <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`}>
                        Cancelar
                    </button>
                </Link>
                <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`}>
                    Finalizar
                </button>
            </div>
        </div>
    );
};

export default AgregarStockPage;