"use client"; // Indicamos que el componente se ejecuta en el cliente

import { useEffect, useState } from "react";
import { User } from "@/domain/models/User";
import { Roles } from "@/domain/enum/Roles";
import HomepageJerarquico from "../../../components/homepageJerarquico/HomepageJerarquico";
import HomepageAplicador from "@/components/homepageAplicador/HomepageAplicador";

export default function Home() {
      
  const [user, setUser] = useState<User | null>(null)


  const buttons = [
    { label: "Productos", path: "/productos" },
    { label: "Stock", path: "/stock" },
  ];

  if (user && user.rol === Roles.Admin) {
    buttons.push(
      { label: "Personal", path: "/personal" },
      { label: "Maquinas", path: "/maquinas" },
      { label: "Estadísticas", path: "/estadisticas" }
    );
  }

  function fetchUser(): Promise<User> {

    return new Promise<User>((resolve) => {
      const response: User = { id: 1, nombre: "Rosario Hernandez", rol: Roles.Admin }
      const response2: User = {id:2,nombre: "Jeremias Savarino",rol: Roles.Aplicador}
      console.log(response);
      setTimeout(() => resolve(response2), 1000)
    })

  }

  useEffect(() => {
    fetchUser()
      .then((user) => { setUser(user) })
  }, [])

  if (!user)
    return (<h3>Loading...</h3>)

  return user.rol === Roles.Admin || user.rol === Roles.Encargado ? <HomepageJerarquico user={user} buttons={buttons} /> : <HomepageAplicador user={user} />
}
