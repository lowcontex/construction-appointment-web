'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const { showPage, currentUser, openModal, logout } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services & Costs' },
    { path: '/engineers', label: 'Engineers' },
    { path: '/booking', label: 'Book Now' },
  ];

  const closeMenu = () => setMenuOpen(false);
  const accountLabel = currentUser?.role === 'admin'
    ? 'Admin'
    : currentUser?.role === 'engineer'
      ? 'Engineer'
      : 'My Bookings';
  const showAccountPage = () => {
    if (currentUser?.role === 'admin') {
      showPage('admin');
    } else if (currentUser?.role === 'engineer') {
      showPage('engineer');
    } else {
      showPage('my-bookings');
    }
    closeMenu();
  };
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoMark}><Image src="/img/agudo-logo.svg" alt="Agudo Construction" width={40} height={40} priority /></div>
          Agudo<span className={styles.gold}>Construction</span>
        </Link>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.headerBtns}>
          {currentUser ? (
            <>
              <button className="btn btn-outline btn-sm" onClick={showAccountPage}>{accountLabel}</button>
              <button className="btn btn-gold" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => openModal('login')}>Login</button>
              <button className="btn btn-gold" onClick={() => openModal('register')}>Register</button>
            </>
          )}
        </div>
        <button
          className={styles.hamburger}
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div id="mobile-navigation" className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerInner}>
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.drawerLink} ${pathname === item.path ? styles.active : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.drawerActions}>
            {currentUser ? (
              <>
                <button className="btn btn-outline btn-sm" onClick={showAccountPage}>{accountLabel}</button>
                <button className="btn btn-gold" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => { openModal('login'); closeMenu(); }}>Login</button>
                <button className="btn btn-gold" onClick={() => { openModal('register'); closeMenu(); }}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
