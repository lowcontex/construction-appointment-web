'use client';

import Image from 'next/image';
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
            <div className={styles.mark}>
              <Image src="/img/agudo-logo.svg" alt="Agudo Construction" width={32} height={32} />
            </div>
            Agudo Construction
          </div>
          <div className={styles.tagline}>&quot;Together, We Build Stronger.&quot; Licensed construction services with full material transparency.</div>
        </Reveal>
        <Reveal delay={70}>
          <div className={styles.heading}>Services</div>
          <button className={styles.link} onClick={() => showPage('services')}>House Construction</button>
          <button className={styles.link} onClick={() => showPage('services')}>Renovation</button>
          <button className={styles.link} onClick={() => showPage('services')}>Commercial Build</button>
          <button className={styles.link} onClick={() => showPage('services')}>Electrical Works</button>
        </Reveal>
        <Reveal delay={140}>
          <div className={styles.heading}>Company</div>
          <span className={styles.info}>About Us</span>
          <button className={styles.link} onClick={() => showPage('engineers')}>Our Engineers</button>
          <span className={styles.info}>Projects</span>
          <span className={styles.info}>Careers</span>
        </Reveal>
        <Reveal delay={210}>
          <div className={styles.heading}>Contact</div>
          <span className={styles.info}>T: (02) 8123-4567</span>
          <span className={styles.info}>E: hello@agudoconstruction.ph</span>
          <span className={styles.info}>Metro Manila, PH</span>
        </Reveal>
      </div>
      <div className={styles.bottom}>
        <span>Copyright 2025 Agudo Construction. All rights reserved.</span>
        <span>PRC Accredited | PCAB Licensed</span>
      </div>
    </footer>
  );
}
