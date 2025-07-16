"use client";
import dynamic from "next/dynamic";

const MoverStock = dynamic(() => import("./moverStock"), {
  ssr: false, // ⛔ Impide que Next intente prerenderizar
});

export default function Page() {
  return <MoverStock />;
}
