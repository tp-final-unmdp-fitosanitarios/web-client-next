import styles from "./MenuBar.module.scss" 
import Image from "next/image"
import SideBar from "../sideBar/SideBar"
import pampaGrowLogo from "../../../public/PampaGrow.png"

export default function MenuBar () {

    const date: Date = new Date()
    const dateWithoutTime: string = date.toLocaleDateString();

    return(
        <>
        <div className={styles.header}>
            <SideBar />
            <Image className={styles.homeLogo} src={pampaGrowLogo} alt="Home Logo"/>
            <h4 className={styles.homeDate}>{dateWithoutTime}</h4>
        </div>
        <hr className={styles.homeDivision}></hr>
        </>
    )
}