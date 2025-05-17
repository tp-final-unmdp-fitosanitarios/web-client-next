import React, { useState } from 'react';
import { Modal, Box, TextField, Autocomplete } from '@mui/material';
import styles from "./modalAgregarProducto.module.scss"
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ModalAgregarProducto = ({ open, setModalClose, products, handleAddProducto, limite, cantActual }) => {
    const [selectedSize, setSelectedSize] = useState('unitAmount');
    const [cantidad, setCantidad] = useState(0);
    const [lotNumber, setLotNumber] = useState("");
    const [expirationDate, setExpirationDate] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const customInputSx = {
        '& .MuiInputBase-root': {
            borderRadius: '10px',
            backgroundColor: '#e6ebea',
            paddingX: 1,
            fontWeight: 'bold',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
            borderWidth: '2px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#404e5c',
        },
        '&.Mui-focused .MuiInputLabel-root': {
            color: '#404e5c',
        },
    };

    const disabledInputSx = {
        '& .MuiInputBase-root': {
            borderRadius: '10px',
            backgroundColor: '#f5f5f5', // gris muy claro
            paddingX: 1,
            fontWeight: 'bold',
            color: '#9e9e9e', // gris claro para el texto
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d3d3d3', // gris claro para el borde
            borderWidth: '2px',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d3d3d3',
        },
        '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#9e9e9e', // gris claro para el label
        },
        '&.Mui-focused .MuiInputLabel-root': {
            color: '#9e9e9e',
        },
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalClose();
        if (selectedSize === "totalAmount")
            handleAddProducto(e.target[0].value, lotNumber, expirationDate, null, Math.round(cantidad));
        else if (selectedSize === "unitAmount")
            handleAddProducto(e.target[0].value, lotNumber, expirationDate, Math.round(cantidad), null);

    };

    const handleSelectedProduct = (event, value) => {
        const selectedProduct = products.find((product) => product.name === value?.label);
        if (selectedProduct) {
            setSelectedProduct(selectedProduct);
        }
    }

    const options = products.map((p) => ({ label: p.name }));

    const fields = [
        {
            name: "producto",
            label: "Producto",
            type: "select",
            options: Array.from(new Set(products.map((p) => p.name))).sort(),
            onFocus: handleSelectedProduct,
        },
        {
            name: "proveedor",
            label: "Proveedor",
            type: "select",
            options: Array.from(new Set(products.map((p) => p.provider))).sort(),
            onFocus: handleSelectedProduct,
        },
    ];

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
                        bgcolor: '#f5f7f6',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 8,
                        border: '3px solid #404e5c',
                    }}
                >
                    <h3 className={styles.title}>Agregar Producto</h3>
                    {cantActual < limite ? (
                        <form onSubmit={handleSubmit}>
                            <Autocomplete
                                disablePortal
                                options={options}
                                renderInput={(params) => <TextField {...params} label="Producto" required sx={customInputSx} />}
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
                                sx={ selectedSize === 'unitAmount' ? customInputSx : disabledInputSx}
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
                                sx={ selectedSize === 'totalAmount' ? customInputSx : disabledInputSx}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nro de Lote"
                                name="lotNumber"
                                type="text"
                                onChange={(e) => setLotNumber(e.target.value)}
                                required
                                sx={customInputSx}
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DesktopDatePicker']}
                                    sx={{ overflow: 'hidden' }} >
                                    <DatePicker
                                        label="Fecha de Vencimiento"
                                        value={expirationDate}
                                        onChange={(newDate) => setExpirationDate(newDate)}
                                        slotProps={{
                                            textField: {
                                                sx: customInputSx
                                            },
                                        }}
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