"use client";
import { IconButton } from "@mui/material";
import styles from "./ItemList.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";



interface GenericListProps {
  items: Record<string, string>[];
  displayKeys: string[]; // Lista de claves a mostrar
  onSelect?: (id: string) => void; // Función para manejar selección (opcional)
  selectedIds?: string[]; // IDs de los elementos seleccionados (opcional)
  selectItems: boolean;
  deleteItems: boolean;
  onDelete?: (id: string) => void; // Función para manejar selección (opcional)
  selectSingleItem: boolean;
  onSelectSingleItem?: (id: string) => void; // Función para manejar selección de un solo item (opcional)
}

const ItemList: React.FC<GenericListProps> = ({
  items,
  onSelect,
  selectedIds = [],
  selectItems,
  deleteItems,
  onDelete,
  displayKeys,
  selectSingleItem,
  onSelectSingleItem
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.itemList}>
        {items.map((item) => {

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
              {displayKeys.map((key) => (
                <span 
                  key={key} 
                  className={styles.itemField} 
                  onClick={selectSingleItem && onSelectSingleItem ? () => onSelectSingleItem(item.id) : undefined}
                >
                  {item[key]}
                </span>
              ))}

            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ItemList;