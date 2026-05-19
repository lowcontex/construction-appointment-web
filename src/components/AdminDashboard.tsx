'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import { formatPHP } from '@/utils/costing';
import styles from './AdminDashboard.module.css';

type AdminTab = 'bookings' | 'engineers' | 'services' | 'users';

export default function AdminDashboard() {
  const { bookings, setBookings, engineers, setEngineers, users, showToast, currentUser } = useApp();
  const [tab, setTab] = useState<AdminTab>('bookings');

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
          <table className="data-table">
            <thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Daily Rate</th><th>Rating</th><th>Status</th><th>Toggle</th></tr></thead>
            <tbody>
              {engineers.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td style={{ color: 'var(--sky)' }}>{e.spec}</td>
                  <td>{e.exp}</td>
                  <td style={{ color: 'var(--gold)' }}>{formatPHP(e.rate)}</td>
                  <td>★ {e.rating}</td>
                  <td><span className={`status-pill ${e.status === 'available' ? 's-completed' : 's-ongoing'}`}>{e.status}</span></td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => toggleEngStatus(e.id)}>{e.status === 'available' ? 'Set Busy' : 'Set Available'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <td style={{ color: 'var(--muted)' }}>{u.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
