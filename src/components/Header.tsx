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
          <div className={styles.logoMark}><img src="/img/agudo-logo.svg" alt="Agudo Construction" /></div>
          Agudo<span className={styles.gold}>Construction</span>
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
              {currentUser.role === 'admin' ? (
                <button className="btn btn-outline btn-sm" onClick={() => showPage('admin')}>Admin</button>
              ) : currentUser.role === 'engineer' ? (
                <button className="btn btn-outline btn-sm" onClick={() => showPage('engineer')}>Engineer</button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => showPage('my-bookings')}>My Bookings</button>
              )}
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
