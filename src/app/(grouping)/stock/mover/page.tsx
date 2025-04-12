"use client";
import { useEffect, useState } from "react";
import ItemList from "@/components/itemList/ItemList";
import styles from "./moverStock.module.scss";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Stock } from "@/domain/models/Stock";
import { ResponseItems } from "@/domain/models/ResponseItems";
import MenuBar from "@/components/menuBar/MenuBar";
import { useSearchParams } from "next/navigation";


const MoverStock = () => {
  const searchParams = useSearchParams();
  const origen = searchParams.get("origen");
  const destino = searchParams.get("destino");

  const actualLocation = origen

  const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();

  const fetchStock = async () => { //Terminar de deasrrollar el componente :  Hacer peticion para traer el stock por locacion. Agregar logica para mover productos.
    try {
      const response = await apiService.get<ResponseItems<Stock>>(
        `stock?size=100&page=1&location=${actualLocation}`
      );
      if (response.success) {
        setStockFromServer(response.data.content);
      } else {
        setError(response.error || "Error al obtener el stock");
      }
    } catch (err) {
      setError("Error al conectar con el servidor: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    fetchStock();
  }, [isReady]);

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const items = stockFromServer.map((item) => ({
    id: item.id,
    producto: item.product.name,
    amount: item.amount.toString(),
    location: item.location.name,
  }));

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (


    <div className={styles.pageContainer}>
      <MenuBar showMenu={true} path="" />
      <div className={styles.mainContainer}>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Stock disponible en {actualLocation}</h2>
          <ItemList
            items={items}
            displayKeys={["producto", "amount", "location"]}
            onSelect={toggleSelectItem}
            selectedIds={selectedIds}
            selectItems={true}
            deleteItems={false}
          />
        </div>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Productos a mover hacia {destino}</h2>
          <ItemList
            items={selectedItems}
            displayKeys={["producto", "amount", "location"]}
            selectItems={false}
            deleteItems={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MoverStock;
