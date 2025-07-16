"use client";
import dynamic from "next/dynamic";

const FinalizarAplicacion = dynamic(() => import("./finalizarAplicaciones"), {
  ssr: false, // ⛔ Impide que Next intente prerenderizar
});

export default function Page() {
  return <FinalizarAplicacion />;
}
