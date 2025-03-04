"use client";  //Indicamos que el componente se ejecuta en el cliente

import Link from "next/link";
import styles from "./homepageJerarquico.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { User } from "@/domain/models/User";


interface ButtonConfig {
  label: string;
  path: string;
}

interface homePageProps {
  user: User,
  buttons: ButtonConfig[];
}


export default function HomepageJerarquico({ user, buttons }: homePageProps) {

  return (
    <>
      <div className={styles.homeContainer}>
        <MenuBar />
        <h1>Bienvenido/a</h1>
        <h1>{user.nombre}</h1>
        <div className={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <Link key={index} href={button.path}>
              <button className={`button button-primary ${styles.buttonHome}`}>
                {button.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
      <div>

      </div>
    </>
  );
}
