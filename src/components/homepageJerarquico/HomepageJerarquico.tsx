"use client"; // Indicamos que el componente se ejecuta en el cliente

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./homepageJerarquico.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { User } from "@/domain/models/User";
import { Roles } from "@/domain/enum/Roles";

interface homePageProps {
    user: User
}

export default function HomepageJerarquico({user}:homePageProps) {

  return (
    <>
      <div className={styles.homeContainer}>
        <MenuBar />
        <h1>Bienvenido/a</h1>
        <h1>{user.nombre}</h1>
        <div className={styles.buttonContainer}>
          <Link href="/productos">
              <button className={`button button-primary ${styles.buttonHome}`}>Productos</button>
          </Link>
          <Link href="/stock">
              <button className={`button button-primary ${styles.buttonHome}`}>Stock</button>
          </Link>
          {user?.rol===Roles.Admin &&
          (<Link href="/estadisticas">
              <button className={`button button-primary ${styles.buttonHome}`}>Estadisticas</button>
          </Link>)}
        </div>
      </div>
    </>
  );
}

/*<div className="button-container">
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
        )}*/
