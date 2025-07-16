"use client";
import dynamic from "next/dynamic";

const ConfirmarAplicacion = dynamic(() => import("./confirmarAplicacion"), {
  ssr: false, // ⛔ Impide que Next intente prerenderizar
});

export default function Page() {
  return <ConfirmarAplicacion />;
}
