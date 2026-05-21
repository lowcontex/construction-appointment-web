'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { modalOpen, modalTab, closeModal, switchAuthTab } = useApp();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!modalOpen) return;

    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        <label className="modal-label">Email</label>
        <input className="modal-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="modal-field">
        <label className="modal-label">Password</label>
        <input className="modal-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button className={`btn btn-gold ${styles.fullButton}`}>Login to Agudo Construction</button>
      <div className={styles.demoCredentials}>
        Demo: <span className={styles.demoValue}>admin@buildright.com</span> / <span className={styles.demoValue}>admin123</span>
        <span aria-hidden="true"> | </span><span className={styles.demoValue}>eng@buildright.com</span> / <span className={styles.demoValue}>eng123</span>
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
        <label className="modal-label">Account Type</label>
        <div className="role-picker">
          <div className="role-opt selected">
            <div className="role-opt-name">Customer</div>
          </div>
        </div>
      </div>
      <div className={`form-grid ${styles.registerGrid}`}>
        <div className="modal-field"><label className="modal-label">First Name</label><input className="modal-input" placeholder="Juan" value={form.fname} onChange={handleChange('fname')} /></div>
        <div className="modal-field"><label className="modal-label">Last Name</label><input className="modal-input" placeholder="Dela Cruz" value={form.lname} onChange={handleChange('lname')} /></div>
      </div>
      <div className="modal-field"><label className="modal-label">Email</label><input className="modal-input" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange('email')} /></div>
      <div className="modal-field"><label className="modal-label">Phone</label><input className="modal-input" placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={handleChange('phone')} /></div>
      <div className="modal-field"><label className="modal-label">Password</label><input className="modal-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange('password')} /></div>

      <div className={`modal-field ${styles.engineerNote}`}>
        <div className={styles.noteText}>
          Engineer accounts are created by admins only. If you are an engineer, please contact support to be added.
        </div>
      </div>

      <button className={`btn btn-gold ${styles.fullButton} ${styles.registerButton}`}>Create Account</button>
    </form>
  );
}
