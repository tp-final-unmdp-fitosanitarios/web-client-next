import React from 'react';
import { Modal, Box } from '@mui/material';
import ItemList from "../../itemList/ItemList"
import { transformToItems } from '@/utilities/transform';
import styles from "./resumenOperacion.module.scss"
import { useItemsManager } from '@/hooks/useItemsManager';

const ResumenOperacion = ({open,setModalClose,handleFinish, products, locacion, remito}) => {
    
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
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(products);

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
                    <h3 className={styles.title}>Resumen de Operación</h3>
                    <p className={styles.message}>Agregará los siguientes productos y cantidades</p>
                    {products.length > 0 ? (
                            <ItemList
                                items={items}
                                displayKeys={campos}
                                onSelect={toggleSelectItem}
                                selectedIds={selectedIds}
                                selectItems={false}
                                deleteItems={false}
                            />
                            ) : (
                                <p>Ocurrio un error al cargar el stock :(</p>
                            )}
                    <div className={styles.outputContainer}>
                        <div className={styles.dataPresentation}>
                            <h5>Locacion: </h5>
                            <h5>{locacion}</h5>
                        </div>
                        <div className={styles.dataPresentation}>
                            <h5>Remito: </h5>
                            <h5>{remito}</h5>
                        </div>
                    </div>
                    <div className={`${styles.buttonContainer}`}>
                            <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} onClick={setModalClose}> 
                                Cancelar
                            </button>
                            <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`} onClick={handleSubmit}>
                                Finalizar
                            </button>
                        </div>
                </Box>
            </Modal>
        </div>
    );
};

export default ResumenOperacion;