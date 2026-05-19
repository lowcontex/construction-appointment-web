'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const { showPage, currentUser, openModal, logout } = useApp();
  const pathname = usePathname();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services & Costs' },
    { path: '/engineers', label: 'Engineers' },
    { path: '/booking', label: 'Book Now' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>BR</div>
          Build<span className={styles.gold}>Right</span>
        </Link>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.headerBtns}>
          {currentUser ? (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => showPage('admin')}>Dashboard</button>
              <button className="btn btn-gold" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => openModal('login')}>Login</button>
              <button className="btn btn-gold" onClick={() => openModal('register')}>Register</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
