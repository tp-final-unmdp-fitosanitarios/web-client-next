'use client'
import ItemList from "@/components/itemList/ItemList"
import Link from "next/link";
import styles from "./maquinas-view.module.scss"
import MenuBar from "@/components/menuBar/MenuBar";

const maquinas = [
    { id: '1', name: 'Maquina 1', code: 'EPP-123' },
    { id: '2', name: 'Maquina 2', code: 'EPP-678' },
    { id: '3', name: 'Maquina 3', code: 'EPP-101' },
    { id: '4', name: 'Maquina 1', code: 'EPP-123' },
    { id: '6', name: 'Maquina 2', code: 'EPP-678' },
    { id: '37', name: 'Maquina 3', code: 'EPP-101' },
    { id: '11', name: 'Maquina 1', code: 'EPP-123' },
    { id: '22', name: 'Maquina 2', code: 'EPP-678' },
    { id: '33', name: 'Maquina 3', code: 'EPP-101' },
    { id: '222', name: 'Maquina 1', code: 'EPP-123' },
    { id: '332', name: 'Maquina 2', code: 'EPP-678' },
    { id: '313', name: 'Maquina 3', code: 'EPP-101' },


];

const buttons = [
    { label: "Quitar", path: "/maquinas/quitar" },
    { label: "Agregar", path: "/maquinas/agregar" }
];

export default function MaquinasView() {
    return (<>
        <MenuBar showMenu={false} path='home' />

        <h1 className={styles.title}>Maquinas</h1>

        {<ItemList
            items={maquinas}
        />}
        <div className={styles.buttonContainer}>
            {buttons.map((button, index) => (
                <Link key={index} href={button.path}>
                    <button className={`button button-primary ${styles.buttonHome}`}>
                        {button.label}
                    </button>
                </Link>
            ))}
        </div>
    </>)

}
