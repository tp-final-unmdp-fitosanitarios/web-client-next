import React, { useState } from 'react';
import { Modal, Box, TextField, Autocomplete, MenuItem } from '@mui/material';
import styles from "./AddRecipeItemModal.module.scss"
import { Producto } from '@/domain/models/Producto';

type ProductoExistente = Producto & {
    lot_number: string,
    cantidadEnStock: number
}

interface Props {
    open: boolean;
    setModalClose: () => void;
    products: ProductoExistente[];
    handleAddProducto: (producto: ProductoExistente, amount: number, doseType: string) => void;
}

const AddRecipeItemModal: React.FC<Props> = ({ open, setModalClose, products, handleAddProducto }) => {
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [doseType, setDoseType] = useState<string>("SURFACE");

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProduct!=="" && amount > 0) {
            const prod = products.find(p => p.name === selectedProduct)
            if(prod){
                handleAddProducto(prod, amount, doseType);
                setModalClose();
                setSelectedProduct("");
                setAmount(0);
                setDoseType("SURFACE");
            }
            else
                alert("Error al agregar el producto")
        }
    };

    return (
        <Modal
            open={open}
            onClose={setModalClose}
            aria-labelledby="modal-modal-title"
        >
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
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        select
                        name="producto"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        label="Seleccione un producto"
                        variant="outlined"
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: '#e6ebea',
                            },
                            '& .MuiInputLabel-root': {
                                color: '#404e5c',
                            },
                        }}
                    >
                        {products.map((p) => (
                            <MenuItem key={p.id ?? p.name} value={p.name}>
                                {p.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {selectedProduct ?
                        <p className={styles.text}>Hay {products.find(p => p.name === selectedProduct)?.cantidadEnStock} {products.find(p => p.name === selectedProduct)?.unit} en stock</p>
                        :
                        <></>
                    }
                    <TextField
                        fullWidth
                        type="number"
                        label= {selectedProduct ? "Cantidad a aplicar en "+products.find(p => p.name === selectedProduct)?.unit 
                            : `Cantidad a aplicar` }
                        onChange={(e) => setAmount(Number(e.target.value))}
                        required
                        sx={{
                            mt: 2,
                            ...customInputSx
                        }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Tipo de Dosis"
                        value={doseType}
                        onChange={(e) => setDoseType(e.target.value)}
                        required
                        sx={{
                            mt: 2,
                            ...customInputSx
                        }}
                    >
                        <MenuItem key={1} value="SURFACE">
                            Por Hectarea
                        </MenuItem>
                        <MenuItem key={2} value="TOTAL">
                            Total
                        </MenuItem>
                    </TextField>
                    <div className={styles.buttonContainer}>
                        <button
                            type="button"
                            className={`button ${styles.buttonCancel}`}
                            onClick={setModalClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`button ${styles.buttonFinish}`}
                            disabled={selectedProduct=="" || amount <= 0}
                        >
                            Agregar
                        </button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};

export default AddRecipeItemModal;