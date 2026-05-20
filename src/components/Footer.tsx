'use client';

import { useApp } from '@/context/AppContext';
import Reveal from './Reveal';
import styles from './Footer.module.css';

export default function Footer() {
  const { showPage } = useApp();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Reveal delay={0}>
          <div className={styles.brand}>
            <div className={styles.mark}><img src="/img/agudo-logo.svg" alt="Agudo Construction" /></div>
            Agudo Construction
          </div>
          <div className={styles.tagline}>&quot;Together, We Build Stronger&quot; — Licensed construction services with full material transparency.</div>
        </Reveal>
        <Reveal delay={70}>
          <div className={styles.heading}>Services</div>
          <span className={styles.link} onClick={() => showPage('services')}>House Construction</span>
          <span className={styles.link} onClick={() => showPage('services')}>Renovation</span>
          <span className={styles.link} onClick={() => showPage('services')}>Commercial Build</span>
          <span className={styles.link} onClick={() => showPage('services')}>Electrical Works</span>
        </Reveal>
        <Reveal delay={140}>
          <div className={styles.heading}>Company</div>
          <span className={styles.link}>About Us</span>
          <span className={styles.link} onClick={() => showPage('engineers')}>Our Engineers</span>
          <span className={styles.link}>Projects</span>
          <span className={styles.link}>Careers</span>
        </Reveal>
        <Reveal delay={210}>
          <div className={styles.heading}>Contact</div>
          <span className={styles.link}>T: (02) 8123-4567</span>
          <span className={styles.link}>E: hello@agudoconstruction.ph</span>
          <span className={styles.link}>Metro Manila, PH</span>
        </Reveal>
      </div>
      <div className={styles.bottom}>
        <span>© 2025 Agudo Construction. All rights reserved.</span>
        <span>PRC Accredited · PCAB Licensed</span>
      </div>
    </footer>
  );
}
