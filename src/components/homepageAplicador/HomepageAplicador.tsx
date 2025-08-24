"use client";

import styles from "./homepageAplicador.module.scss"
import { User } from "@/domain/models/User"
import NavigationLink from "../NavigationLink/NavigationLink"
import MenuBar from "../menuBar/MenuBar";
import {useAuth } from "../../components/Auth/AuthProvider";

interface ButtonConfig {
    label: string;
    path: string;
    disabled: boolean;
  }
  
  interface homePageProps {
    user: User;
    buttons: ButtonConfig[];
  }
  

export default function HomepageAplicador({user,buttons}:homePageProps) {
  const {isOnline} = useAuth();
    const userName = user.first_name+" "+user.last_name;

    const allButtons: ButtonConfig[] = [
        ...buttons,
        { label: "Consolidado", path: "/aplicaciones/consolidado", disabled: false }
    ];

    if(!isOnline){
      allButtons.forEach(b => {
        if(b.label!=="Aplicaciones")
          b.disabled = true;
      })
    }
    return (
        <>
        <div className={styles.homeContainer}>
            <MenuBar showMenu={true}/>
            <h1>Bienvenido/a</h1>
            <h1>{userName}</h1>
            <div className={styles.buttonContainer}>
          {allButtons.map((button, index) => (
            <NavigationLink key={index} href={button.path}>
              <button
                className={`button button-primary ${styles.buttonHome}`}
                disabled={button.disabled}
              >
                {button.label}
              </button>
            </NavigationLink>
          ))}
        </div>
        </div>
        </>
    )
}