'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function AuthModal() {
  const { modalOpen, modalTab, closeModal, switchAuthTab } = useApp();

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title" id="modalTitle">Welcome</div>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-tabs">
          <div className={`modal-tab ${modalTab === 'login' ? 'active' : ''}`} onClick={() => switchAuthTab('login')}>Login</div>
          <div className={`modal-tab ${modalTab === 'register' ? 'active' : ''}`} onClick={() => switchAuthTab('register')}>Register</div>
        </div>

        {/* LOGIN */}
        <div className={`modal-form ${modalTab === 'login' ? 'active' : ''}`}>
          <LoginForm />
        </div>

        {/* REGISTER */}
        <div className={`modal-form ${modalTab === 'register' ? 'active' : ''}`}>
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
        <input className="modal-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-gold" style={{ width: '100%', marginTop: '.5rem', padding: '13px' }}>Login to Agudo Construction</button>
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '12px', color: 'var(--muted)' }}>
        Demo: <span style={{ color: 'var(--sky)' }}>admin@buildright.com</span> / <span style={{ color: 'var(--sky)' }}>admin123</span>
        &nbsp;|&nbsp; <span style={{ color: 'var(--sky)' }}>eng@buildright.com</span> / <span style={{ color: 'var(--sky)' }}>eng123</span>
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
      <div className="form-grid" style={{ gap: '12px' }}>
        <div className="modal-field"><label className="modal-label">First Name</label><input className="modal-input" placeholder="Juan" value={form.fname} onChange={handleChange('fname')} /></div>
        <div className="modal-field"><label className="modal-label">Last Name</label><input className="modal-input" placeholder="Dela Cruz" value={form.lname} onChange={handleChange('lname')} /></div>
      </div>
      <div className="modal-field"><label className="modal-label">Email</label><input className="modal-input" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange('email')} /></div>
      <div className="modal-field"><label className="modal-label">Phone</label><input className="modal-input" placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={handleChange('phone')} /></div>
      <div className="modal-field"><label className="modal-label">Password</label><input className="modal-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange('password')} /></div>

      <div className="modal-field" style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Engineer accounts are created by admins only. If you are an engineer, please contact support to be added.
        </div>
      </div>

      <button className="btn btn-gold" style={{ width: '100%', marginTop: '1rem', padding: '13px' }}>Create Account</button>
    </form>
  );
}
