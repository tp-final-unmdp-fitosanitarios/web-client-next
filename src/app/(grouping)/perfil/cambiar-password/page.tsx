'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Auth/AuthProvider';
import Formulario from '@/components/formulario/formulario';
import GenericModal from '@/components/modal/GenericModal';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import { Field } from '@/domain/models/Field';
import styles from './cambiarPassword.module.scss';

export default function CambiarPasswordPage() {
  const title = 'Cambiar Contraseña';
  const router = useRouter();
  const { getApiService } = useAuth();
  const apiService = getApiService();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState(false);

  const handleOpenModal = (isError: boolean = false) => {
    setModalError(isError);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  const handleFormSubmit = async (inputData: Record<string, string | string[]>) => {
    const payload = {
      currentPassword: String(inputData.current_password),
      newPassword: String(inputData.new_password),
      confirmPassword: String(inputData.confirm_password)
    };

    try {
      const response = await apiService.updateDirect('/users/change-password', payload);
      console.log('Response:', response);
      if (response.success && response.status === 200) {
        handleOpenModal(false);
        setTimeout(() => {
          router.push('/perfil');
        }, 3000);
      } else {
        const errorMessage = response.error || 'Error desconocido al cambiar la contraseña';
        alert(`Error al cambiar la contraseña: ${errorMessage}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al cambiar la contraseña: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    router.push('/perfil');
  };

  const isFormValid = (formData: Record<string, string | string[]>) => {
    const newPassword = String(formData.new_password);
    const confirmPassword = String(formData.confirm_password);
    
    return formData.current_password && 
           formData.new_password && 
           formData.confirm_password &&
           newPassword === confirmPassword &&
           newPassword.length >= 6;
  };

  const fields: Field[] = [
    {
      name: 'current_password',
      label: 'Contraseña actual',
      type: 'password'
    },
    {
      name: 'new_password',
      label: 'Nueva contraseña',
      type: 'password'
    },
    {
      name: 'confirm_password',
      label: 'Confirmar nueva contraseña',
      type: 'password'
    }
  ];

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={true} path="/perfil" />
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.content}>
            <div className={styles.passwordSection}>
            <p className={styles.description}>
                Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
            </p>
            <Formulario
                fields={fields}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                buttonName="Confirmar"
                equalButtonWidth={true}
                isSubmitDisabled={(formData) => !isFormValid(formData)}
            />
            </div>
        </div>
      </div>
      <Footer />
      <GenericModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalError ? "Error" : "Contraseña actualizada"}
        modalText={modalError ? "Hubo un error al cambiar la contraseña" : "Tu contraseña ha sido actualizada correctamente"}
        buttonTitle="Aceptar"
        showSecondButton={false}
        autoCloseTime={3000}
      />
    </div>
  );
} 