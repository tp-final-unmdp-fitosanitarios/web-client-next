import React, { useState } from 'react';
import { Modal, Box, TextField, Autocomplete } from '@mui/material';
import styles from "./modalAgregarProducto.module.scss"

const ModalAgregarProducto = ({open, setModalClose, products, handleAddProducto, limite, cantActual}) => {
    const [cantidad, setCantidad] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalClose();
        handleAddProducto(e.target[0].value,Math.round(cantidad));
    };

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
                >
                    <h3 className={styles.title}>Agregar Producto {cantActual}/{limite}</h3>
                    {cantActual<limite ? (
                    <form onSubmit={handleSubmit}>
                        <Autocomplete
                            disablePortal
                            options={options}
                            renderInput={(params) => <TextField {...params} label="Producto" required/>}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Cantidad"
                            name="cantidad"
                            type='number'
                            onChange={(e) => setCantidad(e.target.value)}
                            required
                        />
                        <div className={`${styles.buttonContainer}`}>
                            <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} onClick={setModalClose}> 
                                Cancelar
                            </button>
                            <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`}>
                                Guardar
                            </button>
                        </div>
                    </form>
                    ):(
                        <p className={styles.message}>Ya completó todos los productos ingresados</p>
                    ) }
                </Box>
            </Modal>
        </div>
    );
};

export default ModalAgregarProducto;