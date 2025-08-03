"use client";

// src/app/(grouping)/productos/edit/page.tsx
"use client";
import dynamic from "next/dynamic";

// Carga el componente solo en el cliente, sin intentar prerender
const EditarProducto = dynamic(() => import("./editarProductoPage"), {
  ssr: false,
});

export default function Page() {
  return <EditarProducto />;
}