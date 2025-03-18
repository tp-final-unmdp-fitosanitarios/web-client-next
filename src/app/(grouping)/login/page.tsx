"use client";

import Formulario from "@/components/formulario/formulario";
import MenuBar from "@/components/menuBar/MenuBar";
import { Field } from "@/domain/models/Field";
import styles from "./login-view.module.scss"
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { error } from "console";
//axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';
//axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

export default function Login() {
const [errorReq,setErrorReq] = useState(false)

    const fields: Field[] = [
        { name: "email", label: "Nombre", type: "text" },
        { name: "password", label: "Contraseña", type: "text" }];

    const login = async (formData: any) => {
        try{
        const res = await axios.post(
            "http://localhost:8080/auth/login",
            {
                email: formData["email"],
                password: formData["password"]
            }
        )
        setErrorReq(false)
        }catch(e: any){
            if(e.status === 401)
                setErrorReq(true)
        }
        
    }

    return (<><MenuBar showMenu={false} path='home' />
        <h1 className={styles.title}>Login</h1>
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Formulario fields={fields} onSubmit={login} buttonName="Ingresar" />
                {errorReq ? <p className={styles.error}>Usuario y/o contraseña incorrectos.</p> : null}
                <Link  className= {styles.forgot} href="/forgot">
                    <span > Olvidaste tu contraseña </span>
                </Link>
            </div>

        </div></>)
}