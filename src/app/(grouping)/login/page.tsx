/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Formulario from "@/components/formulario/formulario";
import MenuBar from "@/components/menuBar/MenuBar";
import { Field } from "@/domain/models/Field";
import styles from "./login-view.module.scss";
import Link from "next/link";
import { useState } from "react";
import { apiService } from "@/services/api-service";
import useToken from "@/services/tokenService";

export default function Login() {
  const [errorReq, setErrorReq] = useState(false);
  const { token, setToken } = useToken();

  const fields: Field[] = [
    { name: "email", label: "Nombre", type: "text" },
    { name: "password", label: "Contraseña", type: "password" }, 
  ];

  const login = async (formData: any) => {
    try {
      const body = {
        email: formData["email"],
        password: formData["password"],
      };
      const res = await apiService.create("/auth/login", body);
      const { token } = res.data as { token: string };
      setToken(token);
      setErrorReq(false);
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
      <MenuBar showMenu={false} path="home" />
      <h1 className={styles.title}>Login</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <Formulario fields={fields} onSubmit={login} buttonName="Ingresar" />
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