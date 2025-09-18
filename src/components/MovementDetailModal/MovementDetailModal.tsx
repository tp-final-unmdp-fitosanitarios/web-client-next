"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Modal, Box } from '@mui/material';
import styles from './MovementDetailModal.module.scss';

interface Props {
    open: boolean;
    setModalClose: () => void;
    movement: any;
}

const MovementDetailModal: React.FC<Props> = ({open, setModalClose, movement}) => {
    const isForced = movement?.reason?.toLocaleLowerCase().includes('force');

     const getMovementType = () => {
        if (movement?.origin && movement?.destination) return 'Movimiento';
        if (movement?.destination && !movement?.origin) return 'Ingreso de stock';
        if (movement?.origin && !movement?.destination) return 'Retiro de stock';
        return 'Sin clasificar';
    };

    
    return (
        <Modal 
            open={open} 
            onClose={setModalClose}
            aria-labelledby="movement-detail-modal"
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
                <h3 className={styles.title}>Resumen del Movimiento</h3>
                 <h4 className={styles.subtitle}>{getMovementType()}</h4>
                
                {isForced && (
                    <div className={styles.forcedIndicator}>
                        <span className={styles.forcedText}>⚠️ MOVIMIENTO FORZADO</span>
                    </div>
                )}
                
                <div className={styles.movementContainer}>
                    <div className={styles.outputContainer}>
                        <div className={styles.dataPresentation}>
                            <h4>Origen:</h4>
                            <h4>{movement.origin ? movement.origin.name : 'N/a'}</h4>
                        </div>
                        <div className={styles.dataPresentation}>
                            <h4>Destino:</h4>
                            <h4>{movement.destination ? movement.destination.name : 'Desconocido'}</h4>
                        </div>
                           <div className={styles.dataPresentation}>
                            <h4>Fecha:</h4>
                            <h4>{new Date(movement.created_at).toLocaleDateString()}</h4>
                        </div>
                    </div>

                    <div className={styles.productContainer}>
                        <h4 className={styles.message}>Se trasladó el siguiente producto</h4>
                        <h4 className={styles.message}>{movement.product.name}</h4>
                        <h4 className={styles.message}>Cantidad: {movement.amount} {movement.product.unit}</h4>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button 
                        className={`button ${styles.buttonCancel}`} 
                        onClick={setModalClose}
                    > 
                        Volver
                    </button>
                </div>
            </Box>
        </Modal>
    );
}

export default MovementDetailModal;
