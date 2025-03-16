"use client";
import styles from "./productos-view.module.scss"
import Link from "next/link";
import { useState } from "react";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { Producto } from "@/domain/models/Producto";
import { transformToItems } from "@/utilities/transform";

export default function AgregarProductos() { //TO-DO: spasar  Props.

    const title = 'Productos'

    const [productos] = useState<Producto[]>([
        {
            id: 1,
            nombre: "Glifosato 48%",
            unidad: "LITROS",
            cantidad: 20,
            marca: "AgroChem SA",
            descripcion: "Herbicida sistémico para el control de malezas."
        },
        {
            id: 2,
            nombre: "Clorpirifos 48%",
            unidad: "LITROS",
            cantidad: 15,
            marca: "Campo Verde Ltda",
            descripcion: "Insecticida organofosforado de amplio espectro."
        },
        {
            id: 3,
            nombre: "Atrazina 90%",
            unidad: "KILOGRAMOS",
            cantidad: 10,
            marca: "AgroSolutions",
            descripcion: "Herbicida selectivo para cultivos de maíz y sorgo."
        },
        {
            id: 4,
            nombre: "Metomilo 40%",
            unidad: "LITROS",
            cantidad: 5,
            marca: "Fertichem",
            descripcion: "Insecticida y acaricida de acción rápida."
        },
        {
            id: 5,
            nombre: "2,4-D Amina 72%",
            unidad: "LITROS",
            cantidad: 25,
            marca: "AgroBioTech",
            descripcion: "Herbicida hormonal para control de malezas de hoja ancha."
        },
        {
            id: 6,
            nombre: "Carbendazim 50%",
            unidad: "KILOGRAMOS",
            cantidad: 8,
            marca: "GreenField Agro",
            descripcion: "Fungicida sistémico para enfermedades de cultivos."
        },
        {
            id: 7,
            nombre: "Paraquat 20%",
            unidad: "LITROS",
            cantidad: 12,
            marca: "RuralQuim",
            descripcion: "Herbicida no selectivo de contacto."
        },
        {
            id: 8,
            nombre: "Cipermetrina 25%",
            unidad: "LITROS",
            cantidad: 18,
            marca: "PampaAgro",
            descripcion: "Insecticida piretroide para control de plagas."
        },
        {
            id: 9,
            nombre: "Mancozeb 80%",
            unidad: "KILOGRAMOS",
            cantidad: 15,
            marca: "EcoAgro",
            descripcion: "Fungicida protector de amplio espectro."
        },
        {
            id: 10,
            nombre: "Tebuconazol 25%",
            unidad: "LITROS",
            cantidad: 10,
            marca: "BioCrop Solutions",
            descripcion: "Fungicida sistémico para control de hongos."
        }
    ]); //TO-DO: Cambiar any por Producto


    const buttons = [
        { label: "Quitar", path: "/productos/quitar" },
        { label: "Agregar", path: "/productos/agregar" }
    ];

    const items = transformToItems(productos, "nombre", "marca");

    return (
        <div className="page-container">
            <MenuBar showMenu={true} path='' />
            <h1 className={styles.title}>{title}</h1>

            {<ItemList items={items} />}

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