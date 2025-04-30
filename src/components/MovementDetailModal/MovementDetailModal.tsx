import React from 'react';
import { Modal, Box } from '@mui/material';
import styles from './MovementDetailModal.module.scss';
import ItemList from '../itemList/ItemList';

interface Props {
    open: boolean;
    setModalClose: () => void;
    movement: any;
}

const MovementDetailModal: React.FC<Props> = ({open, setModalClose, movement}) => {
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
                <h3 className={styles.title}>Resumen del Movimiento</h3>
                <div className={styles.movementContainer}>
                    <div className={styles.outputContainer}>
                        <div className={styles.dataPresentation}>
                            <h4>Origen: </h4>
                            <h4>{movement.origin.name}</h4>
                        </div>
                        <div className={styles.dataPresentation}>
                            <h4>Destino: </h4>
                            <h4>{movement.destination.name}</h4>
                        </div>
                    </div>
                    <div className={styles.productContainer}>
                        <p className={styles.message}>Se traslado el siguiente produto</p>
                        <p className={styles.message}>{movement.product.name}</p>
                    </div>
                </div>
                <div className={`${styles.buttonContainer}`}>
                        <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} onClick={setModalClose}> 
                            Volver
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default MovementDetailModal;
