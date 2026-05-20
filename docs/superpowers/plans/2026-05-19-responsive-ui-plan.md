c# Responsive UI & Quick Estimate Dropdown Arrow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the UI responsive across phones/tablets and fix the Quick Estimate dropdown arrow.

**Architecture:** Add a mobile nav drawer with minimal state, apply CSS breakpoints and grid reflows, and add a custom select arrow to the Hero quick estimate select.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules, global CSS utilities.

---

## File Structure & Responsibilities

- `src/components/Header.tsx` — add hamburger button + drawer markup and state.
- `src/components/Header.module.css` — desktop header styles + new mobile nav + breakpoints.
- `src/components/Hero.module.css` — responsive padding and select arrow styling.
- `src/components/ServiceCards.module.css` — responsive grid breakpoints.
- `src/components/EngineerGrid.module.css` — responsive grid breakpoints.
- `src/components/WhyUs.module.css` — responsive grid breakpoints.
- `src/components/BookingForm.module.css` — steps wrap, button stack, spacing tweaks.
- `src/components/AdminDashboard.module.css` — table wrapper for horizontal scroll.
- `src/components/Topbar.module.css` — responsive font sizing and padding.
- `src/components/UserBar.module.css` — responsive layout.
- `src/app/globals.css` — any shared responsive utilities (if needed).

---

### Task 1: Add Mobile Nav Drawer

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Header.module.css`

- [ ] **Step 1: Add hamburger state + drawer markup**

```tsx
'use client';

import Link from 'next/link';
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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoMark}>BR</div>
          Build<span className={styles.gold}>Right</span>
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
              <button className="btn btn-outline btn-sm" onClick={() => { showPage('admin'); closeMenu(); }}>Dashboard</button>
              <button className="btn btn-gold" onClick={() => { logout(); closeMenu(); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => { openModal('login'); closeMenu(); }}>Login</button>
              <button className="btn btn-gold" onClick={() => { openModal('register'); closeMenu(); }}>Register</button>
            </>
          )}
        </div>
        <button
          className={styles.hamburger}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
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
                <button className="btn btn-outline btn-sm" onClick={() => { showPage('admin'); closeMenu(); }}>Dashboard</button>
                <button className="btn btn-gold" onClick={() => { logout(); closeMenu(); }}>Logout</button>
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
```

- [ ] **Step 2: Add hamburger + drawer CSS**

```css
.hamburger{display:none;background:none;border:none;cursor:pointer;gap:5px;flex-direction:column;justify-content:center;align-items:center;width:36px;height:36px;}
.hamburger span{display:block;width:22px;height:2px;background:var(--gold);transition:all var(--t);}

.drawer{display:none;}
.drawerOpen{display:block;}
.drawerInner{max-width:1300px;margin:0 auto;padding:1rem 2rem 1.5rem;display:flex;flex-direction:column;gap:12px;background:var(--navy);border-bottom:2px solid var(--mid);}
.drawerLink{font-size:13px;font-weight:600;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;padding:6px 0;border-bottom:1px solid var(--mid);}
.drawerLink:last-child{border-bottom:none;}
.drawerActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:.5rem;}

@media(max-width:900px){
  .nav{display:none;}
  .headerBtns{display:none;}
  .hamburger{display:flex;}
}
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/components/Header.module.css
git commit -m "feat: add mobile nav drawer"
```

---

### Task 2: Quick Estimate Dropdown Arrow Fix

**Files:**
- Modify: `src/components/Hero.module.css`

- [ ] **Step 1: Add custom select arrow styles**

```css
.select{width:100%;background:var(--navy);border:1.5px solid var(--mid);border-radius:var(--r);color:var(--light);font-family:var(--font-body);font-size:14px;padding:10px 36px 10px 13px;outline:none;transition:border-color var(--t);appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%23d4940a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;}
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.module.css
git commit -m "fix: restore quick estimate dropdown arrow"
```

---

### Task 3: Responsive Grid & Layout Adjustments

**Files:**
- Modify: `src/components/ServiceCards.module.css`
- Modify: `src/components/EngineerGrid.module.css`
- Modify: `src/components/WhyUs.module.css`

- [ ] **Step 1: Add responsive grid breakpoints**

```css
@media(max-width:768px){
  .grid{grid-template-columns:repeat(auto-fit,minmax(240px,1fr));}
}

@media(max-width:430px){
  .grid{grid-template-columns:1fr;}
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceCards.module.css src/components/EngineerGrid.module.css src/components/WhyUs.module.css
git commit -m "style: add responsive grid breakpoints"
```

---

### Task 4: Booking Form Responsive Improvements

**Files:**
- Modify: `src/components/BookingForm.module.css`

- [ ] **Step 1: Add mobile layout adjustments**

```css
@media(max-width:768px){
  .wrap{padding:2rem 1.5rem;}
  .steps{flex-wrap:wrap;gap:12px;}
  .steps::before{display:none;}
}

@media(max-width:430px){
  .title{font-size:1.8rem;}
  .card{padding:1.5rem;}
  .nav{flex-direction:column;gap:10px;}
  .nav .btn{width:100%;}
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/BookingForm.module.css
git commit -m "style: improve booking form responsiveness"
```

---

### Task 5: Admin Table Mobile Scroll

**Files:**
- Modify: `src/components/AdminDashboard.module.css`

- [ ] **Step 1: Add table wrapper styles**

```css
.tableWrap{width:100%;overflow-x:auto;border-radius:var(--r-lg);}
.tableWrap table{min-width:720px;}

@media(max-width:768px){
  .content{padding:1.5rem;}
}
```

- [ ] **Step 2: Wrap tables in AdminDashboard.tsx**

```tsx
<div className={styles.tableWrap}>
  <table className="data-table">...</table>
</div>
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/AdminDashboard.module.css src/components/AdminDashboard.tsx
git commit -m "style: enable admin table horizontal scroll"
```

---

### Task 6: Header Bar + UserBar Responsive Tweaks

**Files:**
- Modify: `src/components/Topbar.module.css`
- Modify: `src/components/UserBar.module.css`

- [ ] **Step 1: Add small screen font and layout adjustments**

```css
@media(max-width:430px){
  .topbar{font-size:10px;padding:6px 10px;}
}
```

```css
@media(max-width:430px){
  .inner{flex-direction:column;align-items:flex-start;gap:6px;}
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/Topbar.module.css src/components/UserBar.module.css
git commit -m "style: adjust topbar and userbar for phones"
```

---

## Self-Review

- Spec coverage: all responsive areas + dropdown arrow fix covered.
- Placeholder scan: none.
- Type consistency: paths and class names consistent.

---

Plan complete and saved to `docs/superpowers/plans/2026-05-19-responsive-ui-plan.md`.

Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
