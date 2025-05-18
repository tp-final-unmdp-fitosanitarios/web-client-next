import React from 'react';
import styles from './ModalConfirmacionEliminacion.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text?: string;
}

const ModalConfirmacionEliminacion: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, text }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Confirmar Eliminación</h2>
        <p className={styles.message}>{ text ? `¿Está seguro que desea eliminar ${text}?` : `¿Está seguro que desea eliminar este elemento?`}</p>
        <div className={styles.buttonContainer}>
          <button 
            className={`button button-secondary ${styles.buttonCancel}`} 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={`button button-primary ${styles.buttonConfirm}`} 
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionEliminacion;