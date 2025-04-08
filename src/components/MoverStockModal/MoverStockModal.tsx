/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react';
import { Locacion } from '@/domain/models/Locacion';
import { Field } from '@/domain/models/Field';
import GenericForm from '@/components/formulario/formulario';
import styles from "./MoverStockModal.module.scss";
import { useAuth } from '@/components/Auth/AuthProvider';
import { useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
}

const MoverStockModal: React.FC<Props> = ({ onClose }) => {
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();
  const [locations, setLocations] = useState<Locacion[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchLocations = async () => {
    if (loaded || !isReady) return;
    try {
      const response = await apiService.get<Locacion[]>("/locations?type=ZONE");
      setLocations(response.data);
      setLoaded(true);
    } catch (error: any) {
      console.error("Error al cargar locaciones:", error.message);
    }
  };
  const router = useRouter();

  const handleFormSubmit = () => {
      router.push("/stock/mover");// To do: pasar los datos de la locacion origen y destino
    onClose();
  };

  const fields: Field[] = [
    {
      name: "origen",
      label: "Locación Origen",
      type: "select",
      options: locations.map((loc) => loc.name),
      onFocus: fetchLocations,
    },
    {
      name: "destino",
      label: "Locación Destino",
      type: "select",
      options: locations.map((loc) => loc.name),
      onFocus: fetchLocations,
    },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Mover Stock</h2>
        <GenericForm fields={fields} onSubmit={handleFormSubmit} onCancel={onClose} buttonName="Mover" />
      </div>
    </div>
  );
};

export default MoverStockModal;
