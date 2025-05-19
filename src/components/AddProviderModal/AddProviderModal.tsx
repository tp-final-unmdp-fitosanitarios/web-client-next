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
