import { Stock } from "@/domain/models/Stock";
import { transformToItems } from "@/utilities/transform";
import { Modal, Box } from "@mui/material";
import ItemList from "../itemList/ItemList";
import styles from "./ForceMovementModal.module.scss";
interface Props {
    open: boolean;
    setModalClose: () => void;
    stockToMove: (Stock & {flag: string, cantidad: number})[];
    actualStock: Stock[];
    origen: string | null;
    destino: string | null;
    handleForceFinish: () => void;
    withdraw: boolean;
}

const ForceMovementModal: React.FC<Props> = ({open, setModalClose, stockToMove, actualStock, origen, destino, withdraw, handleForceFinish}) => {
    
    const stockNegativo = stockToMove.map((item) => {
        const stockARestar = actualStock.find((stock) => stock.product.id === item.product.id);
        if(stockARestar){
            console.log("stockARestar", stockARestar.amount);
            console.log("item", item.cantidad);
            let diferencia = 0;
            if(item.flag === "unitAmount"){
                diferencia = stockARestar.amount - (item.cantidad * item.product.amount);
                if(diferencia < 0){
                    console.log("diferencia", diferencia);
                    return {
                        id: item.id,
                        producto: item.product.name,
                        cantidad: item.cantidad * item.product.amount,
                        stockActual: stockARestar.amount,
                        unit: item.product.unit,
                    }
                }
            }else{
                diferencia = stockARestar.amount - item.cantidad;
                if(diferencia < 0){
                    console.log("diferencia", diferencia);
                    return {
                        id: item.id,
                        producto: item.product.name,
                        cantidad: item.cantidad,
                        stockActual: stockARestar.amount,
                        unit: item.product.unit,
                    }
                }
            }
        }
    });
    console.log("stockNegativo", stockNegativo);

    const items = transformToItems(stockNegativo.filter(item => item !== undefined), "id", ["producto", "stockActual","unit","cantidad"]).map((item) => {
          return {
            ...item,
            display: `${item.producto}\nEn stock: ${item.stockActual}${item.unit} - ${withdraw? "Retiro": "Movimiento"}: ${item.cantidad}${item.unit}`
        };
    });
  
  const campos = ["display"];

    return (
        <div>
            <Modal open={open} onClose={setModalClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                <h3 className={styles.title}>Advertencia al {withdraw ? "retirar" : "mover"} stock</h3>
                <div className={styles.outputContainer}>
                    <div className={styles.dataPresentation}>
                        <h4>Esta {withdraw ? "retirando todo el stock disponible" : "moviendo mas stock del que existe en el origen"}</h4>
                    </div>
                    <div className={styles.dataPresentation}>
                        <h4>En los siguientes productos:</h4>
                    </div>
                </div>
                {items.length > 0 ? (
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            selectItems={false}
                            deleteItems={false}
                            selectSingleItem={false}
                        />
                        ) : (
                            <p>Ocurrio un error al mover el stock :(</p>
                        )}
                
                <div className={`${styles.buttonContainer}`}>
                        <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} onClick={setModalClose}> 
                            Cancelar
                        </button>
                        <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`} onClick={handleForceFinish}>
                            Forzar
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default ForceMovementModal;