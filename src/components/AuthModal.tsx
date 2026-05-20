'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function AuthModal() {
  const { modalOpen, modalTab, closeModal, switchAuthTab } = useApp();
  const [role, setRole] = useState<'customer' | 'engineer'>('customer');

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
          <RegisterForm role={role} onRoleChange={setRole} />
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
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '12px', color: 'var(--text-muted)' }}>
        Demo: <span style={{ color: 'var(--brand-vivid)' }}>admin@agudo.com</span> / <span style={{ color: 'var(--brand-vivid)' }}>admin123</span>
        &nbsp;|&nbsp; <span style={{ color: 'var(--brand-vivid)' }}>eng@agudo.com</span> / <span style={{ color: 'var(--brand-vivid)' }}>eng123</span>
      </div>
    </form>
  );
}

function RegisterForm({ role, onRoleChange }: { role: 'customer' | 'engineer'; onRoleChange: (r: 'customer' | 'engineer') => void }) {
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
    doRegister(form, role);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-field">
        <label className="modal-label">I am registering as</label>
        <div className="role-picker">
          <div className={`role-opt ${role === 'customer' ? 'selected' : ''}`} onClick={() => onRoleChange('customer')}>
            <div className="role-opt-name">Customer</div>
          </div>
          <div className={`role-opt ${role === 'engineer' ? 'selected' : ''}`} onClick={() => onRoleChange('engineer')}>
            <div className="role-opt-name">Engineer</div>
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

      <div className={`eng-extra ${role === 'engineer' ? 'show' : ''}`}>
        <div className="modal-divider">Engineer Information</div>
        <div className="modal-field"><label className="modal-label">PRC License No.</label><input className="modal-input" placeholder="e.g. 0012345" value={form.prc} onChange={handleChange('prc')} /></div>
        <div className="modal-field">
          <label className="modal-label">Specialization</label>
          <select className="modal-select" value={form.spec} onChange={handleChange('spec')}>
            <option>Civil Engineering</option><option>Structural Engineering</option>
            <option>Electrical Engineering</option><option>Mechanical Engineering</option>
            <option>Geodetic Engineering</option>
          </select>
        </div>
        <div className="modal-field"><label className="modal-label">Years of Experience</label><input className="modal-input" type="number" placeholder="e.g. 5" value={form.exp} onChange={handleChange('exp')} /></div>
        <div className="modal-field"><label className="modal-label">Daily Rate (₱)</label><input className="modal-input" type="number" placeholder="e.g. 2500" value={form.rate} onChange={handleChange('rate')} /></div>
        <div className="modal-field"><label className="modal-label">Notable Projects / Bio</label><textarea className="modal-input" placeholder="Brief experience summary..." style={{ minHeight: '70px', resize: 'vertical' }} value={form.bio} onChange={handleChange('bio')} /></div>
      </div>

      <button className="btn btn-gold" style={{ width: '100%', marginTop: '1rem', padding: '13px' }}>Create Account</button>
    </form>
  );
}
