"use client";

import styles from "./MenuBar.module.scss"
import Image from "next/image"
import SideBar from "../sideBar/SideBar"
import pampaGrowLogo from "../../../public/PampaGrow.png"
import eppLogo from "../../../public/Logotipo_verde.png"
import eppMarca from "../../../public/Marca_Verde.png"
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { useLoading } from '@/hooks/useLoading';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MenuBarProps {
    showMenu: boolean;
    showArrow?:boolean;
    path?: string;
}

export default function MenuBar({ showMenu, showArrow, path}: MenuBarProps) {
    const router = useRouter();
    const { showLoader } = useLoading();
    const date: Date = new Date()
    const dateWithoutTime: string = format(date, 'dd/MM/yyyy', { locale: es });

    function handleBackClick() {
        if (!showMenu && path) {
            showLoader("Cargando...");
            router.push(path);
        }
    };

    return (
        <>
        <div className={styles.header}>
            <div>
            {showMenu ? (
                <SideBar/>
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
        </div>
        <hr className={styles.homeDivision}></hr>
        </>
    )
}