"use client";
import { useEffect, useState } from "react";
import ItemList from "@/components/itemList/ItemList";
import styles from "./moverStock.module.scss";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Stock } from "@/domain/models/Stock";
import { ResponseItems } from "@/domain/models/ResponseItems";
import MenuBar from "@/components/menuBar/MenuBar";
import { useSearchParams } from "next/navigation";
import { transformToItems } from "@/utilities/transform";
import MoverProductModal from "@/components/MoverProductModal/MoverProductModal";
import { Button } from "@mui/material";
import ResultModal from "@/components/MoverSockResumenOperacion/ModalResumenOperacion";

const MoverStock = () => {
  const searchParams = useSearchParams();
  const origen = searchParams.get("origen");
  const destino = searchParams.get("destino");

  const actualLocation = origen
  const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
  const [productsToMove, setProductsToMove] = useState<(Stock & {flag: string, cantidad: number})[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Stock | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showMoverProductModal, setShowMoverProductModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();

  const fetchStock = async () => { //Terminar de deasrrollar el componente :  Hacer peticion para traer el stock por locacion. Agregar logica para mover productos.
    try {
      const response = await apiService.get<ResponseItems<Stock>>(
        `stock?location=${actualLocation}`
      );
      if (response.success) {
        console.log(response.data.content);
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

  const currentStockToDisplay = stockFromServer.map((item) => ({
    id: item.id,
    producto: item.product.name,
    amount: item.amount.toString(),
    unit: item.product.unit,
    location: item.location.name,
  }));

  const stockToMoveToDisplay = productsToMove.map((item) => ({
    id: item.id,
    producto: item.product.name,
    amount: item.amount.toString(),
    unit: item.product.unit,
    location: item.location.name,
  }));


  const handleSelectSingleItem = (id: string) => {
    setSelectedItem(stockFromServer.find((item) => item.id === id) || null);
    if(selectedItem){
      setShowMoverProductModal(true);
    }
  };

  const handleModalClose = () => {
    setShowMoverProductModal(false);
    setSelectedItem(null);
  };

  const addProductToMove = (stock: Stock,cantidadBultos: number | null, total: number | null) => {
    if(cantidadBultos)
      setProductsToMove([...productsToMove,
        {...stock,
          flag: "unitAmount",
          cantidad: cantidadBultos
        }
      ]);

    if(total)
      setProductsToMove([...productsToMove,
        {...stock,
          flag: "totalAmount",
          cantidad: total
        }
      ]);
  };


  const handleDeleteProduct = (id: string) => {
    setProductsToMove(productsToMove.filter((item) => item.id !== id));
  };

  const itemsCurrentStock = transformToItems(currentStockToDisplay, "id", ["producto", "amount", "unit"]).map((item) => {
    return {
        ...item,
        display: `${item.producto} : ${item.amount}${item.unit}`,
    };
    });

    const itemsStockToMove = transformToItems(stockToMoveToDisplay, "id", ["producto", "amount", "unit"]).map((item) => {
      return {
        ...item,
        display: `${item.producto} : ${item.amount}${item.unit}`,
    };
  });

const campos = ["display"];

  function handleMoveProducts(e: any): void {
    if(productsToMove.length > 0)
      setShowResultModal(true);
  }

  const handleResultModalClose = () => {
    setShowResultModal(false);
  }

  async function handleFinish(): Promise<void> {
    const stockToMove = productsToMove.map((item) => {
      console.log(item);
      if(item.flag === "unitAmount")
        return{
        product_id: item.product.id,
        amount_of_units: item.cantidad,
        total_amount: null,
        unit: item.product.unit,
        lot_number: item.lot_number,
        expiration_date: item.expiration_date}

      if(item.flag === "totalAmount")
        return{
          product_id: item.product.id,
          amount_of_units: null,
          total_amount: item.cantidad,
          unit: item.product.unit,
          lot_number: item.lot_number,
          expiration_date: item.expiration_date}
    });



    const moveStockRequest = {
      origin_id: origen,
      destination_id: destino,
      stock_to_move: stockToMove
    }

    console.log(moveStockRequest);

    const response = await apiService.create<ResponseItems<Stock>>("stock/movement", moveStockRequest);
    console.log(response);
  }


  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.pageContainer}>
      <MenuBar showMenu={true} path="" />
      <div className={styles.mainContainer}>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Stock disponible en {actualLocation}</h2>
          <ItemList
            items={itemsCurrentStock}
            displayKeys={campos}
            onSelect={toggleSelectItem}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={true}
            onSelectSingleItem={handleSelectSingleItem}
          />
        </div>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Productos a mover hacia {destino}</h2>
          <ItemList
            items={itemsStockToMove}
            displayKeys={campos}
            selectItems={false}
            deleteItems={true}
            onDelete={handleDeleteProduct}
            selectSingleItem={false}
          />
        </div>
      </div>
      <Button className={styles.buttonPrimary} onClick={handleMoveProducts}>Mover productos</Button>
      {showMoverProductModal && selectedItem && (
        <MoverProductModal open={showMoverProductModal} setModalClose={handleModalClose} stock={selectedItem} addProductToMove={addProductToMove}/>
      )}
      {showResultModal && (
        <ResultModal open={showResultModal} setModalClose={handleResultModalClose} stock={productsToMove} origen={origen} destino={destino} handleFinish={handleFinish}/>
      )}
    </div>
  );
};

export default MoverStock;
