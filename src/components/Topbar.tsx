'use client';

import styles from './Topbar.module.css';

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <span>Agudo Construction - Licensed & Insured</span>
      <span className={styles.extra}>Together, We Build Stronger</span>
    </div>
  );
}
