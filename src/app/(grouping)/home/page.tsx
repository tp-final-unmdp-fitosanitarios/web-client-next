"use client"; // Indicamos que el componente se ejecuta en el cliente


import { Roles } from "@/domain/enum/Roles";
import HomepageJerarquico from "../../../components/homepageJerarquico/HomepageJerarquico";
import HomepageAplicador from "@/components/homepageAplicador/HomepageAplicador";
import { useUser } from "@/hooks/useUser";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  const { user, isLoading} = useUser();

  // Mostrar loader mientras se carga el usuario o si no está autenticado
  if(isLoading || !user)
    return null;

  const buttons = [];

  // Determinar botones según el rol del usuario
  if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Admin) {
    buttons.push(
      { label: "Personal", path: "/personal" },
      { label: "Maquinas", path: "/maquinas" },
      { label: "Estadísticas", path: "/estadisticas" },
      { label: "Productos", path: "/productos" }, 
      { label: "Stock", path: "/stock" },
      { label: "Ubicaciones", path: "/locaciones" },
      { label: "Cultivos", path: "/cultivos" },
    );
  } else if (user && Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0] === Roles.Aplicador) {
    buttons.push(
      { label: "Aplicaciones", path: "/aplicaciones" },
      { label: "Stock", path: "/stock" },
      { label: "Cultivos", path: "/cultivos" },
    );
  } else {
    buttons.push(
      { label: "Aplicaciones", path: "/aplicaciones" },
      { label: "Stock", path: "/stock" },
      { label: "Estadísticas", path: "/estadisticas" }
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
