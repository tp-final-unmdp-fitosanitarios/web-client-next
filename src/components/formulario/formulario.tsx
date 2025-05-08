"use client";

import { useState } from "react";
import styles from "./formulario.module.scss";
import { Field } from "@/domain/models/Field";


interface FormularioProps {
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void;
  onCancel?: () => void;
  buttonName:string;
  children?: React.ReactNode; 
}

export default function Formulario({ fields, onSubmit, onCancel,buttonName,children }: FormularioProps) {
  const initialState: Record<string, string > = fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {} as Record<string, string>);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Limpia errores al modificar
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (!formData[field.name]) {
        newErrors[field.name] = `El campo "${field.label}" es obligatorio`;
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData(initialState);
    }

  };

  const handleCancel = () => {
    if (onCancel)
      onCancel();
    setFormData(initialState); 
    setErrors({});
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        {fields.map((field) => (
          <div key={field.name} className={`${styles["input-group"]}`} >
            <label className={styles.label}>{field.label}</label>
            {field.type === "select" ? (
              <select name={field.name} value={formData[field.name]} onChange={handleChange}  onFocus={field.onFocus} className={styles.select}>
                <option value="">Seleccione una opción</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} className={`${styles.input} ${field.name}`}  {...(field.type === "number" ? { min: "1", step: "any" } : {})} />
            )}
            {errors[field.name] && <p className={styles.error}>{errors[field.name]}</p>}
          </div>
        ))}
        {children}
      </form>

      <div className={styles["button-container"]}>
        {onCancel && (
          <button type="button" onClick={handleCancel} className={`${styles.button} ${styles["button-secondary"]}`}>
            Cancelar
          </button>
        )}
        <button type="submit" className={`${styles.button} ${styles["button-primary"]}`} onClick={handleSubmit}>
          {buttonName}
        </button>
      </div>
    </>
  );
}
