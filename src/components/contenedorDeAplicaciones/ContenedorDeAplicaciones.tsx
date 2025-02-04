import { Aplicacion } from "@/domain/models/Aplicacion"
import { useEffect, useState } from "react"
import { Producto } from "@/domain/models/Producto"
import { Locacion } from "@/domain/models/Locacion"
import { Unidad } from "@/domain/enum/Unidad"
import { TipoLocacion } from "@/domain/enum/TipoLocacion"
import { EstadoAplicacion } from "../../domain/enum/EstadoAplicacion"
import TablaAplicaciones from "../tablaAplicaciones/TablaAplicaciones"

interface containerProps {
    pestañaActual: string;
}

export default function contenedorDeAplicaciones ({pestañaActual}: containerProps) {
    const [aplicaciones,setAplicaciones] = useState<Aplicacion[]>([])
    const [filteredAps, setFilteredAps] = useState<Aplicacion[]>([])

    function fetchAplicaciones (): Promise<Aplicacion[]> {

    return new Promise<Aplicacion[]>( (resolve,reject) => {
        const productos: Producto[] = [
            { id: 1, nombre: "Fertilizante A", unidad: Unidad.Kilogramos, cantidad: 50, marca: "AgroFert", descripcion: "Fertilizante orgánico" },
            { id: 2, nombre: "Herbicida X", unidad: Unidad.Litros, cantidad: 20, marca: "HerbiTech", descripcion: "Herbicida selectivo" },
            { id: 3, nombre: "Insecticida Z", unidad: Unidad.Litros, cantidad: 10, marca: "InsecGuard", descripcion: "Protección contra plagas" },
            { id: 4, nombre: "Fungicida Y", unidad: Unidad.Kilogramos, cantidad: 30, marca: "FungiStop", descripcion: "Prevención de hongos" }
          ];
          
          const locaciones: Locacion[] = [
            { id: 1, direccion: "Ruta 8, Km 210", superficie: "50 hectáreas", tipo: TipoLocacion.Campo },
            { id: 2, direccion: "Av. Central 123", superficie: "1000 m2", tipo: TipoLocacion.Deposito },
            { id: 3, direccion: "Camino Rural 45", superficie: "30 hectáreas", tipo: TipoLocacion.Campo },
            { id: 4, direccion: "Parque Industrial 12", superficie: "500 m2", tipo: TipoLocacion.Deposito }
          ];
        
        const response: Aplicacion[] = [
            {id:1, campo: locaciones[0], producto: productos[0],unidad: Unidad.Kilogramos, cantidad: 30,estado: EstadoAplicacion.EnCurso, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:2, campo: locaciones[1], producto: productos[2],unidad: Unidad.Litros, cantidad: 15,estado: EstadoAplicacion.EnCurso, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:3, campo: locaciones[2], producto: productos[1],unidad: Unidad.Kilogramos, cantidad:60, estado: EstadoAplicacion.Pendiente, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:4, campo: locaciones[1], producto: productos[1],unidad: Unidad.Litros, cantidad: 7,estado: EstadoAplicacion.EnCurso, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:5, campo: locaciones[2], producto: productos[2],unidad: Unidad.Kilogramos, cantidad:18, estado: EstadoAplicacion.Pendiente, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:6, campo: locaciones[3], producto: productos[3],unidad: Unidad.Litros, cantidad: 12,estado: EstadoAplicacion.EnCurso, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:7, campo: locaciones[0], producto: productos[0],unidad: Unidad.Kilogramos, cantidad:13, estado: EstadoAplicacion.Pendiente, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:8, campo: locaciones[1], producto: productos[3],unidad: Unidad.Litros, cantidad: 5,estado: EstadoAplicacion.EnCurso, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:9, campo: locaciones[2], producto: productos[2],unidad: Unidad.Kilogramos, cantidad:31, estado: EstadoAplicacion.Pendiente, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
            {id:10, campo: locaciones[3], producto: productos[3],unidad: Unidad.Litros, cantidad: 10,estado: EstadoAplicacion.EnCurso, fecha:new Date(Date.now() - Math.floor(Math.random() * 10000000000))},
        ]
    
        setTimeout( () => resolve(response), 1000)
    })

}

useEffect( () => {
    fetchAplicaciones()
        .then( (aplicaciones) => {
            setAplicaciones(aplicaciones)
            setFilteredAps(aplicaciones.filter(e=>e.estado===EstadoAplicacion.Pendiente))
        })
    },[])

useEffect( () => {
    if(pestañaActual==="pendientes")
        setFilteredAps(aplicaciones.filter(e=>e.estado===EstadoAplicacion.Pendiente))
    else
        setFilteredAps(aplicaciones.filter(e=>e.estado===EstadoAplicacion.EnCurso))
    },[pestañaActual])

return(
    <TablaAplicaciones aplicaciones={filteredAps} pestañaActual={pestañaActual}/>
)

}