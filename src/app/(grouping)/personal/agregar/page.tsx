'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Auth/AuthProvider';
import Formulario from '@/components/formulario/formulario';
import GenericModal from '@/components/modal/GenericModal';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import { Field } from '@/domain/models/Field';
import styles from './agregarUsuario.module.scss';
import { User } from '@/domain/user/User';

interface CreateUserResponse {
  user: User;
}

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ENGINEER', label: 'Encargado' },
  { value: 'APPLICATOR', label: 'Aplicador' },
];

export default function AgregarUsuarioPage() { // to do parece que estoy mandando mal el payload
  const title = 'Agregar Usuario';
  const router = useRouter();
  const { getApiService } = useAuth();
  const apiService = getApiService();
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<User>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    roles: [],
    company_id: '',
  });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleFormSubmit = async (inputData: Record<string, string | string[]>) => {
    const payload = {
      user: {
        first_name: String(inputData.first_name),
        last_name: String(inputData.last_name),
        email: String(inputData.email),
        roles: Array.isArray(inputData.roles) ? inputData.roles : [String(inputData.roles)],
      },
      password: String(inputData.password),
    };

    try {
      const response = await apiService.create<CreateUserResponse>('/users', payload);
      if (response.success) {
        setNewUser(response.data.user);
        handleOpenModal();
        router.push('/personal');
      } else {
        console.error('Error al crear el usuario:', response.error);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleCancel = () => {
    router.push('/personal');
  };

  const isFormValid = (formData: Record<string, string | string[]>) => {
    return formData.first_name && 
           formData.last_name && 
           formData.email && 
           formData.password && 
           formData.roles;
  };

  const fields: Field[] = [
    {
      name: 'first_name',
      label: 'Nombre',
      type: 'text',
    },
    {
      name: 'last_name',
      label: 'Apellido',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
    },
    {
      name: 'roles',
      label: 'Rol',
      type: 'select',
      options: roles.map(role => role.value),
    },
  ];

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={true} path="/personal" />
        <h1 className={styles.title}>{title}</h1>

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
        title="Usuario añadido"
        modalText={`Se añadió el usuario: ${newUser.first_name} ${newUser.last_name}`}
        buttonTitle="Cerrar"
        showSecondButton={false}
      />
    </div>
  );
} 