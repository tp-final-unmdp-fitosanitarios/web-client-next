"use client"; // Indicamos que el componente se ejecuta en el cliente

import { useEffect, useState } from "react";
import { User } from "@/domain/models/User";
import { Roles } from "@/domain/enum/Roles";
import HomepageJerarquico from "../../../components/homepageJerarquico/HomepageJerarquico";
import HomepageAplicador from "@/components/homepageAplicador/HomepageAplicador";

export default function Home() {
  // const [data, setData] = useState(null);
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(false);
  // const endpoint = "health";
   const [user,setUser] = useState<User | null>(null)

  // const handleFetchOnClick = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
  //     );
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const result = await response.json();
  //     setData(result);
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } catch (error: any) {
  //     setError(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  function fetchUser (): Promise<User> {

    return new Promise<User>( (resolve,reject) => {
      const response: User = {id:1,nombre:"Rosario Hernandez",rol:Roles.Encargado}
  
      setTimeout( () => resolve(response), 1000)
    })

  }

  useEffect( () => {
    fetchUser()
      .then( (user) => {setUser(user)})
  },[])

  if(!user)
    return (<h3>Loading...</h3>)

  return user.rol === Roles.Admin || user.rol === Roles.Encargado ? <HomepageJerarquico user={user}/> : <HomepageAplicador user={user}/> 
}
