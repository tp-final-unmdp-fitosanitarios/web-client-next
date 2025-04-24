"use client";
import MenuBar from '@/components/menuBar/MenuBar';
import styles from './movementsPage.module.scss'; // Importar estilos
import { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from "@/components/Auth/AuthProvider";
import { ResponseItems } from '@/domain/models/ResponseItems';
import MovementDetailModal from '@/components/MovementDetailModal/MovementDetailModal';
import Footer from '@/components/Footer/Footer';

const StockMovements = () => {  //TODO: Cambiar los ids por los nombres de los producos y depositos. Evaluar cuando hacer los fetch. Anular el y-scroll.
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [selectedMovement, setSelectedMovement] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    let latestDate: Date | null = null;

    const fetchMovements = async () => {
        try {
            const response = await apiService.get<ResponseItems<any>>('/stock/movement');
            if (response.success) {
                const movements = response.data.content
                movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setMovements(movements);
            } else {
                setError(response.error || "Error al obtener los movimientos de stock");
            }
        } catch (e) {
            setError("Error al obtener los movimientos de stock: " + e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if(isReady)
            fetchMovements();
    }, [isReady]);

    const handleClickMovement = (movement: any) => {
        setSelectedMovement(movement);
        setShowDetailModal(true);
    }

    const handleDetailModalClose = () => {
        setShowDetailModal(false);
        setSelectedMovement(null);
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
                            <>
                                <div 
                                    key={latestDate?.toString()} 
                                    className={styles.dateItem} 
                                >
                                    <h3>{latestDate?.toLocaleDateString()}</h3>
                                </div>
                                <div 
                                    key={movement.id} 
                                    className={styles.item} 
                                    onClick={() => handleClickMovement(movement)}
                                >
                                    <p className={styles.movementInfo}>{`${movement.product_id} - ${movement.amount} ${movement.unit}`}</p>
                                    <p className={styles.movementInfo}>{`Origen: ${movement.origin_id} - Destino: ${movement.destination_id}`}</p>
                                </div>
                            </>
                            )
                        }
                    else
                        return (
                            <div 
                                key={movement.id} 
                                className={styles.item} 
                                onClick={() => handleClickMovement(movement)}
                            >
                                <p className={styles.movementInfo}>{`${movement.product_id} - ${movement.amount} ${movement.unit}`}</p>
                                <p className={styles.movementInfo}>{`Origen: ${movement.origin_id} - Destino: ${movement.destination_id}`}</p>
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
