"use client";
import { useState } from "react";

// Tipo genérico para ítems con un id de tipo configurable
interface ItemWithId<ID = number> {
  id: ID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const useItemsManager = <T extends ItemWithId<ID>, ID = number>(initialItems: T[]) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [selectedIds, setSelectedIds] = useState<ID[]>([]);
  const [deletedItems, setDeletedItems] = useState<T[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSelectItem = (id: ID) => {
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