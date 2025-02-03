"use client"; // Indicamos que el componente se ejecuta en el cliente

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import pampaGrowLogo  from "../../../../public/PampaGrow.png";
import styles from "./homepage.module.scss";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const endpoint = "health";
  const [user,setUser] = useState(null)

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

  let date: Date = new Date()
  const dateWithoutTime: string = date.toLocaleDateString();

  date = new Date()


  return (
    <div className={styles.homeContainer}>
      <Image className={styles.homeLogo} src={pampaGrowLogo} alt="Home Logo"/>
      <h3 className={styles.homeDate}>{dateWithoutTime}</h3>
      <hr className={styles.homeDivision}></hr>
      <h1>Bienvenido/a</h1>
      <h1>Rosario Hernandez</h1>
      <div className={styles.buttonContainer}>
        <Link href="/productos">
            <button className={`button button-primary ${styles.buttonHome}`}>Productos</button>
        </Link>
        <Link href="/stock">
            <button className={`button button-primary ${styles.buttonHome}`}>Stock</button>
        </Link>
        <Link href="/estadisticas">
            <button className={`button button-primary ${styles.buttonHome}`}>Estadisticas</button>
        </Link>
      </div>
      <Link href="/productos">
          <button className={`button ${styles.buttonLogOut}`}> Cerrar Sesion</button>
      </Link>
      {/*<div className="button-container">
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
      )}*/}
    </div>
  );
}
