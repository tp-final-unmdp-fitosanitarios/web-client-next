import { Stock } from "@/domain/models/Stock";
import { transformToItems } from "@/utilities/transform";
import { Modal, Box } from "@mui/material";
import ItemList from "../itemList/ItemList";
import styles from "./ModalResumenOperacion.module.scss";
interface Props {
    open: boolean;
    setModalClose: () => void;
    stock: (Stock & {flag: string, cantidad: number})[];
    origen: string | null;
    destino: string | null;
    handleFinish: () => void;
    withdraw: boolean;
}

const ModalResumenOperacion: React.FC<Props> = ({open, setModalClose, stock, origen, destino, handleFinish, withdraw}) => {
    
    const stockToMoveToDisplay = stock.map((item) => ({
        id: item.id,
        producto: item.product.name,
        amount: item.product.amount.toString(),
        cantidad: item.cantidad.toString(),
        unit: item.product.unit,
        location: item.location.name,
        flag: item.flag
      }));

    const items = transformToItems(stockToMoveToDisplay, "id", ["producto", "amount","unit","flag", "cantidad"]).map((item) => {
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
                <h3 className={styles.title}>Resumen de Operación</h3>
                <div className={styles.outputContainer}>
                    <div className={styles.dataPresentation}>
                        <h4>Origen: </h4>
                        <h4>{origen? origen : ""}</h4>
                    </div>
                    {!withdraw ? (
                    <div className={styles.dataPresentation}>
                        <h4>Destino: </h4>
                        <h4>{destino? destino : ""}</h4>
                    </div>
                    ) : null}
                </div>
                <p className={styles.message}>{withdraw ? "Retirar" : "Mover"} los siguientes produtos</p>
                {stock.length > 0 ? (
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
                        <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`} onClick={handleFinish}>
                            Finalizar
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default ModalResumenOperacion;