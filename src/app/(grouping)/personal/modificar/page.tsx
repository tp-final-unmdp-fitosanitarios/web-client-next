"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/Auth/AuthProvider';
import Formulario from '@/components/formulario/formulario';
import GenericModal from '@/components/modal/GenericModal';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import { Field } from '@/domain/models/Field';
import { User } from '@/domain/user/User';
import styles from './modificar.module.scss';

interface EditUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone_number: string;
}

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ENGINEER', label: 'Encargado' },
  { value: 'APPLICATOR', label: 'Aplicador' },
];

export default function EditarUsuario() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();

  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isReady) return;

    const fetchUser = async () => {
      const userId = searchParams.get('Id');
      if (!userId) {
        console.error('No se encontró ID de usuario en la URL');
        // router.push('/personal');
        return;
      }

      try {
        const response = await apiService.get<User>(`/users/${userId}`);
        if (response.success) {
          setUser(response.data);
        } else {
          console.error('Error al obtener el usuario:', response.error);
          router.push('/personal');
        }
      } catch (error: any) {
        console.error('Error en la solicitud:', error.message);
        router.push('/personal');
      }
    };

    fetchUser();
  }, [isReady, searchParams]);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    router.push('/personal');
  }, []);

  const handleFormSubmit = async (inputData: Record<string, string>) => {
    const payload: EditUserPayload = {
      first_name: inputData.nombre,
      last_name: inputData.apellido,
      email: inputData.email,
      role: inputData.rol,
      phone_number :inputData.phone_number ? inputData.phone_number : ''
    };

    try {
      const response = await apiService.update<User>('/users', user?.id || '', payload);
      if (response.success) {
        setUser(response.data);
        handleOpenModal();
      } else {
        console.error('Error al actualizar el usuario:', response.error);
      }
    } catch (error: any) {
      console.error('Error en la solicitud:', error.message);
    }
  };

  const handleCancel = () => {
    router.push('/personal');
  };

  const isFormValid = useCallback((formData: Record<string, string>) => {
    return (
      formData.nombre &&
      formData.apellido &&
      formData.email &&
      formData.rol
    );
  }, []);

  const fields: Field[] = useMemo(() => [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      defaultValue: user?.first_name || '',
    },
    {
      name: 'apellido',
      label: 'Apellido',
      type: 'text',
      defaultValue: user?.last_name || '',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      defaultValue: user?.email || '',
    },
    {
      name: 'rol',
      label: 'Rol',
      type: 'select',
      options: roles.map(r => r.value),
      defaultValue: user?.roles?.[0] || '',
    },
    {
        name: 'phone_number',
        label: 'Telefono',
        type: 'text',
        defaultValue: user?.phone_number || '',
      },
  ], [user]);

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={true} path="/personal" />
        <h1 className={styles.title}>Editar Usuario</h1>

        <Formulario
          fields={fields}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          buttonName="Guardar"
          equalButtonWidth={true}
          isSubmitDisabled={(formData) => !isFormValid(formData)}
        />
      </div>

      <Footer />
      <GenericModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Usuario modificado"
        modalText={`Se modificó el usuario: ${user?.first_name} ${user?.last_name}`}
        buttonTitle="Cerrar"
        showSecondButton={false}
      />
    </div>
  );
}
