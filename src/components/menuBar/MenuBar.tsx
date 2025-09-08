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
import { useAuth } from "../../components/Auth/AuthProvider";
import Link from "next/link";

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
  const { isOnline } = useAuth();

  /* const [isOnline, setIsOnline] = useState(true);
 
   const updateOnlineStatus = () => {
     if (typeof navigator !== "undefined") {
       setIsOnline(navigator.onLine);
     }
   };
 
   useEffect(() => {
     
     window.addEventListener("online", updateOnlineStatus);
     window.addEventListener("offline", updateOnlineStatus);
 
     updateOnlineStatus();
 
     return () => {
       window.removeEventListener("online", updateOnlineStatus);
       window.removeEventListener("offline", updateOnlineStatus);
     };
   }, []);*/

  function handleBackClick() {
    if (!showMenu && path) {
      showLoader("Cargando...");
      router.push(path);
    }
  }

  //updateOnlineStatus();

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
        <Link href="/home" passHref>
          <Image className={styles.homeLogo} src={eppMarca} alt="Home Logo" />
        </Link>

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