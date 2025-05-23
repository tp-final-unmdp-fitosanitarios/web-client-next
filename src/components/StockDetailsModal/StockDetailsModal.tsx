import { Modal, Box, Typography, Button } from "@mui/material";
import { Stock } from "@/domain/models/Stock";

interface StockDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stockItem: Stock | null;
}

const StockDetailsModal: React.FC<StockDetailsModalProps> = ({
    isOpen,
    onClose,
    stockItem,
}) => {
    if (!stockItem) return null;

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="stock-details-modal"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                maxWidth: {
                    xs: '250px',
                    sm: '400px'
                },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                
            }}>
                <Typography id="stock-details-modal" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Detalles del Stock
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Producto:</Typography>
                        <Typography>{stockItem.product?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Cantidad:</Typography>
                        <Typography>{stockItem.amount} {stockItem.unit}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Número de Lote:</Typography>
                        <Typography>{stockItem.lot_number || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Fecha de Vencimiento:</Typography>
                        <Typography>{formatDate(stockItem.expiration_date)}</Typography>
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

export default StockDetailsModal; 