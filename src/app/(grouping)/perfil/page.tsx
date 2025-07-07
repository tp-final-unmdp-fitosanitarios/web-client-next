'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useUser } from '@/hooks/useUser';
import Formulario from '@/components/formulario/formulario';
import GenericModal from '@/components/modal/GenericModal';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import { Field } from '@/domain/models/Field';
import { User } from '@/domain/user/User';
import styles from './perfil.module.scss';
import { Roles } from '@/domain/enum/Roles';

interface UpdateUserResponse {
  user: User;
}

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ENGINEER', label: 'Encargado' },
  { value: 'APPLICATOR', label: 'Aplicador' },
];

export default function PerfilPage() {
  const title = 'Mi Perfil';
  const router = useRouter();
  const { getApiService } = useAuth();
  const { user, isLoading, login} = useUser();
  const apiService = getApiService();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleFormSubmit = async (inputData: Record<string, string | string[]>) => {
    const payload = {
      user: {
        id: currentUser?.id || '',
        first_name: String(inputData.first_name),
        last_name: String(inputData.last_name),
        email: String(inputData.email),
        phone_number: String(inputData.phone_number || ''),
        chat_id: String(inputData.chat_id || ''),
        telegram_id: String(inputData.telegram_id || ''),
        roles: currentUser?.roles || [],
        company_id: currentUser?.company_id || ''
      }
    };

    try {
      const response = await apiService.update<UpdateUserResponse>('users', currentUser?.id || '', payload.user);
      
      if (response.success && response.status === 200) {
        handleOpenModal();

        const user = await apiService.get<User>('users', currentUser?.id || '');
        setCurrentUser(user.data);
        login(localStorage.getItem("token") || "",localStorage.getItem("userId") || "", user.data);
      } else {
        const errorMessage = response.error || 'Error desconocido al actualizar el perfil';
        alert(`Error al actualizar el perfil: ${errorMessage}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar el perfil: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    router.push('/home');
  };

  const isFormValid = (formData: Record<string, string | string[]>) => {
    return formData.first_name && 
           formData.last_name && 
           formData.email;
  };

  const fields: Field[] = [
    {
      name: 'first_name',
      label: 'Nombre',
      type: 'text',
      defaultValue: currentUser?.first_name || '',
      required: true
    },
    {
      name: 'last_name',
      label: 'Apellido',
      type: 'text',
      defaultValue: currentUser?.last_name || '',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      defaultValue: currentUser?.email || '',
      required: true
    },
    /*{
      name: 'phone_number',
      label: 'Número de teléfono',
      type: 'text',
      defaultValue: currentUser?.phone_number || ''
    },
    {
      name: 'chat_id',
      label: 'ID de Chat',
      type: 'text',
      defaultValue: currentUser?.chat_id || ''
    },
    {
      name: 'telegram_id',
      label: 'ID de Telegram',
      type: 'text',
      defaultValue: currentUser?.telegram_id || ''
    }*/
  ];

  if (isLoading) {
    return (
      <div className="page-container">
        <MenuBar showMenu={true} path="/home" />
        <div>Cargando perfil...</div>
      </div>
    );
  }

  var rol = currentUser?.roles?.[0] || 'Sin rol asignado';
  if(rol === Roles.Encargado)
    rol = "Encargado";
  else if(rol === Roles.Aplicador)
    rol = "Aplicador";
  else if(rol === Roles.Admin)
    rol = "Administrador";

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={true} path="/home" />
        <h1 className={styles.title}>{title}</h1>
        
        <div className={styles.content}>
            <div className={styles.profileInfo}>
            <div className={styles.userCard}>
                <div className={styles.avatar}>
                {currentUser?.first_name?.charAt(0)?.toUpperCase()}{currentUser?.last_name?.charAt(0)?.toUpperCase()}
                </div>
                <div className={styles.userDetails}>
                <h2>{currentUser?.first_name} {currentUser?.last_name}</h2>
                <p className={styles.email}>{currentUser?.email}</p>
                <p className={styles.role}>Rol: {rol}</p>
                </div>
            </div>
            </div>

            <div className={styles.editSection}>
            <h3 className={styles.sectionTitle}>Editar Información Personal</h3>
            <Formulario
                fields={fields}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                buttonName="Guardar Cambios"
                equalButtonWidth={true}
                isSubmitDisabled={(formData) => !isFormValid(formData)}
            />
            </div>

            <div className={styles.passwordSection}>
            <h3 className={styles.sectionTitle}>Seguridad</h3>
            <div className={styles.passwordCard}>
                <div className={styles.passwordInfo}>
                <h4>Contraseña</h4>
                <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
                </div>
                <button 
                className={styles.passwordButton}
                onClick={() => router.push('/perfil/cambiar-password')}
                >
                Cambiar Contraseña
                </button>
            </div>
            </div>
        </div>
      </div>
      <Footer />
      <GenericModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Perfil actualizado"
        modalText="Tu perfil ha sido actualizado correctamente"
        buttonTitle="Aceptar"
        showSecondButton={false}
        autoCloseTime={3000}
      />
    </div>
  );
} 