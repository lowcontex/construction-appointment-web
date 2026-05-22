'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './AuthModal.module.css';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function AuthModal() {
  const { modalOpen, modalTab, closeModal, switchAuthTab } = useApp();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!modalOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter(element => element.offsetParent !== null || element === document.activeElement);

      if (!focusable.length) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [closeModal, modalOpen]);

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={handleOverlay} aria-hidden={!modalOpen}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="modal-title" id="modalTitle">Welcome</div>
          <button ref={closeRef} className="modal-close" type="button" onClick={closeModal} aria-label="Close authentication modal">&times;</button>
        </div>
        <div className="modal-tabs" role="tablist" aria-label="Authentication">
          <button
            type="button"
            id="login-tab"
            role="tab"
            aria-selected={modalTab === 'login'}
            aria-controls="login-panel"
            className={`modal-tab ${modalTab === 'login' ? 'active' : ''}`}
            onClick={() => switchAuthTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            id="register-tab"
            role="tab"
            aria-selected={modalTab === 'register'}
            aria-controls="register-panel"
            className={`modal-tab ${modalTab === 'register' ? 'active' : ''}`}
            onClick={() => switchAuthTab('register')}
          >
            Register
          </button>
        </div>

        <div
          id="login-panel"
          role="tabpanel"
          aria-labelledby="login-tab"
          hidden={modalTab !== 'login'}
          className={`modal-form ${modalTab === 'login' ? 'active' : ''}`}
        >
          <LoginForm />
        </div>

        <div
          id="register-panel"
          role="tabpanel"
          aria-labelledby="register-tab"
          hidden={modalTab !== 'register'}
          className={`modal-form ${modalTab === 'register' ? 'active' : ''}`}
        >
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { doLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-field">
        <label className="modal-label" htmlFor="auth-login-email">Email</label>
        <input id="auth-login-email" className="modal-input" type="email" autoComplete="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="modal-field">
        <label className="modal-label" htmlFor="auth-login-password">Password</label>
        <input id="auth-login-password" className="modal-input" type="password" autoComplete="current-password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button className={`btn btn-gold ${styles.fullButton}`} type="submit">Login to Agudo Construction</button>
       <div className={styles.demoCredentials}>
         <span className={styles.demoValue}>admin@agudo.com</span> / <span className={styles.demoValue}>admin123</span>
         <span aria-hidden="true"> | </span><span className={styles.demoValue}>eng@agudo.com</span> / <span className={styles.demoValue}>eng123</span>
       </div>
    </form>
  );
}

function RegisterForm() {
  const { doRegister } = useApp();
  const [form, setForm] = useState({
    fname: '', lname: '', email: '', phone: '', password: '',
    prc: '', spec: 'Civil Engineering', exp: '', rate: '', bio: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doRegister(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-field">
        <div className="modal-label" id="auth-account-type-label">Account Type</div>
        <div className="role-picker" role="radiogroup" aria-labelledby="auth-account-type-label">
          <div className="role-opt selected" role="radio" aria-checked="true" aria-disabled="true">
            <div className="role-opt-name">Customer</div>
          </div>
        </div>
      </div>
      <div className={`form-grid ${styles.registerGrid}`}>
        <div className="modal-field"><label className="modal-label" htmlFor="auth-register-first-name">First Name</label><input id="auth-register-first-name" className="modal-input" autoComplete="given-name" required maxLength={40} placeholder="Juan" value={form.fname} onChange={handleChange('fname')} /></div>
        <div className="modal-field"><label className="modal-label" htmlFor="auth-register-last-name">Last Name</label><input id="auth-register-last-name" className="modal-input" autoComplete="family-name" maxLength={40} placeholder="Dela Cruz" value={form.lname} onChange={handleChange('lname')} /></div>
      </div>
      <div className="modal-field"><label className="modal-label" htmlFor="auth-register-email">Email</label><input id="auth-register-email" className="modal-input" type="email" autoComplete="email" required placeholder="your@email.com" value={form.email} onChange={handleChange('email')} /></div>
      <div className="modal-field"><label className="modal-label" htmlFor="auth-register-phone">Phone</label><input id="auth-register-phone" className="modal-input" type="tel" autoComplete="tel" maxLength={30} placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={handleChange('phone')} /></div>
      <div className="modal-field"><label className="modal-label" htmlFor="auth-register-password">Password</label><input id="auth-register-password" className="modal-input" type="password" autoComplete="new-password" required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={handleChange('password')} /></div>

      <div className={`modal-field ${styles.engineerNote}`}>
        <div className={styles.noteText}>
          Engineer accounts are created by admins only. If you are an engineer, please contact support to be added.
        </div>
      </div>

      <button className={`btn btn-gold ${styles.fullButton} ${styles.registerButton}`} type="submit">Create Account</button>
    </form>
  );
}
