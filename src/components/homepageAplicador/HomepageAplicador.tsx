import styles from "./homepageAplicador.module.scss"
import MenuBarPestañas from "../menuBarPestañas/MenuBarPestañas"
import { User } from "@/domain/models/User"
import Link from "next/link"
import { useState } from "react"
import ContenedorDeAplicaciones from "../contenedorDeAplicaciones/ContenedorDeAplicaciones"

interface homepageProps {
    user: User
}

export default function HomepageAplicador({user}:homepageProps) {
    const [pestañaActual,setPestañaActual] = useState<string>("pendientes")

    function setPestañaPendientes() {
        setPestañaActual("pendientes")
    }
    function setPestañaEnCurso() {
        setPestañaActual("enCurso")
    }
    
    return (
        <>
        <div className={styles.homeContainer}>
            <MenuBarPestañas pestañaActual={pestañaActual} setPestañaPendientes={setPestañaPendientes} setPestañaEnCurso={setPestañaEnCurso}/>
            <h1>Bienvenido/a</h1>
            <h1>{user.nombre}</h1>
            <ContenedorDeAplicaciones pestañaActual={pestañaActual}/>
            <div className={styles.buttonContainer}>
                <Link href="/productos">
                    <button className={`button button-primary ${styles.buttonHome}`}>Iniciar Aplicacion</button>
                </Link>
            </div>
        </div>
        </>
    )
}