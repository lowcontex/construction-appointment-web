'use client';

import { useApp } from '@/context/AppContext';
import styles from './UserBar.module.css';

export default function UserBar() {
  const { currentUser, logout } = useApp();
  if (!currentUser) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <span>Welcome back, <span className={styles.highlight}>{currentUser.name}</span> (<span className={styles.highlight}>{currentUser.role}</span>)</span>
        <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
