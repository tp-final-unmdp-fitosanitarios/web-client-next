/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Formulario from "@/components/formulario/formulario";
import MenuBar from "@/components/menuBar/MenuBar";
import { Field } from "@/domain/models/Field";
import styles from "./login-view.module.scss";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from 'next/navigation';

// Forzar que esta página sea dinámica y no se prerenderice en el servidor
export const dynamic = "force-dynamic";

export default function Login() {
  const [errorReq, setErrorReq] = useState(false);
  const { getApiService , login, setUserId} = useAuth(); // Hook para manejar el token de autenticación
  const fields: Field[] = [
    { name: "email", label: "Nombre", type: "text" },
    { name: "password", label: "Contraseña", type: "password" }, 
  ];
  const router = useRouter(); // Hook para redirigir después del login

  const log_in = async (formData: any) => {
    const apiService = getApiService();
    try {
      const body = {
        email: formData["email"],
        password: formData["password"],
      };
      console.log(body);
      const res = await apiService.create("/auth/login", body);
      console.log(res);
      const { token, user_id } = res.data as { token: string, user_id: string };
      login(token); /// Login del provider
      setUserId(user_id);
      setErrorReq(false);
      router.push("/home"); // Redirigir a la página de inicio después del login exitoso
    } catch (e: any) {
      if (e.response?.status === 401) { 
        setErrorReq(true);
      } else {
        console.error("Error en el login:", e);
      }
    }
  };

  return (
    <>
      <MenuBar showMenu={false}showArrow={false} path="home" />
      <h1 className={styles.title}>Iniciar Sesión</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <Formulario fields={fields} onSubmit={log_in} buttonName="Ingresar" />
          {errorReq && (
            <p className={styles.error}>Usuario y/o contraseña incorrectos.</p>
          )}
          <Link className={styles.forgot} href="/forgot">
            <span>Olvidaste tu contraseña</span>
          </Link>
        </div>
      </div>
    </>
  );
}