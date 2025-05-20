"use client";

import { useEffect, useState } from "react";
import styles from "./formulario.module.scss";
import { Field } from "@/domain/models/Field";
import { sortStrings } from "@/utilities/sort";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

interface FormularioProps {
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void;
  onCancel?: () => void;
  buttonName:string;
  children?: React.ReactNode; 
  equalButtonWidth?: boolean;
  isSubmitDisabled?: (formData: Record<string, string>) => boolean;
}

export default function Formulario({ fields, onSubmit, onCancel, buttonName, children, equalButtonWidth, isSubmitDisabled }: FormularioProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(formData).length === 0) {
      const initialState: Record<string, string> = fields.reduce((acc, field) => {
        const defaultValue = field.defaultValue !== undefined ? String(field.defaultValue) : "";
        return { ...acc, [field.name]: defaultValue };
      }, {});
      setFormData(initialState);
    }
  }, [fields, formData]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Limpia errores al modificar
  };

  const handleMultipleChange = (name: string) => (e: SelectChangeEvent<string[]>) => {
    const { value } = e.target;
    const parsedValue = typeof value === 'string' ? value.split(',') : value;
  
    setFormData((prev) => ({ ...prev, [name]: parsedValue.join(',') }));
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
    }
  };

  const handleCancel = () => {
    if (onCancel)
      onCancel();
    setErrors({});
  };
  

  return (
    <>
      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        {fields.map((field) => (
          <div key={field.name} className={`${styles["input-group"]}`} >
            <label className={styles.label}>{field.label}</label>
            {field.type === 'select' ? (
            field.multiple ? (
              <FormControl className={styles.select}>
                <InputLabel id={`${field.name}-label`}></InputLabel>
                <Select
                  labelId={`${field.name}-label`}
                  id={field.name}
                  multiple
                  value={formData[field.name] ? formData[field.name].split(",") : []}
                  onChange={handleMultipleChange(field.name)}
                  input={<OutlinedInput label={field.label} />}
                  renderValue={(selected: string[]) => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {field.options && sortStrings(field.options).map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={formData[field.name].includes(option)} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                onFocus={field.onFocus}
                className={styles.select}
              >
                <option value="">Seleccione una opción</option>
                {field.options && sortStrings(field.options).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className={`${styles.input} ${field.name}`}
              {...(field.type === "number" ? { min: "1", step: "any" } : {})}
            />
          )}
            {errors[field.name] && <p className={styles.error}>{errors[field.name]}</p>}
          </div>
        ))}
        {children}
      </form>

      <div className={styles["button-container"]}>
        {onCancel && (
          <button type="button" onClick={handleCancel} className={`${styles.button} ${styles["button-secondary"]} ${equalButtonWidth ? styles["equal-width"] : ""}`}>
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          className={`${styles.button} ${styles["button-primary"]} ${equalButtonWidth ? styles["equal-width"] : ""}`} 
          onClick={handleSubmit}
          disabled={isSubmitDisabled ? isSubmitDisabled(formData) : false}
        >
          {buttonName}
        </button>
      </div>
    </>
  );
}
