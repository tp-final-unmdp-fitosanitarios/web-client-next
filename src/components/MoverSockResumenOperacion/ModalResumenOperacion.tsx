import { Stock } from "@/domain/models/Stock";
import { transformToItems } from "@/utilities/transform";
import { Modal, Box } from "@mui/material";
import ItemList from "../itemList/ItemList";
import styles from "./ModalResumenOperacion.module.scss";
interface Props {
    open: boolean;
    setModalClose: () => void;
    stock: Stock[];
    origen: string | null;
    destino: string | null;
    handleFinish: () => void;
}

const ModalResumenOperacion: React.FC<Props> = ({open, setModalClose, stock, origen, destino, handleFinish}) => {
    
    const stockToMoveToDisplay = stock.map((item) => ({
        id: item.id,
        producto: item.product.name,
        amount: item.amount.toString(),
        unit: item.product.unit,
        location: item.location.name,
    }));

    const items = transformToItems(stockToMoveToDisplay, "id", ["producto", "amount", "unit"]).map((item) => {
        return {
          ...item,
          display: `${item.producto} : ${item.amount}${item.unit}`,
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
                        <h5>Origen: </h5>
                        <h5>{origen? origen : ""}</h5>
                    </div>
                    <div className={styles.dataPresentation}>
                        <h5>Destino: </h5>
                        <h5>{destino? destino : ""}</h5>
                    </div>
                </div>
                <p className={styles.message}>Movera los siguientes produtos</p>
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