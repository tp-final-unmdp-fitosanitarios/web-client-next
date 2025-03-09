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

  if (user && user.rol[0] === Roles.Admin) {
    buttons.push(
      { label: "Personal", path: "/personal" },
      { label: "Maquinas", path: "/maquinas" },
      { label: "Estadísticas", path: "/estadisticas" }
    );
  }

  function fetchUser(): Promise<User> {

    return new Promise<User>((resolve) => {
      // id: string,
      // nombre: string,
      // apellido: string,
      // rol: Roles[] | string[],
      // companyId: string,
      // email: string
      const response: User = { id: "1", nombre: "Rosario",apellido:"Hernandez", rol: [Roles.Admin] ,companyId:"1",email:"email@mail.com"}
      const response2: User = {id:"2",nombre: "Jeremias",apellido:"Savarino",rol: [Roles.Aplicador],companyId:"3",email:"email@mail.com"}
      console.log(response2);
      setTimeout(() => resolve(response), 1000)
    })

  }

  useEffect(() => {
    fetchUser()
      .then((user) => { setUser(user) })
  }, [])

  if (!user)
    return (<h3>Loading...</h3>)

  return user.rol[0] === Roles.Admin || user.rol[0] === Roles.Encargado ? <HomepageJerarquico user={user} buttons={buttons} /> : <HomepageAplicador user={user} />
}
