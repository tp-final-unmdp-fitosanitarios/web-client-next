"use client"

import ItemList from "@/components/itemList/ItemList";
import MenuBar from "@/components/menuBar/MenuBar";
import { TipoLocacion } from "@/domain/enum/TipoLocacion";
import { Locacion } from "@/domain/models/Locacion";
import { Producto } from "@/domain/models/Producto";
import { Stock } from "@/domain/models/Stock";
import { transformToItems } from "@/utilities/transform";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from './stock-view.module.scss'

export default function StockView() { //TO-DO: spasar  Props.

    const title = 'Stock'

    const [stock, setStock] = useState<Stock[]>([]);

    function fetchStock(): Promise<[]> {
    
        return new Promise<any>((resolve) => { //Aca deberia ser un stockDTO o algo asi
            const productos : Producto[]= [
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
                    }]
            const locaciones: Locacion[] = [
                {id:1,direccion:"Yanquetruz 123",superficie: "Wot",tipo: TipoLocacion.Campo},
                {id:2,direccion:"Tres Marias 456",superficie: "Wot",tipo: TipoLocacion.Campo},   
            ]
            
          const response = [
            {id:1,ultima_modificacion: new Date,campo:locaciones[0].direccion,producto: productos[0].nombre,cantidad: 150},
            {id:2,ultima_modificacion: new Date,campo:locaciones[1].direccion,producto: productos[1].nombre,cantidad: 20},
            {id:3,ultima_modificacion: new Date,campo:locaciones[0].direccion,producto: productos[2].nombre,cantidad: 50},
            {id:4,ultima_modificacion: new Date,campo:locaciones[1].direccion,producto: productos[0].nombre,cantidad: 70},
            {id:5,ultima_modificacion: new Date,campo:locaciones[0].direccion,producto: productos[1].nombre,cantidad: 2},
          ]

          setTimeout(() => resolve(response), 500)
        })
    
      }

    useEffect(() => {
        fetchStock()
          .then((stock) => { setStock(stock) })
      }, [])

    const buttons = [
    { label: "Agregar", path: "/stock/agregar" },
    { label: "Mover", path: "/stock/mover" },
    { label: "Retirar", path: "/stock/retirar" },
    { label: "Ver Movimientos", path: "/stock/movimientos" },
    { label: "Proveedores", path: "/stock/proveedores" },
    ];

    const items = transformToItems(stock, "id",["producto", "cantidad","campo"]);
    const campos = ["producto", "cantidad","campo"];

    return (
        <div className="page-container">
            <MenuBar showMenu={true} path='' />
            <h1 className={styles.title}>{title}</h1>

            {<ItemList items={items} displayKeys={campos}/>}

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