"use client";

import React from 'react';
import { Modal, Box } from '@mui/material';
import ItemList from "../itemList/ItemList"
import { transformToItems } from '@/utilities/transform';
import styles from "./resumenOpCrearAplicacion.module.scss"
import { useItemsManager } from '@/hooks/useItemsManager';
import { RecipeItem } from '@/domain/models/RecipeItem';

type RecipeItemAAgregar = RecipeItem & {
    id: string;
    prodName: string;
};
interface ResumenOpCrearAplicacionProps {
    open: boolean;
    setModalClose: () => void;
    handleFinish: () => void;
    products: RecipeItemAAgregar[];
    locacion: string;
    hectareas: number;
    fechaVencimiento: string;
}

const ResumenOpCrearAplicacion: React.FC<ResumenOpCrearAplicacionProps> = ({
    open,
    setModalClose,
    handleFinish,
    products,
    locacion,
    hectareas,
    fechaVencimiento
}) => {
    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        setModalClose();
        handleFinish();
    }

    const items = transformToItems(products, "id", ["prodName", "amount", "unit", "dose_type"]).map((item) => {
        if(item.dose_type==="SURFACE")
            return {
                ...item,
                display: `${item.prodName}: ${item.amount} ${item.unit} POR HECTAREA`
            };
        else
        return {
            ...item,
            display: `${item.prodName}: ${item.amount} ${item.unit} EN TOTAL`
        };
    });

    const campos = ["display"];

    const {
        selectedIds,
    } = useItemsManager(products);

    return (
        <Modal 
            open={open} 
            onClose={setModalClose}
            aria-labelledby="resumen-aplicacion-modal"
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
                <h3 className={styles.title}>Resumen de Aplicación</h3>
                <p className={styles.message}>Se aplicarán los siguientes productos</p>
                
                {products.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '20px' }}>
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            selectSingleItem={false}
                            selectedIds={selectedIds}
                            selectItems={false}
                            deleteItems={false}
                        />
                    </div>
                ) : (
                    <p className={styles.message}>No hay productos seleccionados</p>
                )}

                <div className={styles.outputContainer}>
                    <div className={styles.dataPresentation}>
                        <h5>Ubicación:</h5>
                        <h5>{locacion}</h5>
                    </div>
                    <div className={styles.dataPresentation}>
                        <h5>Hectáreas:</h5>
                        <h5>{hectareas}</h5>
                    </div>
                    <div className={styles.dataPresentation}>
                        <h5>Fecha de Vencimiento:</h5>
                        <h5>{fechaVencimiento}</h5>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button 
                        className={`button button-secondary ${styles.button}`} 
                        onClick={setModalClose}
                    > 
                        Cancelar
                    </button>
                    <button 
                        className={`button button-primary ${styles.button}`} 
                        onClick={handleSubmit}
                    >
                        Finalizar
                    </button>
                </div>
            </Box>
        </Modal>
    );
};

export default ResumenOpCrearAplicacion;
