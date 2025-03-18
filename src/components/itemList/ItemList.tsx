'use client';

import React, { useState } from 'react';
import styles from './ItemList.module.scss'; 
import { Item } from '@/domain/models/Item';


interface GenericListProps {
  items: Record<string, string>[]; 
  displayKeys: string[]; // Lista de claves a mostrar
}

const GenericList: React.FC<GenericListProps> = ({
  items, displayKeys
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleCheckboxChange = (id: string) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemId) => itemId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.itemList}>
        {items.map((item) => {

          let itemString = ""
          displayKeys.forEach( (key) => {itemString = itemString+item[key]+" "})

          return(
          <label key={item.id} className={styles.item}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
              className={styles.checkbox}
            />
            <span  className={styles.itemField}>
              {itemString}
            </span>
          </label>
          )
        })}
      </div>
    </div>
  );
};

export default GenericList;