"use client";  

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


export default function HomepageJerarquico({ user,buttons }: homePageProps) {

  return (
    <>
      <div className={styles.homeContainer}>
        <MenuBar  showMenu={true }/>
        <h1 className={styles.homeTitle} >Bienvenido/a</h1>
        <h1 className={styles.homeTitle} >{user.first_name+" "+user.last_name}</h1>
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
    
    </>
  );
}
