import styles from "./menuBarPestañas.module.scss" 
import Image from "next/image"
import SideBar from "../sideBar/SideBar"
import eppMarca from "../../../public/Marca_Verde.png"

interface MenuBarPestañasProps{
    pestañaActual: string
    setPestañaPendientes: () => void;
    setPestañaEnCurso: () => void;
}
export default function MenuBarPestañas ({pestañaActual,setPestañaPendientes,setPestañaEnCurso}:MenuBarPestañasProps) {
    
    
    function handleClickPendientes(){
        setPestañaPendientes()
    }

    function handleClickEnCurso(){
        setPestañaEnCurso()
    }

    return(
        <>
        <div className={styles.header}>
            <SideBar />
            <Image className={styles.homeLogo} src={eppMarca} alt="Home Logo"/>
        </div>
        <div className={styles.pestañasContainer}>
            <button className={`button ${styles.pestaña} ${pestañaActual==="pendientes"?styles.pestañaActual:styles.pestañaNoSeleccionada}`} onClick={handleClickPendientes}>Pendientes</button>
            <button className={`button ${styles.pestaña} ${pestañaActual==="enCurso"?styles.pestañaActual:styles.pestañaNoSeleccionada}`} onClick={handleClickEnCurso}>En curso</button>
        </div>
        <hr className={styles.homeDivision}></hr>
        </>
    )
}