import React from 'react';
import { Modal, Box } from '@mui/material';
import ItemList from "../../itemList/ItemList"
import { transformToItems } from '@/utilities/transform';
import styles from "./resumenOperacion.module.scss"
import { useItemsManager } from '@/hooks/useItemsManager';

const ResumenOperacion = ({open, setModalClose, handleFinish, products, locacion, remito}) => {
    const handleSubmit = (e) => {
        handleFinish()
    }

    const items = transformToItems(products, "id", ["name", "size", "unit", "amount_of_units", "total_amount"]).map((item) => {
        if (item.amount_of_units !== "null") {
            return {
                ...item,
                display: `${item.name} ${item.size} ${item.unit} x ${item.amount_of_units}U`,
            };
        } else if (item.total_amount !== "null") {
            return {
                ...item,
                display: `${item.name} ${item.total_amount} ${item.unit}`,
            };
        }
        return item;
    });

    const campos = ["display"];

    const {
        selectedIds,
        toggleSelectItem,
    } = useItemsManager(products);

    return (
        <Modal 
            open={open} 
            onClose={setModalClose}
            aria-labelledby="resumen-operacion-modal"
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
                <h3 className={styles.title}>Resumen de Operación</h3>
                <p className={styles.message}>Agregará los siguientes productos y cantidades</p>
                
                {products.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '20px' }}>
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            onSelect={toggleSelectItem}
                            selectedIds={selectedIds}
                            selectItems={false}
                            deleteItems={false}
                        />
                    </div>
                ) : (
                    <p className={styles.message}>Ocurrió un error al cargar el stock :(</p>
                )}

                <div className={styles.outputContainer}>
                    <div className={styles.dataPresentation}>
                        <h5>Ubicación:</h5>
                        <h5>{locacion}</h5>
                    </div>
                    <div className={styles.dataPresentation}>
                        <h5>Remito:</h5>
                        <h5>{remito}</h5>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button 
                        className={`button ${styles.buttonCancel}`} 
                        onClick={setModalClose}
                    > 
                        Cancelar
                    </button>
                    <button 
                        className={`button ${styles.buttonFinish}`} 
                        onClick={handleSubmit}
                    >
                        Finalizar
                    </button>
                </div>
            </Box>
        </Modal>
    );
};

export default ResumenOperacion;