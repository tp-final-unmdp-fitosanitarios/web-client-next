import styles from "./GenericModal.module.scss"

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    modalText: string;
    buttonTitle: string;
    showSecondButton?: boolean;
    secondButtonTitle?: string;
}

export default function GenericModal({ isOpen, onClose, title, modalText, buttonTitle, showSecondButton, secondButtonTitle }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles["modal-overlay"]}>
            <div className={styles["modal-content"]}>
                <h2 className="title">{title}</h2>
                <span>{modalText}</span>
                <div className="button-container">
                    <button className="button button-primary" onClick={onClose}>{buttonTitle}</button>
                    {showSecondButton && <button onClick={onClose} className="button button-secondary">{secondButtonTitle} </button>}
                </div>
            </div>
        </div >

    );
};