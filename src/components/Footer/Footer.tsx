import React from "react";
import styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p className={styles.footerText}>
          © {currentYear} PampaGrow. Todos los derechos reservados.
        </p>
        <div className={styles.footerLinks}>
          <a href="/about">Acerca de</a>
          <a href="/privacy">Privacidad</a>
          <a href="/terms">Términos</a>
          <a href="/contact">Contacto</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;