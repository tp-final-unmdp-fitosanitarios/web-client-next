"use client"; // Indicamos que el componente se ejecuta en el cliente

import { useEffect, useState } from "react";
import { User } from "@/domain/models/User";
import { Roles } from "@/domain/enum/Roles";
import HomepageJerarquico from "../../../components/homepageJerarquico/HomepageJerarquico";
import HomepageAplicador from "@/components/homepageAplicador/HomepageAplicador";
import { useAuth } from "@/components/Auth/AuthProvider";
import Footer from "@/components/Footer/Footer";
import { useUserStore } from "@/contexts/userStore";
import { useLoading } from "@/hooks/useLoading";

export default function Home() {
  const { setUserGlobally } = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const { getApiService, isReady, getUserId } = useAuth();
  const { withLoading } = useLoading();
  const apiService = getApiService();
  const userId = getUserId();

  const buttons = [

  ];

  useEffect(() => {
    if (isReady && userId) {
      let isMounted = true;
      const fetchUser = async () => {
        try {
          const user = await withLoading(
            apiService.get<User>(`/users/${userId}`).then(res => res.data),
            "Cargando datos del usuario..."
          );
          if (isMounted) {
            setUser(user);
            setUserGlobally(user);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error fetching user:', error);
          }
        }
      };
      fetchUser();
      return () => {
        isMounted = false;
      };
    }
  }, [isReady, userId]);

  if (!user) {
    return null; // El loader se mostrará a través del withLoading
  }

  if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Admin) {
    buttons.push(
      { label: "Personal", path: "/personal" },
      { label: "Maquinas", path: "/maquinas" },
      { label: "Estadísticas", path: "/estadisticas" },
      { label: "Productos", path: "/productos" }, 
      { label: "Stock", path: "/stock" },
      { label: "Ubicaciones", path: "/locaciones" },
    );
  }else if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Aplicador) {
    buttons.push(
      { label: "Aplicaciones", path: "/aplicaciones" },
      { label: "Stock", path: "/stock" },
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        {user.roles[0] === Roles.Admin || user.roles[0] === Roles.Encargado ? 
          <HomepageJerarquico user={user} buttons={buttons} /> : 
          <HomepageAplicador user={user} buttons={buttons} />
        }
      </div>
      <Footer />
    </div>
  );
}
