"use client";

import { useState, useEffect } from "react";
import { Agroquimico } from "@/domain/models/Agroquimico";
import styles from "./AgrochemicalSelector.module.scss";

interface AgrochemicalSelection {
  id: string;
  active_principle: string;
  percentage: number;
}

interface AgrochemicalSelectorProps {
  agroquimicos: Agroquimico[];
  selectedAgrochemicals: AgrochemicalSelection[];
  onChange: (selections: AgrochemicalSelection[]) => void;
}

export default function AgrochemicalSelector({ 
  agroquimicos, 
  selectedAgrochemicals, 
  onChange 
}: AgrochemicalSelectorProps) {
  const [localSelections, setLocalSelections] = useState<AgrochemicalSelection[]>(selectedAgrochemicals);

  useEffect(() => {
    setLocalSelections(selectedAgrochemicals);
  }, [selectedAgrochemicals]);

  const addAgrochemical = () => {
    const newSelection: AgrochemicalSelection = {
      id: "",
      active_principle: "",
      percentage: 0
    };
    const updated = [...localSelections, newSelection];
    setLocalSelections(updated);
    onChange(updated);
  };

  const removeAgrochemical = (index: number) => {
    const updated = localSelections.filter((_, i) => i !== index);
    setLocalSelections(updated);
    onChange(updated);
  };

  const updateAgrochemical = (index: number, field: keyof AgrochemicalSelection, value: string | number) => {
    const updated = localSelections.map((selection, i) => {
      if (i === index) {
        if (field === 'active_principle') {
          const selectedAgro = agroquimicos.find(a => a.active_principle === value);
          return {
            ...selection,
            id: selectedAgro?.id || "",
            active_principle: value as string
          };
        }
        return { ...selection, [field]: value };
      }
      return selection;
    });
    setLocalSelections(updated);
    onChange(updated);
  };

  const getTotalPercentage = () => {
    return localSelections.reduce((sum, selection) => sum + (selection.percentage || 0), 0);
  };


  return (
    <div className={styles.container}>
      <label className={styles.label}>Agroquímicos y Concentraciones</label>
      <p className={styles.description}>Ingrese el porcentaje de concentración de cada principio activo</p>
      
      {localSelections.map((selection, index) => (
        <div key={index} className={styles.selectionRow}>
          <select
            value={selection.active_principle}
            onChange={(e) => updateAgrochemical(index, 'active_principle', e.target.value)}
            className={styles.select}
          >
            <option value="">Seleccione un agroquímico</option>
            {agroquimicos.map((agro) => (
              <option key={agro.id} value={agro.active_principle}>
                {agro.active_principle}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            value={selection.percentage || ''}
            onChange={(e) => updateAgrochemical(index, 'percentage', parseFloat(e.target.value) || 0)}
            placeholder="Concentración %"
            min="0"
            max="100"
            step="0.1"
            className={styles.percentageInput}
          />
          
          <button
            type="button"
            onClick={() => removeAgrochemical(index)}
            className={styles.removeButton}
            disabled={localSelections.length === 1}
          >
            ✕
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addAgrochemical}
        className={styles.addButton}
      >
        + Agregar Agroquímico
      </button>
      
      <div className={styles.summary}>
        <span className={styles.totalPercentage}>
          Total: {getTotalPercentage().toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
