import { useEffect } from "react";
import styles from "./GenericModal.module.scss";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  modalText: string; // String con \n separando las líneas
  buttonTitle: string;
  showSecondButton?: boolean;
  secondButtonTitle?: string;
  autoCloseTime?: number;
}

export default function GenericModal({
  isOpen,
  onClose,
  title,
  modalText,
  buttonTitle,
  showSecondButton,
  secondButtonTitle,
  autoCloseTime,
}: ModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseTime) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTime, onClose]);

  if (!isOpen) return null;

  const lines = modalText.split("\n");
  const header = lines[0];
  const productos = lines.slice(1);

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2 className={styles["title"]}>{title}</h2>
        <div className={styles["text"]}>
          <p className={styles["message"]}>
            <strong>{header}</strong>
          </p>
          <ul className={styles["product-list"]}>
            {productos.map((producto, index) => (
              <li key={index} className={styles["product-item"]}>
                {producto}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles["button-container"]}>
          <button className={`button button-primary`} onClick={onClose}>
            {buttonTitle}
          </button>
          {showSecondButton && (
            <button onClick={onClose} className={`button button-secondary`}>
              {secondButtonTitle}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}