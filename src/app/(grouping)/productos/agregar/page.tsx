"use client";

import { useState, useCallback } from "react";
import Formulario from "@/components/formulario/formulario";
import GenericModal from "@/components/modal/GenericModal";
import MenuBar from "@/components/menuBar/MenuBar";
import { Unidad } from "@/domain/enum/Unidad";
import { Field } from "@/domain/models/Field";
import { Producto } from "@/domain/models/Producto";
import styles from "./agregarProductos.module.scss";

export default function AgregarProductos() {
    const title = "Agregar Producto";

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = useCallback(() => setModalOpen(true), []);
    const handleCloseModal = useCallback(() => setModalOpen(false), []);

    const [producto, setProducto] = useState<Producto>({
        id: "",
        name: "",
        unit: Unidad.Litros,
        amount: 0,
        brand: "",
        agrochemicalId: "",
        createdAt: new Date(),
        providers:[],
        agrochemical: {
            id: "",
            activePrinciple: "",
            description: "",
            companyId: "",
            category: "", 
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    const handleFormSubmit = (inputData: Record<string, string | number>) => {
        setProducto((prevProducto) => ({
            ...prevProducto,
            name: String(inputData.nombre),
            amount: Number(inputData.cantidad),
            unit: inputData.unidad as Unidad, // Convertimos correctamente a tipo `Unidad`
            brand: String(inputData.marca),
            agrochemical: {
                ...prevProducto.agrochemical,
                id: String(inputData.agroquimico),
                category: inputData.categoria as "HERBICIDE" | "INSECTICIDE" | "FUNGICIDE", // Se fuerza el tipo
            },
        }));
        handleOpenModal();
    };

    const handleCancel = () => {
        console.log("Cancel");
    };

    const fields: Field[] = [
        { name: "nombre", label: "Nombre", type: "select", options: ["Producto A", "Producto B", "Producto C"] },
        { name: "cantidad", label: "Cantidad", type: "number" },
        { name: "unidad", label: "Unidad", type: "select", options: Object.values(Unidad) }, // Usamos `Object.values`
        { name: "marca", label: "Marca", type: "text" },
        { name: "agroquimico", label: "Agroquímico", type: "select", options: ["Agroquímico A", "Agroquímico B", "Agroquímico C"] },
        { name: "categoria", label: "Categoría", type: "select", options: ["HERBICIDE", "INSECTICIDE", "FUNGICIDE"] },
        { name: "proveedor", label: "Proveedor", type: "select", options: ["Proveedor A", "Proveedor B", "Proveedor C"] },
    ];

    return (
        <div className="page-container">
            <MenuBar showMenu={true} path="/productos" />
            <h1 className={styles.title}>{title}</h1>

            <Formulario fields={fields} onSubmit={handleFormSubmit} onCancel={handleCancel} buttonName="Continuar" />

            <GenericModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title="Producto añadido"
                modalText={`Se añadió el producto: ${producto.name}`}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
}
