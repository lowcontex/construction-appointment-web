'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import type { Booking } from '@/types';
import { formatPHP } from '@/utils/costing';
import styles from './AdminDashboard.module.css';

const ADMIN_TABS = ['bookings', 'engineers', 'services', 'users'] as const;
const ENGINEER_FILTERS = ['all', 'available', 'busy'] as const;
const BOOKING_STATUSES: Booking['status'][] = ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];
const BOOKING_STATUS_SET = new Set<string>(BOOKING_STATUSES);

type AdminTab = typeof ADMIN_TABS[number];
type EngineerFilter = typeof ENGINEER_FILTERS[number];

function isBookingStatus(value: string): value is Booking['status'] {
  return BOOKING_STATUS_SET.has(value);
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanText(value: string, maxLength = 120) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function AdminDashboard() {
  const { bookings, setBookings, engineers, setEngineers, users, setUsers, showToast, currentUser, openModal, showPage } = useApp();
  const [tab, setTab] = useState<AdminTab>('bookings');
  const [engForm, setEngForm] = useState({
    fname: '', lname: '', email: '', phone: '', password: '',
    spec: 'Civil', exp: '', rate: '', skills: '', bio: '',
  });
  const [engFilter, setEngFilter] = useState<EngineerFilter>('all');

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
    { label: 'Revenue', val: `\u20b1${(totalRev / 1000000).toFixed(1)}M`, sub: 'completed projects' },
    { label: 'Users', val: String(users.length), sub: 'registered' },
  ];

  const updateBookingStatus = (id: string, statusValue: string) => {
    if (!isBookingStatus(statusValue)) {
      showToast('Could not update status. Please choose a valid status.');
      return;
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: statusValue } : b));
    showToast('Status updated: ' + statusValue);
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
    const safeFirstName = cleanText(fname, 40);
    const safeLastName = cleanText(lname, 40);
    const safeEmail = normalizeEmail(email);
    const safePhone = cleanText(phone, 30);
    const parsedRate = Number(rate);
    const parsedExp = Number(exp);
    if (!safeFirstName || !safeLastName || !safeEmail || !password) {
      showToast('Please fill in required engineer fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      showToast('Please enter a valid engineer email.');
      return;
    }
    if (password.length < 8) {
      showToast('Engineer password must be at least 8 characters.');
      return;
    }
    if (users.find(u => normalizeEmail(u.email) === safeEmail)) {
      showToast('Email already exists.');
      return;
    }
    if (rate && (!Number.isFinite(parsedRate) || parsedRate < 1000 || parsedRate > 50000)) {
      showToast('Daily rate must be between ₱1,000 and ₱50,000.');
      return;
    }
    if (exp && (!Number.isFinite(parsedExp) || parsedExp < 0 || parsedExp > 60)) {
      showToast('Experience must be between 0 and 60 years.');
      return;
    }

    const newUserId = users.length + 1;
    const engineerName = `Engr. ${safeFirstName} ${safeLastName}`;
    const newUser = {
      id: newUserId,
      name: `${safeFirstName} ${safeLastName}`,
      email: safeEmail,
      password,
      phone: safePhone,
      role: 'engineer' as const,
    };
    const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
    setEngineers(prev => [...prev, {
      id: prev.length + 1,
      name: engineerName,
      spec,
      avatar: '',
      exp: Number.isFinite(parsedExp) && exp ? `${parsedExp} years` : '5 years',
      rate: Number.isFinite(parsedRate) && rate ? Math.round(parsedRate) : 2500,
      rating: 5.0,
      reviews: 0,
      status: 'available' as const,
      skills: skillList.length ? skillList.map(skill => cleanText(skill, 32)) : [spec],
      bio: cleanText(bio, 240) || 'Admin-added engineer profile.',
      userEmail: safeEmail,
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
          {ADMIN_TABS.map(t => (
            <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
              {formatLabel(t)}
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
          <div className={`${styles.tableWrap} ${styles.wideTable}`}>
            <table className="data-table">
              <thead><tr><th>Booking ID</th><th>Client</th><th>Service</th><th>Engineer</th><th>Area (sqm)</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className={styles.keyCell}>{b.id}</td>
                    <td>{b.client}</td>
                    <td>{b.service}</td>
                    <td>{b.engineer}</td>
                    <td>{b.area}</td>
                    <td className={styles.moneyCell}>{formatPHP(b.total)}</td>
                    <td className={styles.mutedCell}>{b.date}</td>
                    <td><span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td>
                      <select className={styles.actionSel} value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}>
                        {BOOKING_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <div className={styles.engField}><label>Daily Rate (\u20b1)</label><input type="number" value={engForm.rate} onChange={handleEngChange('rate')} placeholder="2500" /></div>
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
                  {ENGINEER_FILTERS.map(s => (
                    <button key={s} className={`btn btn-outline btn-sm ${engFilter === s ? styles.engActive : ''}`} onClick={() => setEngFilter(s)}>
                      {formatLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${styles.tableWrap} ${styles.wideTable}`}>
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Daily Rate</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {visibleEngineers.length === 0 ? (
                      <tr><td className={styles.emptyCell} colSpan={7}>No engineers match this filter.</td></tr>
                    ) : (
                      visibleEngineers.map(e => (
                        <tr key={e.id}>
                          <td className={styles.keyCell}>{e.name}</td>
                          <td className={styles.brandCell}>{e.spec}</td>
                          <td>{e.exp}</td>
                          <td className={styles.moneyCell}>{formatPHP(e.rate)}</td>
                          <td className={styles.ratingCell}>{e.rating} / 5</td>
                          <td><span className={`status-pill ${e.status === 'available' ? 's-completed' : 's-busy'}`}>{formatLabel(e.status)}</span></td>
                          <td>
                            <div className={styles.actionGroup}>
                              <button className={`btn btn-outline btn-sm ${styles.statusAction}`} onClick={() => toggleEngStatus(e.id)}>{e.status === 'available' ? 'Mark Busy' : 'Mark Available'}</button>
                              <button className={`btn btn-danger btn-sm ${styles.removeAction}`} onClick={() => removeEngineer(e.id, e.accountEmail)}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'services' && (
          <div className={styles.tableWrap}>
            <table className="data-table">
              <thead><tr><th>Service</th><th>Type</th><th>Mat. Cost/sqm</th><th>Labor/sqm</th><th>Duration</th><th>Min Area</th></tr></thead>
              <tbody>
                {SERVICES.map(s => (
                  <tr key={s.id}>
                    <td className={styles.keyCell}>{s.name}</td>
                    <td>{s.type}</td>
                    <td className={styles.moneyCell}>{formatPHP(s.baseCostPerSqm.materials)}</td>
                    <td className={styles.brandCell}>{formatPHP(s.baseCostPerSqm.labor)}</td>
                    <td>{s.duration}</td>
                    <td>{s.minSqm} sqm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && (
          <div className={styles.tableWrap}>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className={styles.keyCell}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`status-pill ${u.role === 'admin' ? 's-confirmed' : u.role === 'engineer' ? 's-ongoing' : 's-completed'}`}>{formatLabel(u.role)}</span></td>
                    <td className={styles.mutedCell}>{u.phone || 'Not provided'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
