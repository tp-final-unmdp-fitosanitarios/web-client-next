"use client"; // Indicamos que el componente se ejecuta en el cliente


import { Roles } from "@/domain/enum/Roles";
import HomepageJerarquico from "../../../components/homepageJerarquico/HomepageJerarquico";
import HomepageAplicador from "@/components/homepageAplicador/HomepageAplicador";
import { useUser } from "@/hooks/useUser";
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading} = useUser();
  const { hideLoader } = useLoading();

useEffect(() => {
  if (user && !isLoading) {
    hideLoader(); // Apagar el loader cuando ya cargó todo
  }
}, [user, isLoading]);

  // Mostrar loader mientras se carga el usuario o si no está autenticado
  if(isLoading || !user)
    return null;

  const buttons = [];

  // Determinar botones según el rol del usuario
  if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Admin) {
    buttons.push(
      { label: "Personal", path: "/personal", disabled:false },
      { label: "Maquinas", path: "/maquinas", disabled:false },
      { label: "Estadísticas", path: "/estadisticas", disabled:false },
      { label: "Productos", path: "/productos", disabled:false }, 
      { label: "Stock", path: "/stock", disabled:false },
      { label: "Ubicaciones", path: "/locaciones", disabled:false },
      { label: "Cultivos", path: "/cultivos", disabled:false },
    );
  } else if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Aplicador) {
    buttons.push(
      { label: "Aplicaciones", path: "/aplicaciones", disabled:false },
      { label: "Stock", path: "/stock", disabled:false },
      { label: "Cultivos", path: "/cultivos", disabled:false },
    );
  } else {
    buttons.push(
      { label: "Aplicaciones", path: "/aplicaciones", disabled:false },
      { label: "Stock", path: "/stock", disabled:false },
      { label: "Estadísticas", path: "/estadisticas", disabled:false }
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
