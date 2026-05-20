'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import { formatPHP } from '@/utils/costing';
import styles from './AdminDashboard.module.css';

type AdminTab = 'bookings' | 'engineers' | 'services' | 'users';

export default function AdminDashboard() {
  const { bookings, setBookings, engineers, setEngineers, users, setUsers, showToast, currentUser, openModal, showPage } = useApp();
  const [tab, setTab] = useState<AdminTab>('bookings');
  const [engForm, setEngForm] = useState({
    fname: '', lname: '', email: '', phone: '', password: '',
    spec: 'Civil', exp: '', rate: '', skills: '', bio: '',
  });
  const [engFilter, setEngFilter] = useState<'all' | 'available' | 'busy'>('all');

  if (!currentUser) {
    return (
      <div className={styles.guard}>
        <div className={styles.guardCard}>
          <div className={styles.guardTitle}>Admin Access Only</div>
          <div className={styles.guardText}>Please log in with an admin account to continue.</div>
          <button className="btn btn-gold" onClick={() => openModal('login')}>Login</button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className={styles.guard}>
        <div className={styles.guardCard}>
          <div className={styles.guardTitle}>Access Denied</div>
          <div className={styles.guardText}>This dashboard is restricted to admins only.</div>
          <button className="btn btn-outline" onClick={() => showPage('home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const totalRev = bookings.filter(b => b.status === 'Completed').reduce((s, b) => s + b.total, 0);

  const stats = [
    { label: 'Total Bookings', val: String(bookings.length), sub: 'all time' },
    { label: 'Engineers', val: String(engineers.length), sub: `${engineers.filter(e => e.status === 'available').length} available` },
    { label: 'Revenue', val: `₱${(totalRev / 1000000).toFixed(1)}M`, sub: 'completed projects' },
    { label: 'Users', val: String(users.length), sub: 'registered' },
  ];

  const updateBookingStatus = (id: string, status: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
    showToast('Status updated: ' + status);
  };

  const toggleEngStatus = (id: number) => {
    setEngineers(prev => prev.map(e =>
      e.id === id ? { ...e, status: e.status === 'available' ? 'busy' as const : 'available' as const } : e
    ));
    showToast('Engineer status updated');
  };

  const handleEngChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEngForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const addEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    const { fname, lname, email, phone, password, spec, exp, rate, skills, bio } = engForm;
    if (!fname || !lname || !email || !password) {
      showToast('Please fill in required engineer fields.');
      return;
    }
    if (users.find(u => u.email === email)) {
      showToast('Email already exists.');
      return;
    }

    const newUserId = users.length + 1;
    const engineerName = `Engr. ${fname} ${lname}`;
    const newUser = {
      id: newUserId,
      name: `${fname} ${lname}`,
      email,
      password,
      phone,
      role: 'engineer' as const,
    };
    const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
    setEngineers(prev => [...prev, {
      id: prev.length + 1,
      name: engineerName,
      spec,
      avatar: '',
      exp: exp ? `${exp} years` : '5 years',
      rate: parseInt(rate) || 2500,
      rating: 5.0,
      reviews: 0,
      status: 'available' as const,
      skills: skillList.length ? skillList : [spec],
      bio: bio || 'Admin-added engineer profile.',
      userEmail: email,
    }]);
    setUsers(prev => [...prev, newUser]);
    setEngForm({ fname: '', lname: '', email: '', phone: '', password: '', spec: 'Civil', exp: '', rate: '', skills: '', bio: '' });
    showToast('Engineer added successfully.');
  };

  const removeEngineer = (id: number, email: string) => {
    setEngineers(prev => prev.filter(e => e.id !== id));
    setUsers(prev => prev.filter(u => u.email !== email));
    showToast('Engineer removed.');
  };

  const visibleEngineers = engineers
    .filter(e => engFilter === 'all' ? true : e.status === engFilter)
    .map(e => ({
      ...e,
      accountEmail: e.userEmail || users.find(u => u.role === 'engineer' && u.name.startsWith(e.name.replace('Engr. ', '')))?.email || '',
    }));

  return (
    <div>
      <div className={styles.nav}>
        <div className={styles.navInner}>
          {(['bookings', 'engineers', 'services', 'users'] as AdminTab[]).map(t => (
            <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          {stats.map((s, i) => (
            <div key={i} className={styles.astat}>
              <div className={styles.astatLabel}>{s.label}</div>
              <div className={styles.astatVal}>{s.val}</div>
              <div className={styles.astatSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        {tab === 'bookings' && (
          <table className="data-table">
            <thead><tr><th>Booking ID</th><th>Client</th><th>Service</th><th>Engineer</th><th>Area (sqm)</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: 'var(--sky)' }}>{b.id}</td>
                  <td>{b.client}</td>
                  <td>{b.service}</td>
                  <td>{b.engineer}</td>
                  <td>{b.area}</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPHP(b.total)}</td>
                  <td style={{ color: 'var(--muted)' }}>{b.date}</td>
                  <td><span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td>
                    <select className={styles.actionSel} value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}>
                      {['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'engineers' && (
          <div className={styles.engWrap}>
            <form className={styles.engForm} onSubmit={addEngineer}>
              <div className={styles.engHeader}>Add Engineer (Admin Only)</div>
              <div className={styles.engGrid}>
                <div className={styles.engField}><label>First Name *</label><input value={engForm.fname} onChange={handleEngChange('fname')} placeholder="Juan" /></div>
                <div className={styles.engField}><label>Last Name *</label><input value={engForm.lname} onChange={handleEngChange('lname')} placeholder="Dela Cruz" /></div>
                <div className={styles.engField}><label>Email *</label><input type="email" value={engForm.email} onChange={handleEngChange('email')} placeholder="engineer@email.com" /></div>
                <div className={styles.engField}><label>Phone</label><input value={engForm.phone} onChange={handleEngChange('phone')} placeholder="+63 9XX XXX XXXX" /></div>
                <div className={styles.engField}><label>Password *</label><input type="password" value={engForm.password} onChange={handleEngChange('password')} placeholder="Min. 8 characters" /></div>
                <div className={styles.engField}><label>Specialization</label>
                  <select value={engForm.spec} onChange={handleEngChange('spec')}>
                    <option>Civil</option><option>Structural</option><option>Electrical</option><option>Mechanical</option><option>Geodetic</option>
                  </select>
                </div>
                <div className={styles.engField}><label>Experience (years)</label><input type="number" value={engForm.exp} onChange={handleEngChange('exp')} placeholder="5" /></div>
                <div className={styles.engField}><label>Daily Rate (₱)</label><input type="number" value={engForm.rate} onChange={handleEngChange('rate')} placeholder="2500" /></div>
                <div className={`${styles.engField} ${styles.full}`}><label>Skills (comma separated)</label><input value={engForm.skills} onChange={handleEngChange('skills')} placeholder="Structural, Foundation, QA" /></div>
                <div className={`${styles.engField} ${styles.full}`}><label>Bio</label><textarea value={engForm.bio} onChange={handleEngChange('bio')} placeholder="Brief experience summary" /></div>
              </div>
              <div className={styles.engActions}>
                <button className="btn btn-gold btn-sm" type="submit">Add Engineer</button>
              </div>
            </form>

            <div className={styles.engTableWrap}>
              <div className={styles.engTableHeader}>
                <div className={styles.engTitle}>Engineers</div>
                <div className={styles.engFilters}>
                  {(['all', 'available', 'busy'] as const).map(s => (
                    <button key={s} className={`btn btn-outline btn-sm ${engFilter === s ? styles.engActive : ''}`} onClick={() => setEngFilter(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Daily Rate</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {visibleEngineers.map(e => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td style={{ color: 'var(--sky)' }}>{e.spec}</td>
                      <td>{e.exp}</td>
                      <td style={{ color: 'var(--gold)' }}>{formatPHP(e.rate)}</td>
                      <td>★ {e.rating}</td>
                      <td><span className={`status-pill ${e.status === 'available' ? 's-completed' : 's-ongoing'}`}>{e.status}</span></td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleEngStatus(e.id)}>{e.status === 'available' ? 'Set Busy' : 'Set Available'}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeEngineer(e.id, e.accountEmail)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'services' && (
          <table className="data-table">
            <thead><tr><th>Service</th><th>Type</th><th>Mat. Cost/sqm</th><th>Labor/sqm</th><th>Duration</th><th>Min Area</th></tr></thead>
            <tbody>
              {SERVICES.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.type}</td>
                  <td style={{ color: 'var(--gold)' }}>{formatPHP(s.baseCostPerSqm.materials)}</td>
                  <td style={{ color: 'var(--sky)' }}>{formatPHP(s.baseCostPerSqm.labor)}</td>
                  <td>{s.duration}</td>
                  <td>{s.minSqm} sqm</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'users' && (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`status-pill ${u.role === 'admin' ? 's-confirmed' : u.role === 'engineer' ? 's-ongoing' : 's-completed'}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
