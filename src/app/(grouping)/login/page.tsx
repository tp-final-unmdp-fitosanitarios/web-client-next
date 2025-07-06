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
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";

// Forzar que esta página sea dinámica y no se prerenderice en el servidor
export const dynamic = "force-dynamic";

export default function Login() {
  const [errorReq, setErrorReq] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { getApiService, login } = useAuth();
  const { withLoading, showLoader } = useLoading();
  const fields: Field[] = [
    { name: "email", label: "Nombre", type: "text" },
    { name: "password", label: "Contraseña", type: "password" }, 
  ];
  const router = useRouter();

  const log_in = async (formData: any) => {
    const apiService = getApiService();
    try {
      const body = {
        email: formData["email"],
        password: formData["password"],
      };
      
      const res = await withLoading(
        apiService.create("/auth/login", body),
        "Iniciando sesión..."
      );

      if (!res.success) {
        if (res.status === 401) {
          setErrorReq(true);
          setErrorMessage("Credenciales inválidas. Por favor verifica tu email y contraseña.");
        } else {
          setErrorReq(true);
          setErrorMessage("Ocurrió un error. Por favor intenta nuevamente.");
        }
        return;
      }

      const { token, user_id } = res.data as { token: string, user_id: string };
      login(token, user_id);
      setErrorReq(false);
      
      // Mantener el loader durante la navegación
      showLoader("Cargando página principal...");
      router.push("/home");
    } catch (e: any) {
        console.error("Error en el login:", e);
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={false} showArrow={false} path="home" />
        <div className={styles.container}>
          <h1 className={styles.title}>Iniciar Sesión</h1>
          <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
              <Formulario fields={fields} onSubmit={log_in} buttonName="Ingresar" />
              {errorReq && (
                <p className={styles.error}>{errorMessage}</p>
              )}
              <Link className={styles.forgot} href="/forgot">
                <span>Olvidaste tu contraseña</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}