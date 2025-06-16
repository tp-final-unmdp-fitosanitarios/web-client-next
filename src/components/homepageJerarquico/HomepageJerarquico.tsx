"use client";  

import NavigationLink from "@/components/NavigationLink/NavigationLink";
import styles from "./homepageJerarquico.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { User } from "@/domain/models/User";

interface ButtonConfig {
  label: string;
  path: string;
}

interface homePageProps {
  user: User;
  buttons: ButtonConfig[];
}

export default function HomepageJerarquico({ user, buttons }: homePageProps) {
  const userName = user.first_name+" "+user.last_name;

  const allButtons = [
    ...buttons,
    { label: "Consolidado", path: "/aplicaciones/consolidado" }
  ];

  return (
    <>
      <div className={styles.homeContainer}>
        <MenuBar showMenu={true}/>
        <h1 className={styles.welcomeTitle}>Bienvenido/a</h1>
        <h1 className={styles.username}>{userName}</h1>
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
  );
}
