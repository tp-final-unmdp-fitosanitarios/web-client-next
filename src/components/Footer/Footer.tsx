import React from "react";
import styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p className={styles.footerText}>
          © {currentYear}  EPP Sistema de Gestión de Agroquímicos
        </p>
        <div className={styles.footerLinks}>
        </div>
      </div>
    </footer>
  );
};

export default Footer;