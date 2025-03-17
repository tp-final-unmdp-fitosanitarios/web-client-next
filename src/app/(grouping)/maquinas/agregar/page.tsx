"use client";

import Formulario from "@/components/formulario/formulario";
import MenuBar from "@/components/menuBar/MenuBar";
import GenericModal from "@/components/modal/GenericModal";
import { TipoLocacion } from "@/domain/enum/TipoLocacion";
import { useState } from "react";
import styles from  "./agregarMaquinas-view.module.scss"
import { Field } from "@/domain/models/Field";

interface Maquina {
  id: number;
  patente_interna: string;
  nombre: string;
  descripcion: string;
  locacion: TipoLocacion | string; 
}

export default function AgregarMaquinas() {
    const title = "Agregar Máquina";
  
    const [modalOpen, setModalOpen] = useState(false);
  
    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
  
    const [maquina, setMaquina] = useState<Maquina>({
      id: 0,
      patente_interna: "",
      nombre: "",
      descripcion: "",
      locacion: "",
    });
  
    const handleFormSubmit = (inputData: Record<string, string | number>) => {
      setMaquina({
        ...maquina,
        patente_interna: String(inputData.patente_interna),
        nombre: String(inputData.nombre),
        descripcion: String(inputData.descripcion),
        locacion: String(inputData.locacion),
      });
      handleOpenModal();
    };
  
    const handleCancel = () => {
      console.log("Cancel");
    };
  
    const fields: Field[] = [
      { name: "patente_interna", label: "Patente Interna", type: "text" },
      { name: "nombre", label: "Nombre", type: "text" },
      { name: "descripcion", label: "Descripción", type: "text" },
      {
        name: "locacion",
        label: "Ubicación",
        type: "select",
        options: ["Almacén", "Campo", "Taller"], // Cumple con options: string[]
      },
    ];
  
    return (
      <div className="page-container">
        <MenuBar showMenu={false} path="/maquinas" />
        <h1 className={styles.title}>{title}</h1>
  
        <Formulario
          fields={fields}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          buttonName="Continuar"
        />
  
        <GenericModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title="Máquina añadida"
          modalText={`Se añadió la máquina: ${maquina.nombre}`}
          buttonTitle="Cerrar"
          showSecondButton={false}
          secondButtonTitle="Acción Alternativa"
        />
      </div>
    );
  }