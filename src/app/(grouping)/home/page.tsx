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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,

      );
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
    <div className="home-container">
      <h1 className="home-title"> Home Page </h1>
      <div className="button-container">
        <Link href="/productos">
          <button className="button button-primary"> Productos</button>
        </Link>

        <button
          onClick={handleFetchOnClick}
          className="button button-secondary"
        >
          Obtener Datos
        </button>
      </div>

      {loading && <p className="text-gray-500">Cargando datos...</p>}


      {error && <p className="text-red-500">Error: {error}</p>}

      {data && (
        <div >
          <h2>Datos:</h2>
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
