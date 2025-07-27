"use client";
import { useEffect, useState } from "react";
import ItemList from "@/components/itemList/ItemList";
import styles from "./moverStock.module.scss";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Stock } from "@/domain/models/Stock";
import { ResponseItems } from "@/domain/models/ResponseItems";
import MenuBar from "@/components/menuBar/MenuBar";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { transformToItems } from "@/utilities/transform";
import MoverProductModal from "@/components/MoverProductModal/MoverProductModal";
import ResultModal from "@/components/MoverSockResumenOperacion/ModalResumenOperacion";
import ForceMovementModal from "@/components/ForceMovementModal/ForceMovementModal";
import Footer from "@/components/Footer/Footer";
import GenericModal from "@/components/modal/GenericModal";

const MoverStock = () => {
  const searchParams = useSearchParams();
  const origen = searchParams.get("origen");
  const destino = searchParams.get("destino");
  const originName = searchParams.get("oid");
  const destinationName = searchParams.get("did");


  const actualLocation = origen
  const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
  const [productsToMove, setProductsToMove] = useState<(Stock & {flag: string, cantidad: number})[]>([]);
  const [selectedItem, setSelectedItem] = useState<Stock | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showMoverProductModal, setShowMoverProductModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [showForceModal, setShowForceModal] = useState<boolean>(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchStock = async () => { 
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
    amount: item.product.amount.toString(),
    cantidad: item.cantidad.toString(),
    unit: item.product.unit,
    location: item.location.name,
    flag: item.flag
  }));


  const handleSelectSingleItem = (id: string) => {
    setSelectedId(id);
    setSelectedItem(stockFromServer.find((item) => item.id === id) || null);
    setShowMoverProductModal(true);
  };

  const handleModalClose = () => {
    setShowMoverProductModal(false);
    setSelectedItem(null);
    setSelectedId(null);
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

    const itemsStockToMove = transformToItems(stockToMoveToDisplay, "id", ["producto", "amount","unit","flag", "cantidad"]).map((item) => {
      if (item.flag === "unitAmount")
        return {
            ...item,
            display: `${item.producto}: ${item.amount} ${item.unit} x ${item.cantidad}U`,
        };
      
        if (item.flag === "totalAmount")
        return {
            ...item,
            display: `${item.producto}: ${item.cantidad} ${item.unit}`,
        };

        return {
          ...item,
          display: `${item.producto}: ${item.cantidad} ${item.unit}`,
      };
  });

const campos = ["display"];

  function handleMoveProducts(): void {
    if(productsToMove.length > 0)
      setShowResultModal(true);
  }

  const handleResultModalClose = () => {
    setShowResultModal(false);
  }

  const handleForceModalClose = () => {
    setShowForceModal(false);
  }

  async function handleFinish(): Promise<void> {
    const stockToMove = productsToMove.map((item) => {
      console.log(item);

      if (item.flag === "unitAmount") {
        return {
          product_id: item.product.id,
          amount_of_units: item.cantidad,
          total_amount: null,
          unit: item.product.unit,
          lot_number: item.lot_number,
          expiration_date: item.expiration_date
        };
    }

      if (item.flag === "totalAmount") {
        return {
          product_id: item.product.id,
          amount_of_units: null,
          total_amount: item.cantidad,
          unit: item.product.unit,
          lot_number: item.lot_number,
          expiration_date: item.expiration_date
        };
      }

      return {
        product_id: item.product.id,
        amount_of_units: null,
        total_amount: item.cantidad,
      };
    });

    const moveStockRequest = {
      origin_id: origen,
      destination_id: destino,
      stock_to_move: stockToMove
    }

    console.log(moveStockRequest);

    const response = await apiService.create<ResponseItems<Stock>>("stock/movement", moveStockRequest);

    if (response.success) {
      setShowResultModal(false);
      setProductsToMove([]);
      setConfirmationModalOpen(true);
    } else{
      console.log("Error al mover stock");
      console.log(response);
      
      if (response.status === 400) {
        setShowResultModal(false);
        setShowForceModal(true);
      } else {
        setError(response.error || "Error al mover stock");
      }
    }
  }

  async function handleForceFinish(): Promise<void> {
    console.log("Force finish");
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

    const response = await apiService.create<ResponseItems<Stock>>("stock/movement?force=true", moveStockRequest);

    if(response.success){
      setShowForceModal(false);
      setProductsToMove([]);
      setConfirmationModalOpen(true);
    }
    else{
      setError(response.error || "Error al mover stock");
    }
  }

  const handleCloseConfirmationModal = () => {
    setConfirmationModalOpen(false);
    router.push("/stock");
}


  if (loading) return <div>Cargando...</div>;
  if (error && error !== "Network Error") return <div>Error: {error}</div>;

  return (
    <div className="page-container">
      <div className="content-wrap">
      <MenuBar showMenu={false} showArrow={true} path="/stock" />
      <div className={styles.mainContainer}>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Stock disponible en {originName}</h2>
          <ItemList
            items={itemsCurrentStock}
            displayKeys={campos}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={true}
            onSelectSingleItem={handleSelectSingleItem}
            selectedIds={selectedId ? [selectedId] : []}
          />
        </div>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Productos a mover hacia {destinationName}</h2>
          {itemsStockToMove.length > 0 ? (
            <ItemList
              items={itemsStockToMove}
              displayKeys={campos}
              selectItems={false}
              deleteItems={true}
              onDelete={handleDeleteProduct}
              selectSingleItem={false}
            />
          ) : (
            <p>Seleccione productos a mover</p>
          )}
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} button-primary ${styles.buttonHome}`}
              onClick={handleMoveProducts}
              disabled={productsToMove.length === 0}
            >
              Mover productos
            </button>
          </div>
        </div>
        
      </div>
      
      {showMoverProductModal && selectedItem && (
        <MoverProductModal open={showMoverProductModal} setModalClose={handleModalClose} stock={selectedItem} addProductToMove={addProductToMove} withdraw={false}/>
      )}
      {showResultModal && (
        <ResultModal open={showResultModal} setModalClose={handleResultModalClose} stock={productsToMove} origen={originName} destino={destinationName} handleFinish={handleFinish} withdraw={false}/>
      )}
      {showForceModal && (
        <ForceMovementModal open={showForceModal} setModalClose={handleForceModalClose} stockToMove={productsToMove} actualStock={stockFromServer}  origen={originName} destino={destinationName} handleForceFinish={handleForceFinish} withdraw={false}/>
      )}
      <GenericModal
          isOpen={confirmationModalOpen}
          onClose={handleCloseConfirmationModal}
          title="Movimiento exitoso"
          modalText={`Se movio stock correctamente`}
          buttonTitle="Cerrar"
          showSecondButton={false}
      />
      </div>
      <Footer />
    </div>
  );
};

export default MoverStock;
