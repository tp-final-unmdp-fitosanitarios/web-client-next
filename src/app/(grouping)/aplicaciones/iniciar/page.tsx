"use client";
import dynamic from "next/dynamic";

const IniciarAplicacion = dynamic(() => import("./iniciarAplicaciones"), {
  ssr: false, // ⛔ Impide que Next intente prerenderizar
});

export default function Page() {
  return <IniciarAplicacion />;
}
