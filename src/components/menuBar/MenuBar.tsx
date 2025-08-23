"use client";

import styles from "./MenuBar.module.scss";
import Image from "next/image";
import SideBar from "../sideBar/SideBar";
import eppMarca from "../../../public/Marca_Verde.png";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { useLoading } from "@/hooks/useLoading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

interface MenuBarProps {
  showMenu: boolean;
  showArrow?: boolean;
  path?: string;
}

export default function MenuBar({ showMenu, showArrow, path }: MenuBarProps) {
  const router = useRouter();
  const { showLoader } = useLoading();
  const date: Date = new Date();
  const dateWithoutTime: string = format(date, "dd/MM/yyyy", { locale: es });

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  function handleBackClick() {
    if (!showMenu && path) {
      showLoader("Cargando...");
      router.push(path);
    }
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          {showMenu ? (
            <SideBar />
          ) : (
            showArrow && (
              <button className={styles.backButton} onClick={handleBackClick}>
                <IoArrowBack className={styles.backIcon} />
              </button>
            )
          )}
        </div>
        <Image className={styles.homeLogo} src={eppMarca} alt="Home Logo" />
        <h4 className={styles.homeDate}>{dateWithoutTime}</h4>

        {/* Badge flotante (overlay, no mueve nada) */}
        {!isOnline && (
          <div className={styles.offlineBadgeWrapper}>
            <span className={styles.offlineBadge}>Sin conexión</span>
          </div>
        )}
      </div>
      <hr className={styles.homeDivision}></hr>
    </>
  );
}
