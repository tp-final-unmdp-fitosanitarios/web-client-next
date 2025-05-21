"use client";
import MenuBar from '@/components/menuBar/MenuBar';
import styles from './movementsPage.module.scss'; // Importar estilos
import { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from "@/components/Auth/AuthProvider";
import { ResponseItems } from '@/domain/models/ResponseItems';
import MovementDetailModal from '@/components/MovementDetailModal/MovementDetailModal';
import Footer from '@/components/Footer/Footer';
import { Producto } from '@/domain/models/Producto';
import { Locacion } from '@/domain/models/Locacion';
import { useLoading } from "@/hooks/useLoading";

interface Movement {
    id: string;
    product: Producto;
    origin: Locacion;
    destination: Locacion;
    amount: number;
    unit: string;
    created_at: string;
}

const StockMovements = () => {  //TODO: Cambiar los ids por los nombres de los producos y depositos. Evaluar cuando hacer los fetch. Anular el y-scroll.
    const [movements, setMovements] = useState<Movement[]>([]);
    const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { getApiService, isReady } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();
    let latestDate: Date | null = null;

    useEffect(() => {
        if (!isReady) return;
        
        let isMounted = true;
        const fetchMovements = async () => {
            try {
                const response = await withLoading(
                    apiService.get<ResponseItems<Movement>>('/stock/movement?size=100'),
                    "Cargando movimientos..."
                );
                if (response.success && isMounted) {
                    const movements = response.data.content;
                    movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setMovements(movements);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching movements:', error);
                }
            }
        };
        
        fetchMovements();
        return () => {
            isMounted = false;
        };
    }, [isReady]);

    const handleClickMovement = (movement: Movement) => {
        setSelectedMovement(movement);
        setSelectedId(movement.id);
        setShowDetailModal(true);
    }

    const handleDetailModalClose = () => {
        setShowDetailModal(false);
        setSelectedMovement(null);
        setSelectedId(null);
    }
    return (
        <div className="page-container">
            <div className="content-wrap">
            <MenuBar showMenu={false} showArrow={true} path="/stock" />
            <h1 className={styles.title}>Movimientos de stock</h1>
            <div className={styles.container}>
                <div className={styles.movementList}>
                {
                movements.map((movement) => {
                    if(latestDate == null || new Date(movement.created_at).toLocaleDateString() !== new Date(latestDate).toLocaleDateString()){
                        latestDate = new Date(movement.created_at)
                        return (
                            <div key={movement.id}>
                                <div className={styles.dateItem}>
                                    {new Date(movement.created_at).toLocaleDateString()}
                                </div>
                                <div 
                                    key={movement.id} 
                                    className={`${styles.item} ${selectedId === movement.id ? styles.selected : ''}`}
                                    onClick={() => handleClickMovement(movement)}
                                >
                                    <p className={styles.movementInfo}>{`${movement.product.name} - ${movement.amount} ${movement.unit}`}</p>
                                    <p className={styles.movementInfo}>{`Origen: ${movement.origin.name} - Destino: ${movement.destination.name}`}</p>
                                </div>
                            </div>
                        )
                    }
                    else
                        return (
                            <div 
                                key={movement.id} 
                                className={`${styles.item} ${selectedId === movement.id ? styles.selected : ''}`}
                                onClick={() => handleClickMovement(movement)}
                            >
                                <p className={styles.movementInfo}>{`${movement.product.name} - ${movement.amount} ${movement.unit}`}</p>
                                <p className={styles.movementInfo}>{`Origen: ${movement.origin.name} - Destino: ${movement.destination.name}`}</p>
                            </div>
                        )
                })}
                </div>
            </div>
            { showDetailModal && (
                <MovementDetailModal open={showDetailModal} setModalClose={handleDetailModalClose} movement={selectedMovement} />
            )}
            </div>
            <Footer />
        </div>
    )
}

export default StockMovements;
