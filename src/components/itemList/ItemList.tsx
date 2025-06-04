"use client";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./ItemList.module.scss";

interface GenericListProps {
  items: Record<string, string>[];
  displayKeys: string[];
  onSelect?: (id: string) => void;
  selectedIds?: string[];
  selectItems: boolean;
  deleteItems: boolean;
  onDelete?: (id: string) => void;
  selectSingleItem: boolean;
  onSelectSingleItem?: (id: string) => void;
  actions?: (item: Record<string, string>) => React.ReactNode;
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
  onSelectSingleItem,
  actions,
}) => {
  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <div className={styles.container}>
      {items.map((item) => {
        const handleClick = () => {
          if (selectSingleItem && onSelectSingleItem) {
            onSelectSingleItem(item.id);
          } else if (selectItems && onSelect) {
            onSelect(item.id);
          }
        };

        return (
          <div
            key={item.id}
            className={`${styles.card} ${isSelected(item.id) ? styles.selected : ""}`}
            onClick={handleClick}
          >
            <div className={styles.cardContent}>
              {displayKeys.map((key) => (
                <div key={key} className={styles.itemField}>
                  <span className={styles.itemValue}>{item[key]}</span>
                </div>
              ))}
            </div>

            <div className={styles.cardActions}>
              {actions && actions(item)}
              {deleteItems && onDelete && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemList;
