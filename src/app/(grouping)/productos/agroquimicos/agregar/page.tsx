/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Formulario from "@/components/formulario/formulario";
import GenericModal from "@/components/modal/GenericModal";
import MenuBar from "@/components/menuBar/MenuBar";
import { Field } from "@/domain/models/Field";
import { Agroquimico } from "@/domain/models/Agroquimico";
import { useAuth } from "@/components/Auth/AuthProvider";
import styles from "./agregarAgroquimicos.module.scss";
import Footer from "@/components/Footer/Footer";

interface CreateAgrochemicalPayload {
    active_principle: string;
    description: string;
    category: string;
    company_id: string;
    created_at: string;
    updated_at: string;
}

export default function AgregarAgroquimicos() { // TO DO REVISAR POR QUE FALLA EL POST
    const title = "Agregar Agroquímico";
    const router = useRouter();
    const { getApiService, user } = useAuth();
    const apiService = getApiService();

    const [modalOpen, setModalOpen] = useState(false);
    const [newAgroquimico, setNewAgroquimico] = useState<Agroquimico | null>(null);

    const handleFormSubmit = async (formData: Record<string, string>) => {
        if (!user?.company_id) {
            alert("Error: No se pudo obtener el ID de la compañía");
            return;
        }

        const now = new Date().toISOString();
        const payload: CreateAgrochemicalPayload = {
            active_principle: formData.principio_activo,
            description: formData.descripcion,
            category: formData.categoria,
            company_id: user.company_id,
            created_at: now,
            updated_at: now
        };

        try {
            const response = await apiService.create<Agroquimico>("/agrochemicals", payload);
            if (response.success) {
                setNewAgroquimico(response.data);
                setModalOpen(true);
            } else {
                alert("Error al crear el agroquímico: " + response.error);
            }
        } catch (error: any) {
            alert("Error al conectar con el servidor: " + error.message);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        router.push("/productos/agroquimicos");
    };

    const handleCancel = () => {
        router.push("/productos/agroquimicos");
    };

    const isFormValid = (formData: Record<string, string>) => {
        return formData.principio_activo && formData.categoria && formData.descripcion;
    };

    const fields: Field[] = [
        {
            name: "principio_activo",
            label: "Principio Activo",
            type: "text",
        },
        {
            name: "descripcion",
            label: "Descripción",
            type: "text",
        },
        {
            name: "categoria",
            label: "Categoría",
            type: "select",
            options: ["HERBICIDE", "INSECTICIDE", "FUNGICIDE"],
        },
    ];

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={true} path="/agroquimicos" />
                <h1 className={styles.title}>{title}</h1>

                <Formulario
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                    buttonName="Continuar"
                    equalButtonWidth={true}
                    isSubmitDisabled={(formData) => !isFormValid(formData)}
                />
            </div>
            <Footer />
            <GenericModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title="Agroquímico añadido"
                modalText={`Se añadió el agroquímico: ${newAgroquimico?.active_principle}`}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
} 