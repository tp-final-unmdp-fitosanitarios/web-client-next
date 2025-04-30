"use client";
import ItemList from "@/components/itemList/ItemList";
import MenuBar from "@/components/menuBar/MenuBar";
import { useSearchParams } from "next/navigation";
import styles from "./retirarStock.module.scss";
import { useEffect, useState } from "react";
import { Stock } from "@/domain/models/Stock";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useAuth } from "@/components/Auth/AuthProvider";
import { transformToItems } from "@/utilities/transform";
import MoverProductModal from "@/components/MoverProductModal/MoverProductModal";
import ResultModal from "@/components/MoverSockResumenOperacion/ModalResumenOperacion";
import router from "next/router";
import ForceMovementModal from "@/components/ForceMovementModal/ForceMovementModal";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer/Footer";
import GenericModal from "@/components/modal/GenericModal";

const RetirarStock = () => {
const searchParams = useSearchParams();
const origen = searchParams.get("origen");
const originName = searchParams.get("oid");

const actualLocation = origen
const [stockFromServer, setStockFromServer] = useState<Stock[]>([]);
const [productsToWithdraw, setProductsToWithdraw] = useState<(Stock & {flag: string, cantidad: number})[]>([]);
const [error, setError] = useState<string>("");
const [loading, setLoading] = useState<boolean>(true);
const [showWithdrawProductModal, setShowWithdrawProductModal] = useState<boolean>(false);
const [showResultModal, setShowResultModal] = useState<boolean>(false);
const [showForceModal, setShowForceModal] = useState<boolean>(false);
const [selectedItem, setSelectedItem] = useState<Stock | null>(null);
const [confirmationModalOpen,setConfirmationModalOpen] = useState(false);
const { getApiService, isReady } = useAuth();
const apiService = getApiService();
const router = useRouter();

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

  const stockToWithdrawToDisplay = productsToWithdraw.map((item) => ({
    id: item.id,
    producto: item.product.name,
    amount: item.product.amount.toString(),
    cantidad: item.cantidad.toString(),
    unit: item.product.unit,
    location: item.location.name,
    flag: item.flag
  }));


  const handleSelectSingleItem = (id: string) => {
    setSelectedItem(stockFromServer.find((item) => item.id === id) || null);
    if(selectedItem){
      setShowWithdrawProductModal(true);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductsToWithdraw(productsToWithdraw.filter((item) => item.id !== id));
  };

  const handleModalClose = () => {
    setShowWithdrawProductModal(false);
    setSelectedItem(null);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
  }

  const handleWithdrawProducts = () => {
    if(productsToWithdraw.length > 0)
        setShowResultModal(true);
  };

  const addProductToWithdraw = (stock: Stock,cantidadBultos: number | null, total: number | null) => {
    if(cantidadBultos)
        setProductsToWithdraw([...productsToWithdraw,
        {...stock,
            flag: "unitAmount",
            cantidad: cantidadBultos
        }
        ]);

    if(total)
        setProductsToWithdraw([...productsToWithdraw,
        {...stock,
            flag: "totalAmount",
            cantidad: total
        }
        ]);
    };

  async function handleFinish(): Promise<void> {
    const stockToMove = productsToWithdraw.map((item) => {
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
      destination_id: null,
      stock_to_move: stockToMove
    }

    console.log(moveStockRequest);

    const response = await apiService.create<ResponseItems<Stock>>("stock/retire", moveStockRequest);

    if(response.success){
      setShowResultModal(false);
      setProductsToWithdraw([]);
      setConfirmationModalOpen(true); 
    }
    else{
      console.log("Error al mover stock");
      console.log(response);
      if(response.status === 400)
        setShowForceModal(true);
      else{
        setError(response.error || "Error al mover stock");
      }
    }
  }

  const handleForceModalClose = () => {
    setShowForceModal(false);
  }

  const handleForceFinish = async() => {
    console.log("Force finish");
    const stockToMove = productsToWithdraw.map((item) => {
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
      destination_id: null,
      stock_to_move: stockToMove
    }

    const response = await apiService.create<ResponseItems<Stock>>("stock/retire?force=true", moveStockRequest);

    if(response.success){
      setShowForceModal(false);
      setProductsToWithdraw([]);
      setConfirmationModalOpen(true); 
    }
    else{
      setError(response.error || "Error al mover stock");
    }
  }

  const itemsCurrentStock = transformToItems(currentStockToDisplay, "id", ["producto", "amount", "unit"]).map((item) => {
    return {
        ...item,
        display: `${item.producto} : ${item.amount}${item.unit}`,
    };
    });

    const handleCloseConfirmationModal = () => {
      setConfirmationModalOpen(false);
      router.push("/stock");
  }

    const itemsStockToWithdraw = transformToItems(stockToWithdrawToDisplay, "id", ["producto", "amount","unit","flag", "cantidad"]).map((item) => {
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

if (loading) return <div>Cargando...</div>;
if (error) return <div>Error: {error}</div>;

return (
    <div className="page-container">
      <div className="content-wrap">
      <MenuBar showMenu={false} showArrow={true} path="/stock" />
      <div className={styles.mainContainer}>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Stock disponible en {originName}</h2>
          { itemsCurrentStock.length > 0 ? (
              <ItemList
                items={itemsCurrentStock}
                displayKeys={campos}
                selectItems={false}
                deleteItems={false}
                selectSingleItem={true}
                onSelectSingleItem={handleSelectSingleItem}
              />
            ):(
              <p>No hay stock en la locacion seleccionada</p>
            )
          }
        </div>
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Productos a Retirar</h2>
          { itemsStockToWithdraw.length > 0 ? (
            <ItemList
              items={itemsStockToWithdraw}
              displayKeys={campos}
              selectItems={false}
              deleteItems={true}
              onDelete={handleDeleteProduct}
              selectSingleItem={false}
            />
          ):(
            <p>Seleccione productos a retirar</p>
          )
          }
        </div>
        
      </div>
      <div className={styles.buttonContainer}>
        <button className={`${styles.button} button-primary ${styles.buttonHome}`} onClick={handleWithdrawProducts}>Retirar productos</button>
      </div>
      
      {showWithdrawProductModal && selectedItem && (
        <MoverProductModal open={showWithdrawProductModal} setModalClose={handleModalClose} stock={selectedItem} addProductToMove={addProductToWithdraw} withdraw={true}/>
      )}
      {showResultModal && (
        <ResultModal open={showResultModal} setModalClose={handleResultModalClose} stock={productsToWithdraw} origen={originName} destino={""} handleFinish={handleFinish} withdraw={true}/>
      )}
      {showForceModal && (
        <ForceMovementModal open={showForceModal} setModalClose={handleForceModalClose} stockToMove={productsToWithdraw} actualStock={stockFromServer} origen={originName} destino={""} handleForceFinish={handleForceFinish} withdraw={true}/>
      )}
      </div>
      <GenericModal
          isOpen={confirmationModalOpen}
          onClose={handleCloseConfirmationModal}
          title="Retiro exitoso"
          modalText={`Se retiro stock correctamente`}
          buttonTitle="Cerrar"
          showSecondButton={false}
      />
      <Footer />
    </div>
  );
}

export default RetirarStock;