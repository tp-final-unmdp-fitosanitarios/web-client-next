'use client';

import React, { useState } from 'react';
import styles from './ItemList.module.scss'; 

interface Item {
  id: string;
  name: string;
  code: string;
}

interface GenericListProps {
  // mainText: string;
  // secondaryText?: string;
  items: Item[]; 
  // actionText: string;
  // onAction: (selectedItems: Item[]) => void;
}

const GenericList: React.FC<GenericListProps> = ({
  items,
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

  // const handleActionClick = () => {
  //   if (selectedItems.length > 0) {
  //     const selected = items.filter((item) => selectedItems.includes(item.id));
  //     onAction(selected); 
  //   }
  // };

  //Habria que encontrar la manera de que se muestren los campos genericos de los items
  //para no depender de los nombres de cada campo de cada objeto
  //Ahora solo se puede .name y .code
  return (
    <div className={styles.container}>
      <div className={styles.itemList}>
        {items.map((item) => (
          <label key={item.id} className={styles.item}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
              className={styles.checkbox}
            />
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemCode}>- {item.code}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default GenericList;