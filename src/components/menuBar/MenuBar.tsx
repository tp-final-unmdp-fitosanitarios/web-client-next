"use client";

import styles from "./MenuBar.module.scss"
import Image from "next/image"
import SideBar from "../sideBar/SideBar"
import pampaGrowLogo from "../../../public/PampaGrow.png"
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';


interface MenuBarProps {
    showMenu: boolean,
    path?: string;
}


export default function MenuBar({ showMenu, path }: MenuBarProps) {
    const router = useRouter();
    const date: Date = new Date()
    const dateWithoutTime: string = date.toLocaleDateString();

    function handleBackClick() {
        if (!showMenu && path) {
            router.push(path);
        }
        return undefined;
    };

    return (
        <>
            <div className={styles.header}>
                <div>
                    {showMenu ? (
                        <SideBar />
                    ) : (
                        <button className={styles.backButton} onClick={handleBackClick}>
                            <IoArrowBack className={styles.backIcon} />
                        </button>
                    )}
                </div>
                <Image className={styles.homeLogo} src={pampaGrowLogo} alt="Home Logo" />
                <h4 className={styles.homeDate}>{dateWithoutTime}</h4>
            </div>
            <hr className={styles.homeDivision}></hr>
        </>
    )
}