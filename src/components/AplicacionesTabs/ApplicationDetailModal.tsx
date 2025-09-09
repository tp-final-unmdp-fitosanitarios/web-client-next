"use client";

import { Modal, Box, Typography, Button } from "@mui/material";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { Producto } from "@/domain/models/Producto";

interface ApplicationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    aplicacion: Aplicacion | null;
    productos: Producto[];
}

const estadoToLabel: Record<string, string> = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En curso",
    NEEDS_REUPLOAD: "Necesita atencion",
    FINISHED: "Finalizada"
};

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
    isOpen,
    onClose,
    aplicacion,
    productos
}) => {
    if (!aplicacion) return null;

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    const getProductName = (productId: string) => {
        //console.log("aplicacion:: ",aplicacion);
        const prod = productos.find(p => p.id === productId);
        return prod ? prod.name : productId;
    };

    const lote = aplicacion.location.parent_location.name;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="application-details-modal"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 450,
                maxWidth: {
                    xs: '80vw',
                    sm: '450px'
                },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="application-details-modal" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Detalles de la Aplicación
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Estado:</Typography>
                        <Typography>{estadoToLabel[aplicacion.status] || aplicacion.status}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Cultivo:</Typography>
                        <Typography>{aplicacion.location?.name || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Fecha de creación:</Typography>
                        <Typography>{formatDate(aplicacion.created_at)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Superficie:</Typography>
                        <Typography>{aplicacion.surface} ha</Typography>
                    </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Aplicador:</Typography>
                        <Typography>{aplicacion.applicator_name || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Ingeniero:</Typography>
                        <Typography>{aplicacion.engineer_name || 'N/A'}</Typography>
                    </Box> 
                    <Box>
                        <Typography fontWeight="bold" sx={{ mb: 1 }}>Productos aplicados:</Typography>
                        {aplicacion.recipe?.recipe_items && aplicacion.recipe.recipe_items.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {aplicacion.recipe.recipe_items.map((item, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', py: 0.5 }}>
                                        <Typography>{getProductName(item.product_id)}</Typography>
                                        <Typography>{item.amount} {item.unit} | Lote: {lote || 'N/A'}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography>No hay productos registrados</Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" 
                        onClick={onClose}
                        sx={{
                            backgroundColor: '#404e5c',
                            '&:hover': {
                                backgroundColor: '#2c363f',
                            },
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ApplicationDetailModal; 