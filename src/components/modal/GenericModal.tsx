import styles from "./GenericModal.module.scss";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  modalText: string; // String con \n separando las líneas
  buttonTitle: string;
  showSecondButton?: boolean;
  secondButtonTitle?: string;
}

export default function GenericModal({
  isOpen,
  onClose,
  title,
  modalText,
  buttonTitle,
  showSecondButton,
  secondButtonTitle,
}: ModalProps) {
  if (!isOpen) return null;


  const lines = modalText.split("\n");
  const header = lines[0]; 
  const productos = lines.slice(1); 

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2 className="title">{title}</h2>
        <div className="text">
          <p>
            <strong>{header}</strong>
          </p>
          {productos.length > 0 ? (
            productos.map((producto, index) => (
              <p key={index}><strong> {producto}</strong>.</p>
            ))
          ) : (
            <p></p>
          )}
        </div>
        <div className="button-container">
          <button className="button button-primary" onClick={onClose}>
            {buttonTitle}
          </button>
          {showSecondButton && (
            <button onClick={onClose} className="button button-secondary">
              {secondButtonTitle}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}