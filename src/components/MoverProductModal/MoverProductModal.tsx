import { Box, Modal, TextField } from "@mui/material";
import { useState } from "react";
import styles from "./MoverProductModal.module.scss";
import { Stock } from "@/domain/models/Stock";

interface Props {
    setModalClose: () => void;
    stock: Stock;
    open: boolean;
    addProductToMove: (stock: Stock,cantidadBultos: number | null, total: number | null) => void;
    withdraw: boolean;
  }


const MoverProductModal: React.FC<Props> = ({open, setModalClose, stock, addProductToMove, withdraw}) => {
    const [selectedSize, setSelectedSize] = useState('unitAmount');
    const [cantidad, setCantidad] = useState('');
    const product = stock.product;

    const handleSubmit = (e: any) => {
        e.preventDefault();
        
        setModalClose();
        if(selectedSize === 'unitAmount')
            addProductToMove(stock,Number(cantidad),null);
        
        if(selectedSize === 'totalAmount')
            addProductToMove(stock,null,Number(cantidad));
        
    };

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
                     aria-labelledby="Ventana modal para mover producto"
                >
                    <h1 className={styles.title}>{withdraw ? "Retirar Producto" : "Mover Producto"}</h1>
                    <h3 className={styles.title}>{product.name}</h3>
                    <h3 className={styles.title}>Stock actual en {stock.location.name}: {stock.amount} {stock.unit}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.radioContainer}>
                            <label>
                                <input
                                    type="radio"
                                    name="inputType"
                                    value="bultos"
                                    onChange={() => setSelectedSize("unitAmount")}
                                    defaultChecked
                                />
                                Cantidad de Bultos
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="inputType"
                                    value="total"
                                    onChange={() => setSelectedSize("totalAmount")}
                                />
                                Cantidad Total
                            </label>
                        </div>
                            <TextField
                                fullWidth
                                margin="normal"
                                label={selectedSize === 'unitAmount' ? `Cantidad de Bultos de ${product?.amount} ${product?.unit}` : `Cantidad Total en ${product?.unit}`}
                                name="cantidadBultos"
                                type="number"
                                onChange={(e) => setCantidad(e.target.value)}
                                required
                            />
                            <div className={`${styles.buttonContainer}`}>
                                <button
                                    type="button"
                                    className={`button button-secondary ${styles.buttonHome} ${styles.buttonCancel}`}
                                    onClick={setModalClose}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`}
                                >
                                    Guardar
                                </button>
                            </div>
                    </form>
                </Box>
            </Modal>
        </div>
    );

}

export default MoverProductModal;
