"use client";
import { IconButton } from "@mui/material";
import styles from "./ItemList.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";

interface Item {
  id: number;
  [key: string]: string | number; // Permitir tanto string como number en las propiedades
}

interface GenericListProps {
  items: Item[];
  displayKeys: string[]; // Lista de claves a mostrar
  onSelect?: (id: number) => void; // Función para manejar selección (opcional)
  selectedIds?: number[]; // IDs de los elementos seleccionados (opcional)
  selectItems: boolean;
  deleteItems: boolean;
  onDelete?: (id: number) => void; // Función para manejar selección (opcional)
}

const ItemList: React.FC<GenericListProps> = ({
  items,
  displayKeys,
  onSelect,
  selectedIds = [],
  selectItems,
  deleteItems,
  onDelete
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.itemList}>
        {items.map((item) => {
          // Construir una cadena con las propiedades especificadas en displayKeys
          const itemString = displayKeys
            .map((key) => String(item[key])) // Convertir cada valor a string
            .join(" ");

            return (
            <label key={item.id} className={styles.item}>
              {onSelect && selectItems ? (
              <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => onSelect(item.id)}
              className={styles.checkbox}
              />
              ) : null}
              {deleteItems && onDelete ? (
                <IconButton 
                  onClick={() => onDelete(item.id)} 
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              ) : null}
              <span className={styles.itemField}>{itemString}</span>
            </label>
            );
        })}
      </div>
    </div>
  );
};

export default ItemList;