"use client";
import dynamic from "next/dynamic";

const RetirarStock = dynamic(() => import("./retirarStock"), {
  ssr: false, // ⛔ Impide que Next intente prerenderizar
});

export default function Page() {
  return <RetirarStock />;
}
