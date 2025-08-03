"use client";

import { Modal, Box } from "@mui/material";
import styles from "./LocationDetailsModal.module.scss";
import { Locacion } from "@/domain/models/Locacion";

const locationTypes = {
    ZONE: "Zona",
    WAREHOUSE: "Depósito",
    FIELD: "Campo",
    CROP: "Cultivo"
};

interface Props {
    open: boolean;
    onClose: () => void;
    location: Locacion | null;
}

const LocationDetailsModal: React.FC<Props> = ({ open, onClose, location }) => {
    if (!location) return null;

    const getLocalizedType = (type: string) => {
        return locationTypes[type as keyof typeof locationTypes] || type;
    };

    const getParentLocationName = () => {
        if (!location.parent_location) return null;
        if (typeof location.parent_location === 'string') return location.parent_location;
        if (typeof location.parent_location === 'object') {
            const parent = location.parent_location as { name: string };
            return parent.name;
        }
        return null;
    };

    const parentLocationName = getParentLocationName();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="location-details-modal"
        >
            <Box className={styles.modalContent}>
                <h2 className={styles.title}>Detalles de la Ubicacion</h2>
                <div className={styles.details}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Nombre:</span>
                        <span className={styles.value}>{location.name}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Tipo:</span>
                        <span className={styles.value}>{getLocalizedType(location.type)}</span>
                    </div>
                    {location.area && (
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Área:</span>
                            <span className={styles.value}>{location.area} ha</span>
                        </div>
                    )}
                    {parentLocationName && (
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Pertenece a:</span>
                            <span className={styles.value}>{parentLocationName}</span>
                        </div>
                    )}
                </div>
                <button className={`button button-primary ${styles.closeButton}`} onClick={onClose}>
                    Cerrar
                </button>
            </Box>
        </Modal>
    );
};

export default LocationDetailsModal; 