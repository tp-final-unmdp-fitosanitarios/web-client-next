import React, { useState } from 'react';
import { Modal, Box, TextField, Autocomplete } from '@mui/material';
import styles from "./modalAgregarProducto.module.scss"

const ModalAgregarProducto = ({open, setModalClose, products, handleAddProducto}) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalClose();
        handleAddProducto(e.target[0].value,Math.round(e.target[1].value));
    };

    const options = products.map((p) => ({ label: p.nombre+" "+p.marca }));

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
                    <h3 className={styles.title}>Agregar Producto</h3>
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
                </Box>
            </Modal>
        </div>
    );
};

export default ModalAgregarProducto;