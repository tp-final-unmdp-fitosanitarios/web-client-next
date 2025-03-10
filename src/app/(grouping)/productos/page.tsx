"use client";

import Formulario from "@/components/formulario/formulario";
import { Unidad } from "@/domain/enum/Unidad";
import { Field } from "@/domain/models/Field";
import { Producto } from "@/domain/models/Producto";
import styles from "./productos-view.module.scss"
import Link from "next/link";
import GenericModal from "@/components/modal/GenericModal";
import { useState } from "react";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";

export default function AgregarProductos() { //TO-DO: spasar  Props.

    const title = 'Productos'
    
    const [productos, setProductos] = useState<any>([
        { id: 1, name: "Glifosato 48%", marca: "AgroChem SA" },
        { id: 2, name: "Clorpirifos 48%",marca: "Campo Verde Ltda" },
        { id: 3, name: "Atrazina 90%",marca: "AgroSolutions" },
        { id: 4, name: "Metomilo 40%",marca: "Fertichem" },
        { id: 5, name: "2,4-D Amina 72%",marca: "AgroBioTech" },
        { id: 6, name: "Carbendazim 50%",marca: "GreenField Agro" },
        { id: 7, name: "Paraquat 20%",marca: "RuralQuim" },
        { id: 8, name: "Cipermetrina 25%",marca: "PampaAgro" },
        { id: 9, name: "Mancozeb 80%",marca: "EcoAgro" },
        { id: 10, name: "Tebuconazol 25%",marca: "BioCrop Solutions" }
      ]); //TO-DO: Cambiar any por Producto


      const buttons = [
        { label: "Quitar", path: "/productos/quitar" },
        { label: "Agregar", path: "/productos/agregar" }
    ];
    

    return (
        <div className="page-container">
            <MenuBar showMenu={true} path='' />
            <h1 className={styles.title}>{title}</h1>

            {<ItemList items={productos} />}

            <div className={styles.buttonContainer}>
            {buttons.map((button, index) => (
                <Link key={index} href={button.path}>
                    <button className={`button button-primary ${styles.buttonHome}`}>
                        {button.label}
                    </button>
                </Link>
            ))}
            </div>
        </div>
    )


}

/*
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
    </>)*/