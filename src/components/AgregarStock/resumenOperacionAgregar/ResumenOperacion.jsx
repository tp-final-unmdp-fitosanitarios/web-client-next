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

    const items = transformToItems(products, "id",["name", "quantity"]);
    const campos = ["name","quantity"]

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
                    <h3>Resumen de Operacion</h3>
                    <p>Agregara los siguientes productos y cantidades</p>
                    {products.length > 0 ? (
                            <ItemList
                                items={items}
                                displayKeys={campos}
                                onSelect={toggleSelectItem}
                                selectedIds={selectedIds}
                            />
                            ) : (
                                <p>Ocurrio un error al cargar el stock :(</p>
                            )}
                    <div className={styles.outputContainer}>
                        <h6>Locacion: {locacion}</h6>
                        <h6>Remito: {remito}</h6>
                    </div>
                    <div className={`${styles.buttonContainer}`}>
                            <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} onClick={setModalClose}> 
                                Cancelar
                            </button>
                            <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`} onClick={handleSubmit}>
                                Guardar
                            </button>
                        </div>
                </Box>
            </Modal>
        </div>
    );
};

export default ResumenOperacion;