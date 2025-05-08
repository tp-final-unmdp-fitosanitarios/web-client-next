"use client"; // Indicamos que el componente se ejecuta en el cliente

import { useEffect, useState } from "react";
import { User } from "@/domain/models/User";
import { Roles } from "@/domain/enum/Roles";
import HomepageJerarquico from "../../../components/homepageJerarquico/HomepageJerarquico";
import HomepageAplicador from "@/components/homepageAplicador/HomepageAplicador";
import { useAuth } from "@/components/Auth/AuthProvider";
import Footer from "@/components/Footer/Footer";
import { useUserStore } from "@/contexts/userStore";

export default function Home() {

  const { setUserGlobally } = useUserStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true);
  const { getApiService, isReady, getUserId } = useAuth();
  const apiService = getApiService();
  const userId = getUserId();

  const buttons = [
    { label: "Productos", path: "/productos" },
    { label: "Stock", path: "/stock" },
  ];

 useEffect(() => {
    if (isReady && userId) {
      fetchUser().then(user => {
        setUser(user);
        setUserGlobally(user);
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching user:', error);
        setLoading(false);
      });
    }
  }, [isReady, userId]);

  console.log(userId);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Admin) {
    buttons.push(
      { label: "Personal", path: "/personal" },
      { label: "Maquinas", path: "/maquinas" },
      { label: "Estadísticas", path: "/estadisticas" },
    );
  }

  async function fetchUser(): Promise<User> {
   const res = await apiService.get<User>(`/users/${userId}`)

   return res.data
  }

  if (!user)
    return (<h3>Loading...</h3>)

  return (
    <div className="page-container">
      <div className="content-wrap">
        {user.roles[0] === Roles.Admin || user.roles[0] === Roles.Encargado ? <HomepageJerarquico user={user} buttons={buttons} /> : <HomepageAplicador user={user} />}
      </div>
      <Footer />
    </div>
  )
}
