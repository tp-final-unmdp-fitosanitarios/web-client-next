/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react';
import { Locacion } from '@/domain/models/Locacion';
import { Field } from '@/domain/models/Field';
import GenericForm from '@/components/formulario/formulario';
import styles from "./MoverStockModal.module.scss";
import { useAuth } from '@/components/Auth/AuthProvider';
import { useRouter } from "next/navigation";
import { sortAlphabeticallyUnique } from '@/utilities/sort';

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
      const response = await apiService.get<Locacion[]>("/locations?type=WAREHOUSE&type=FIELD");
      // Ordenar y eliminar duplicados
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
    const destino = formValues["destino"];
    const origenId = locations.find(loc => loc.name === origen)?.id;
    const destinoId = locations.find(loc => loc.name === destino)?.id;

    // Redirigimos con los valores como query params se hace esto porque el router no permite pasar valores por el state
    if (origenId && destinoId)
      router.push(`/stock/mover?origen=${encodeURIComponent(origenId)}&destino=${encodeURIComponent(destinoId)}&oid=${encodeURIComponent(origen)}&did=${encodeURIComponent(destino)}`);
    else
      console.error("Error al mover stock: Locaciones no encontradas");

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
    {
      name: "destino",
      label: "Locación Destino",
      type: "select",
      options: Array.from(new Set(locations.map((loc) => loc.name))).sort(),
      onFocus: fetchLocations,
    },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} modal-content`}>
        <h2 className={styles.title}>Mover Stock</h2>
        <div className={styles.formContainer}>
          <GenericForm fields={fields} onSubmit={handleFormSubmit} onCancel={onClose} buttonName="Mover" />
        </div>
      </div>
    </div>
  );
};

export default MoverStockModal;
