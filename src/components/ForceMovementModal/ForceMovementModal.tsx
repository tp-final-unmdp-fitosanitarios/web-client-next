"use client";

import { Stock } from "@/domain/models/Stock";
import { Modal, Box } from "@mui/material";
import styles from "./ForceMovementModal.module.scss";

interface Props {
    open: boolean;
    origen: string|null;
    destino: string|null;
    setModalClose: () => void;
    stockToMove: (Stock & {flag: string, cantidad: number})[];
    actualStock: Stock[];
    handleForceFinish: () => void;
    withdraw: boolean;
}

const ForceMovementModal: React.FC<Props> = ({open, setModalClose, stockToMove, actualStock, withdraw, handleForceFinish}) => {
    
    const stockNegativo = stockToMove.map((item) => {
        const stockARestar = actualStock.find((stock) => stock.product.id === item.product.id);
        if(stockARestar){
            //console.log("stockARestar", stockARestar.amount);
            //console.log("item", item.cantidad);
            let diferencia = 0;
            if(item.flag === "unitAmount"){
                diferencia = stockARestar.amount - (item.cantidad * item.product.amount);
                if(diferencia < 0){
                    //console.log("diferencia", diferencia);
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
                    //console.log("diferencia", diferencia);
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
    //console.log("stockNegativo", stockNegativo);

    const items = stockNegativo.filter(item => item !== undefined).map((item) => {
        const exceso = Number(item.cantidad) - Number(item.stockActual);
        return {
            ...item,
            exceso: exceso > 0 ? `${exceso}${item.unit}` : null
        };
    });

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
                        <h4>Está {withdraw ? "retirando" : "moviendo"} más stock del disponible en los siguientes productos:</h4>
                    </div>
                </div>
                <div>
                    {items.map((item) => (
                        <div key={item.id} className={styles.productContainer}>
                            <span className={styles.productName}>{item.producto}</span>
                            {item.exceso && (
                                <span className={styles.excesoLabel}>
                                    Exceso: <b>{item.exceso}</b>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
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