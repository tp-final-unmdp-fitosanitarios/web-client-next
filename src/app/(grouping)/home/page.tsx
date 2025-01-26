"use client"; // Indicamos que el componente se ejecuta en el cliente

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState(null); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const endpoint = "health";
   
  const handleFetchOnClick = async () => {
    setLoading(true);
    setError(null); 
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result); 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message); 
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <span> Home Page </span>
      <Link href="/compras">
        <button className="bg-blue-500 text-white p-2 rounded">Ir a Compras</button>
      </Link>

      <button
        onClick={handleFetchOnClick}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Obtener Datos
      </button>

   
      {loading && <p className="text-gray-500">Cargando datos...</p>}

    
      {error && <p className="text-red-500">Error: {error}</p>}

      {data && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">Datos:</h2>
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
