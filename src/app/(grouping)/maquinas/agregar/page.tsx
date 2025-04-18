"use client";

import Formulario from "@/components/formulario/formulario";
import MenuBar from "@/components/menuBar/MenuBar";
import GenericModal from "@/components/modal/GenericModal";
import { useState, useCallback } from "react";
import styles from "./agregarMaquinas-view.module.scss";
import { Field } from "@/domain/models/Field";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";

import { Maquina } from "@/domain/models/Maquina";


export default function AgregarMaquinas() {
  const title = "Agregar Máquina";
  const router = useRouter();
  const { getApiService, isReady } = useAuth(); // Obtenemos el usuario para el companyId
  const apiService = getApiService();

  const [modalOpen, setModalOpen] = useState(false);
  const [newMaquina, setNewMaquina] = useState<Maquina | null>(null);

  const [creationError, setCreationError] = useState<string | null>(null);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const handleFormSubmit = (inputData: Record<string, string | number>) => {
   
    const payload: Maquina = {
      id:"",
      name: String(inputData.nombre),
      model: String(inputData.modelo),
      internal_plate: String(inputData.patente_interna),
      companyId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createMaquina(payload);
  };

  const createMaquina = async (payload: Maquina) => {
    if (!isReady || !apiService) return;
    setCreationError(null);

    try {
      const response = await apiService.create<Maquina>("/machines", payload); // Asegúrate de usar el endpoint correcto

      if (response.success) {
        console.log("Máquina creada:", response.data);
        setNewMaquina(response.data);
        handleOpenModal();
        router.push("/maquinas"); // Redirige a la página de máquinas
      } else {
        console.error("Error al crear la máquina:", response.error);
        setCreationError(response.error || "Error desconocido al crear la máquina.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error en la solicitud:", error.message);
      setCreationError(error.message || "Error desconocido en la solicitud.");
    } 
  };

  const handleCancel = () => {
    router.push("/maquinas"); // Redirige a la página de máquinas
  };

  const fields: Field[] = [
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "modelo", label: "Modelo", type: "text" },
    { name: "patente_interna", label: "Patente Interna", type: "text" },
  ];

  return (
    <div className="page-container">
      <MenuBar showMenu={false} path="/maquinas" />
      <h1 className={styles.title}>{title}</h1>

      <Formulario
        fields={fields}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        buttonName={"Guardar Máquina"}
      />

      {newMaquina && (
        <GenericModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title="Máquina añadida"
          modalText={`Se añadió la máquina: ${newMaquina.name}`}
          buttonTitle="Cerrar"
          showSecondButton={false}
        />
      )}
      {creationError && (
        <div className={styles.error}>Error al crear la máquina: {creationError}</div>
      )}
    </div>
  );
}