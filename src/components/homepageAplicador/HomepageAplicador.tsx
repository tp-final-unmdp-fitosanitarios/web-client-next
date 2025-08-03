"use client";

import styles from "./homepageAplicador.module.scss"
import { User } from "@/domain/models/User"
import NavigationLink from "../NavigationLink/NavigationLink"
import MenuBar from "../menuBar/MenuBar";

interface ButtonConfig {
    label: string;
    path: string;
  }
  
  interface homePageProps {
    user: User;
    buttons: ButtonConfig[];
  }
  

export default function HomepageAplicador({user,buttons}:homePageProps) {

    const userName = user.first_name+" "+user.last_name;

    const allButtons = [
        ...buttons,
        { label: "Consolidado", path: "/aplicaciones/consolidado" }
    ];

    return (
        <>
        <div className={styles.homeContainer}>
            <MenuBar showMenu={true}/>
            <h1>Bienvenido/a</h1>
            <h1>{userName}</h1>
            <div className={styles.buttonContainer}>
          {allButtons.map((button, index) => (
            <NavigationLink key={index} href={button.path}>
              <button className={`button button-primary ${styles.buttonHome}`}>
                {button.label}
              </button>
            </NavigationLink>
          ))}
        </div>
        </div>
        </>
    )
}