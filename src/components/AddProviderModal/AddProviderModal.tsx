import GenericForm from '@/components/formulario/formulario';
import styles from "./AddProviderModal.module.scss";
import { Field } from "@/domain/models/Field";

interface Props {
    open: boolean;
    setModalClose: () => void;
    saveProvider: (name: string, description: string) => void;
}

const AddProviderModal: React.FC<Props> = ({open, setModalClose,saveProvider}) => {
    
    const handleFinish = (formValues: Record<string, string>) => {
        const name = formValues["providerName"];
        const description = formValues["providerDescription"];
        saveProvider(name, description);
        setModalClose();
    }
    
    /*return (
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
                <h3 className={styles.title}>Agregar Proveedor</h3>
                <form onSubmit={handleFinish}>
                    <div className={styles.formRow}>
                        <label htmlFor="providerName" className={styles.label}>Nombre del proveedor</label>
                        <input type="text" id="providerName" name="providerName"className={styles.input} required/>
                    </div>
                    <div className={styles.formRow}>
                        <label htmlFor="providerDescription" className={styles.label}>Descripcion</label>
                        <input type="text" id="providerDescription" name="providerDescription" className={styles.input} required/>
                    </div>
                <div className={`${styles.buttonContainer}`}>
                    <button className={`button button-primary ${styles.buttonHome} ${styles.buttonCancel}`} onClick={setModalClose}> 
                        Cancelar
                    </button>
                    <button className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish}`} type="submit">
                        Guardar
                    </button>
                </div>
                </form>
                </Box>
            </Modal>
        </div>
    );*/
    const fields: Field[] = [
        {
          name: "providerName",
          label: "Nombre del proveedor",
          type: "text",
        },
        {
          name: "providerDescription",
          label: "Descripcion",
          type: "text",
        },
      ];

    return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Mover Stock</h2>
        <GenericForm fields={fields} onSubmit={handleFinish} onCancel={setModalClose} buttonName="Guardar" />
      </div>
    </div>
    );
};

export default AddProviderModal;
