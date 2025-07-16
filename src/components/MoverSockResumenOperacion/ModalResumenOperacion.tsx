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
    const handleSubmit = () => {
        handleFinish();
    }
    
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
        <Modal 
            open={open} 
            onClose={setModalClose}
            aria-labelledby="resumen-operacion-modal"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '500px' },
                    maxHeight: '90vh',
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    overflow: 'auto'
                }}
            >
                <h3 className={styles.title}>Resumen de Operación</h3>
                <p className={styles.message}>{withdraw ? "Retirará" : "Moverá"} los siguientes productos</p>
                
                {stock.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '20px' }}>
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            selectItems={false}
                            deleteItems={false}
                            selectSingleItem={false}
                        />
                    </div>
                ) : (
                    <p className={styles.message}>Ocurrió un error al mover el stock :(</p>
                )}

                <div className={styles.outputContainer}>
                    <div className={styles.dataPresentation}>
                        <h4>Origen:</h4>
                        <h4>{origen ? origen : ""}</h4>
                    </div>
                    {!withdraw && (
                        <div className={styles.dataPresentation}>
                            <h4>Destino:</h4>
                            <h4>{destino ? destino : ""}</h4>
                        </div>
                    )}
                </div>

                <div className={styles.buttonContainer}>
                    <button 
                        className={`button ${styles.buttonCancel}`} 
                        onClick={setModalClose}
                    > 
                        Cancelar
                    </button>
                    <button 
                        className={`button ${styles.buttonFinish}`} 
                        onClick={handleSubmit}
                    >
                        Finalizar
                    </button>
                </div>
            </Box>
        </Modal>
    );
}

export default ModalResumenOperacion;