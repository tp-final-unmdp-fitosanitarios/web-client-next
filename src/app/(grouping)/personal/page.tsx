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

interface UsersResponse {
    users: User[];
}

const roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'ENGINEER', label: 'Encargado' },
    { value: 'APPLICATOR', label: 'Aplicador' },
];

export default function PersonalPage() {// to do falta el delete 
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const { getApiService } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();

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

    const items = filteredUsers && filteredUsers.length > 0
        ? transformToItems(filteredUsers, "id", ["first_name", "last_name", "email", "roles"]).map((item) => {
            return {
                ...item,
                display: `${item.first_name} ${item.last_name} - ${item.email} (${item.roles[0] || 'Sin rol'})`,
            };
        })
        : [];

    const campos = ["display"];

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
            <MenuBar showMenu={true} path="" />
            <h1 className={styles.title}>Personal</h1>

            <div className="content-wrap">

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
                            selectItems={false}
                            deleteItems={false}
                            selectSingleItem={false}
                        />
                    ) : (
                        <p>No hay usuarios disponibles</p>
                    )}

                    <div className={styles.buttonContainer}>
                        <Link href="/personal/agregar">
                            <button className={`button button-primary ${styles.buttonHome}`}>
                                Agregar Usuario
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
} 