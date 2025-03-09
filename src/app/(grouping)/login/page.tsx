"use client";

import Formulario from "@/components/formulario/formulario";
import MenuBar from "@/components/menuBar/MenuBar";
import { Field } from "@/domain/models/Field";
import styles from "./login-view.module.scss"
import Link from "next/link";

export default function Login() {

    const fields: Field[] = [{ name: "userName", label: "Nombre", type: "text" }, { name: "password", label: "Contraseña", type: "text" }];

    return (<><MenuBar showMenu={false} path='home' />
        <h1 className={styles.title}>Login</h1>
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Formulario fields={fields} onSubmit={() => { }} buttonName="Ingresar" />
                <Link  className= {styles.forgot} href="/forgot">
                    <span > Olvidaste tu contraseña </span>
                </Link>
            </div>

        </div></>)
}