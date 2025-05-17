/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react';
import { Locacion } from '@/domain/models/Locacion';
import { Field } from '@/domain/models/Field';
import GenericForm from '@/components/formulario/formulario';
import styles from "./RetirarStockModal.module.scss";
import { useAuth } from '@/components/Auth/AuthProvider';
import { useRouter } from "next/navigation";
import { sortAlphabeticallyUnique } from '@/utilities/sort';

interface Props {
  onClose: () => void;
}

const RetirarStockModal: React.FC<Props> = ({ onClose }) => {
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();
  const [locations, setLocations] = useState<Locacion[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchLocations = async () => {
    if (loaded || !isReady) return;
    try {
      const response = await apiService.get<Locacion[]>("/locations?type=WAREHOUSE&type=FIELD");
      const sortedLocations = sortAlphabeticallyUnique(response.data, 'name', 'id');
      setLocations(sortedLocations);
      setLoaded(true);
    } catch (error: any) {
      console.error("Error al cargar locaciones:", error.message);
    }
  };
  const router = useRouter();

  const handleFormSubmit = (formValues: Record<string, string>) => {
    const origen = formValues["origen"];
    const origenId = locations.find(loc => loc.name === origen)?.id;
  
    // Redirigimos con los valores como query params se hace esto porque el router no permite pasar valores por el state
    if (origenId)
      router.push(`/stock/retirar?origen=${encodeURIComponent(origenId)}&oid=${encodeURIComponent(origen)}`);
    else
      console.error("Error al retirar stock: Locaciones no encontradas");
    
  
    onClose();
  };

  const fields: Field[] = [
    {
      name: "origen",
      label: "Locación Origen",
      type: "select",
      options: Array.from(new Set(locations.map((loc) => loc.name))).sort(),
      onFocus: fetchLocations,
    },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Retirar Stock</h2>
        <GenericForm fields={fields} onSubmit={handleFormSubmit} onCancel={onClose} buttonName="Retirar" />
      </div>
    </div>
  );
};

export default RetirarStockModal;