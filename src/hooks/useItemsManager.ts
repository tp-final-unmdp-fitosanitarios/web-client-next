"use client";
import { useEffect, useState } from "react";

// Tipo genérico para ítems con un id de tipo string
interface ItemWithId {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const useItemsManager = <T extends ItemWithId>(initialItems: T[]) => {
  const [items, setItems] = useState<T[]>(initialItems);

  // Escucha cambios en initialItems para actualizar el estado
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletedItems, setDeletedItems] = useState<T[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const quitarItems = () => {
    const itemsEliminados = items.filter((item) => selectedIds.includes(item.id));
    setDeletedItems(itemsEliminados);
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDeletedItems([]);
  };

  return {
    items,
    selectedIds,
    deletedItems,
    isModalOpen,
    toggleSelectItem,
    quitarItems,
    closeModal,
  };
};
