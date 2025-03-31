"use client";

import Formulario from "@/components/formulario/formulario";
import { Unidad } from "@/domain/enum/Unidad";
import { Field } from "@/domain/models/Field";
import { Producto } from "@/domain/models/Producto";
import styles from "./agregarProductos.module.scss"
import GenericModal from "@/components/modal/GenericModal";
import { useState } from "react";
import MenuBar from "@/components/menuBar/MenuBar";

export default function AgregarProductos() { //TO-DO: spasar  Props.

    const title = 'Agregar Producto'

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
    
    const [producto, setProducto] = useState<Producto>({
        id: 0,
        name: "",
        unit: Unidad.Litros,
        quantity: 0,
        brand: "",
        description: ""
    });
    
    const handleFormSubmit = (inputData: Record<string, string | number>) => {
        setProducto({
            ...producto,
            name: String(inputData.nombre),
            quantity: Number(inputData.cantidad),
            unit: String(inputData.unidad),
            brand: String(inputData.marca),
            description: String(inputData.descripcion)
        });
        handleOpenModal();
    };

    const handleCancel = () => {
        console.log('Cancel');
    }

    const fields: Field[] = [
        { name: "nombre", label: "Nombre", type: "select", options: ["Producto A", "Producto B", "Producto C"] },
        { name: "cantidad", label: "Cantidad", type: "number" },
        { name: "unidad", label: "Unidad", type: "select", options: [Unidad.Litros, Unidad.Kilogramos] },
        { name: "marca", label: "Marca", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" },
    ];

    return (
        <div className="page-container">
            <MenuBar showMenu={false} path='/productos' />
            <h1 className={styles.title}>{title}</h1>
            
            <Formulario fields={fields} onSubmit={handleFormSubmit} onCancel={handleCancel} buttonName="Continuar" />

            <GenericModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title="Producto añadido"
                modalText={`Se añadadio el producto: ${producto.name}`}
                buttonTitle="Cerrar"
                showSecondButton={false} // o false según se necesite
                secondButtonTitle="Acción Alternativa"
            />
        </div>
    )

}