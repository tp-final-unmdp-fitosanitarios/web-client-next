import React, { useState } from 'react';
import { Modal, Box, TextField, Autocomplete} from '@mui/material';
import styles from "./modalAgregarProducto.module.scss"
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ModalAgregarProducto = ({open, setModalClose, products, handleAddProducto, limite, cantActual}) => {
    const [selectedSize, setSelectedSize] = useState('unitAmount');
    const [cantidad, setCantidad] = useState(0);
    const [lotNumber, setLotNumber] = useState("");
    const [expirationDate, setExpirationDate] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalClose();
        if (selectedSize === "totalAmount")
            handleAddProducto(e.target[0].value,lotNumber, expirationDate,null,Math.round(cantidad));
        else if (selectedSize === "unitAmount")
            handleAddProducto(e.target[0].value,lotNumber, expirationDate,Math.round(cantidad),null);

    };

    const handleSelectedProduct = (event, value) => {
        const selectedProduct = products.find((product) => product.name === value?.label);
        if (selectedProduct) {
            setSelectedProduct(selectedProduct);
        }
    }

    const options = products.map((p) => ({ label: p.name }));

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
                     aria-labelledby="Ventana modal para agregar producto"
                >
                    <h3 className={styles.title}>Agregar Producto {cantActual}/{limite}</h3>
                    {cantActual < limite ? (
                        <form onSubmit={handleSubmit}>
                            <Autocomplete
                                disablePortal
                                options={options}
                                renderInput={(params) => <TextField {...params} label="Producto" required />}
                                onChange={handleSelectedProduct}
                            />
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
                                label={selectedProduct ? `Cantidad de Bultos de ${selectedProduct?.amount} ${selectedProduct?.unit}` : "Cantidad de Bultos"}
                                name="cantidadBultos"
                                type="number"
                                onChange={(e) => setCantidad(e.target.value)}
                                disabled={selectedSize !== 'unitAmount'}
                                required={selectedSize === 'unitAmount'}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label={selectedProduct ? `Cantidad Total en ${selectedProduct?.unit}` : "Cantidad Total"}
                                name="cantidadTotal"
                                type="number"
                                onChange={(e) => setCantidad(e.target.value)}
                                disabled={selectedSize !== 'totalAmount'}
                                required={selectedSize === 'totalAmount'}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nro de Lote"
                                name="lotNumber"
                                type="text"
                                onChange={(e) => setLotNumber(e.target.value)}
                                required
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DesktopDatePicker']}>
                                <DatePicker
                                    label="Fecha de Vencimiento"
                                    value={expirationDate}
                                    onChange={(newDate) => setExpirationDate(newDate)}
                                />
                                </DemoContainer>
                            </LocalizationProvider>
                            <div className={`${styles.buttonContainer}`}>
                                <button
                                    type="button"
                                    className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`}
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
                    ) : (
                        <p className={styles.message}>Ya completó todos los productos ingresados</p>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default ModalAgregarProducto;