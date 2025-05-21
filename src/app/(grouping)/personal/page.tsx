'use client';

import { useState, useEffect } from 'react';
import { User } from '@/domain/user/User';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useLoading } from '@/hooks/useLoading';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import styles from './personal.module.scss';
import ItemList from '@/components/itemList/ItemList';
import { transformToItems } from '@/utilities/transform';
import Link from 'next/link';
import { useItemsManager } from '@/hooks/useItemsManager';
import GenericModal from '@/components/modal/GenericModal';

interface UsersResponse {
    users: User[];
}

const roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'ENGINEER', label: 'Encargado' },
    { value: 'APPLICATOR', label: 'Aplicador' },
];

export default function PersonalPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const { getApiService } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();

    const {
        items: usuarios,
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager<User>(filteredUsers);

    useEffect(() => {
        let isMounted = true;
        const fetchUsers = async () => {
            try {
                const response = await withLoading(
                    apiService.get<UsersResponse>('/users'),
                    'Cargando usuarios...'
                );
                if (response.success && isMounted) {
                    setUsers(response.data.users || []);
                    setFilteredUsers(response.data.users || []);
                } else if (isMounted) {
                    setError(response.error || 'Error al obtener los usuarios');
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching users:', error);
                    setError('Error al conectar con el servidor');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (selectedRole) {
            setFilteredUsers(users.filter(user => user.roles.includes(selectedRole)));
        } else {
            setFilteredUsers(users);
        }
    }, [selectedRole, users]);

    const handleQuitarItems = async () => {
        try {
            const deleteResults = await Promise.all(
                selectedIds.map(async (id) => {
                    const response = await apiService.delete("users", id);
                    return response.success;
                })
            );
    
            const allDeleted = deleteResults.every((success) => success);
    
            if (allDeleted) {
                quitarItems(); // Esto actualiza los usuarios visibles y muestra la modal
            } else {
                alert("Algunos usuarios no pudieron ser eliminados.");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    const items = usuarios && usuarios.length > 0
        ? transformToItems(usuarios, "id", ["first_name", "last_name", "email", "roles"]).map((item) => {
            return {
                ...item,
                display: `${item.first_name} ${item.last_name} - ${item.email} (${item.roles[0] || 'Sin rol'})`,
            };
        })
        : [];

    const campos = ["display"];

    const modalText =
        deletedItems.length > 0
            ? `Se han eliminado los siguientes usuarios:\n${deletedItems.map((u) => `${u.first_name} ${u.last_name}`).join("\n")}`
            : "";

    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div>Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={true} path="" />
                <h1 className={styles.title}>Gestion de Personal</h1>

                <div className={styles.content}>
                    <div className={styles.filterContainer}>
                        <select
                            className={styles.roleFilter}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">Todos los roles</option>
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {items.length > 0 ? (
                        <ItemList
                            items={items}
                            displayKeys={campos}
                            onSelect={toggleSelectItem}
                            selectedIds={selectedIds}
                            selectItems={true}
                            deleteItems={true}
                            selectSingleItem={false}
                        />
                    ) : (
                        <p>No hay usuarios disponibles</p>
                    )}

                    <div className={styles.buttonContainer}>
                        {selectedIds.length > 0 && (
                            <button
                                className={`button button-secondary`}
                                onClick={handleQuitarItems}
                            >
                                Quitar
                            </button>
                        )}
                        <Link href="/personal/agregar">
                            <button className={`button button-primary `}>
                                Agregar
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
            <GenericModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Usuarios Eliminados"
                modalText={modalText}
                buttonTitle="Cerrar"
                showSecondButton={false}
            />
        </div>
    );
} 