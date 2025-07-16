"use client";
import dynamic from "next/dynamic";

const ModificarAplicacion = dynamic(() => import("./modificarAplicacion"), {
  ssr: false, // ⛔ Impide que Next intente prerenderizar
});

export default function Page() {
  return <ModificarAplicacion />;
}
