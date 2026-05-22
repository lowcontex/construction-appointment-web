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

const TAB_COPY: Record<AdminTab, { title: string; desc: string }> = {
  bookings: {
    title: 'Booking Queue',
    desc: 'Review project requests, update status, and keep operations moving.',
  },
  engineers: {
    title: 'Engineer Management',
    desc: 'Add engineer accounts, track availability, and remove inactive profiles.',
  },
  services: {
    title: 'Service Catalog',
    desc: 'Reference active service pricing, labor rates, duration, and minimum areas.',
  },
  users: {
    title: 'User Directory',
    desc: 'Audit registered customers, engineers, and admin accounts.',
  },
};

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

function hasRegisteredEmail(users: { email: string }[], email: string) {
  const safeEmail = normalizeEmail(email);
  return users.some(user => normalizeEmail(user.email) === safeEmail);
}

function getNextNumericId(items: { id: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
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

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Ongoing').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const availableEngineers = engineers.filter(e => e.status === 'available').length;
  const totalRev = bookings.filter(b => b.status === 'Completed').reduce((s, b) => s + b.total, 0);

  const stats = [
    { label: 'Booking Queue', val: String(bookings.length), sub: `${pendingBookings} pending` },
    { label: 'Active Projects', val: String(activeBookings), sub: 'confirmed or ongoing' },
    { label: 'Engineers', val: String(engineers.length), sub: `${availableEngineers} available` },
    { label: 'Completed Value', val: formatPHP(totalRev), sub: `${completedBookings} completed` },
  ];

  const tabCounts: Record<AdminTab, number> = {
    bookings: bookings.length,
    engineers: engineers.length,
    services: SERVICES.length,
    users: users.length,
  };

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
    if (hasRegisteredEmail(users, safeEmail)) {
      showToast('This email is already registered.');
      return;
    }
    if (rate && (!Number.isFinite(parsedRate) || parsedRate < 1000 || parsedRate > 50000)) {
      showToast('Daily rate must be between PHP 1,000 and PHP 50,000.');
      return;
    }
    if (exp && (!Number.isFinite(parsedExp) || parsedExp < 0 || parsedExp > 60)) {
      showToast('Experience must be between 0 and 60 years.');
      return;
    }

    const newUserId = getNextNumericId(users);
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
      id: getNextNumericId(prev),
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

  const tabCopy = TAB_COPY[tab];

  return (
    <div>
      <div className={styles.nav}>
        <div className={styles.navInner} role="tablist" aria-label="Admin dashboard sections">
          {ADMIN_TABS.map(t => (
            <button
              key={t}
              id={`admin-tab-${t}`}
              className={`${styles.tabBtn} ${tab === t ? styles.active : ''}`}
              type="button"
              role="tab"
              aria-selected={tab === t}
              aria-controls="admin-section-panel"
              onClick={() => setTab(t)}
            >
              <span>{formatLabel(t)}</span>
              <span className={styles.tabCount}>{tabCounts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <div>
            <div className={styles.kicker}>Admin Dashboard</div>
            <h1 className={styles.title}>Operations Control</h1>
            <p className={styles.subtitle}>Manage bookings, engineer availability, services, and user accounts from one focused workspace.</p>
          </div>
          <div className={styles.heroActions}>
            <button className="btn btn-outline" type="button" onClick={() => setTab('bookings')}>Review Bookings</button>
            <button className="btn btn-gold" type="button" onClick={() => setTab('engineers')}>Add Engineer</button>
          </div>
        </div>

        <div className={styles.stats}>
          {stats.map(s => (
            <div key={s.label} className={styles.astat}>
              <div className={styles.astatLabel}>{s.label}</div>
              <div className={styles.astatVal}>{s.val}</div>
              <div className={styles.astatSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        <section id="admin-section-panel" className={styles.section} role="tabpanel" aria-labelledby={`admin-tab-${tab}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="admin-section-title" className={styles.sectionTitle}>{tabCopy.title}</h2>
              <p className={styles.sectionDesc}>{tabCopy.desc}</p>
            </div>
            {tab === 'bookings' && (
              <div className={styles.statusStrip} aria-label="Booking status summary">
                <span>{pendingBookings} Pending</span>
                <span>{activeBookings} Active</span>
                <span>{completedBookings} Completed</span>
              </div>
            )}
            {tab === 'engineers' && (
              <div className={styles.engFilters}>
                {ENGINEER_FILTERS.map(s => (
                  <button
                    key={s}
                    className={`btn btn-outline btn-sm ${engFilter === s ? styles.engActive : ''}`}
                    type="button"
                    aria-pressed={engFilter === s}
                    onClick={() => setEngFilter(s)}
                  >
                    {formatLabel(s)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {tab === 'bookings' && (
            <>
              <div className={`${styles.tableWrap} ${styles.wideTable}`}>
                <table className="data-table">
                  <thead><tr><th>Booking ID</th><th>Client</th><th>Service</th><th>Engineer</th><th>Area</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td className={styles.emptyCell} colSpan={9}>No bookings are in the queue.</td></tr>
                    ) : (
                      bookings.map(b => (
                        <tr key={b.id}>
                          <td className={styles.keyCell}>{b.id}</td>
                          <td>{b.client}</td>
                          <td>{b.service}</td>
                          <td>{b.engineer}</td>
                          <td>{b.area} sqm</td>
                          <td className={styles.moneyCell}>{formatPHP(b.total)}</td>
                          <td className={styles.mutedCell}>{b.date}</td>
                          <td><span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span></td>
                          <td>
                            <select className={styles.actionSel} aria-label={`Update status for booking ${b.id}`} value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}>
                              {BOOKING_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className={styles.mobileCards} aria-label="Booking cards">
                {bookings.length === 0 ? (
                  <div className={styles.mobileEmpty}>No bookings are in the queue.</div>
                ) : (
                  bookings.map(b => (
                    <article key={b.id} className={styles.adminCard}>
                      <div className={styles.cardTop}>
                        <div>
                          <div className={styles.cardEyebrow}>{b.id}</div>
                          <div className={styles.cardTitle}>{b.service}</div>
                        </div>
                        <span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span>
                      </div>
                      <div className={styles.cardRows}>
                        <div><span>Client</span><strong>{b.client}</strong></div>
                        <div><span>Engineer</span><strong>{b.engineer}</strong></div>
                        <div><span>Area</span><strong>{b.area} sqm</strong></div>
                        <div><span>Total</span><strong>{formatPHP(b.total)}</strong></div>
                        <div><span>Date</span><strong>{b.date}</strong></div>
                      </div>
                      <label className={styles.cardSelectLabel} htmlFor={`booking-status-${b.id}`}>Update status</label>
                      <select id={`booking-status-${b.id}`} className={styles.cardSelect} value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}>
                        {BOOKING_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          {tab === 'engineers' && (
            <div className={styles.engWrap}>
              <form className={styles.engForm} onSubmit={addEngineer}>
                <div className={styles.engHeader}>
                  <div>
                    <h3>Add Engineer</h3>
                    <p>Create a login and public profile for a licensed engineer.</p>
                  </div>
                </div>
                <div className={styles.engGrid}>
                  <div className={styles.engField}><label htmlFor="admin-engineer-first-name">First Name *</label><input id="admin-engineer-first-name" required maxLength={40} autoComplete="given-name" value={engForm.fname} onChange={handleEngChange('fname')} placeholder="Juan" /></div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-last-name">Last Name *</label><input id="admin-engineer-last-name" required maxLength={40} autoComplete="family-name" value={engForm.lname} onChange={handleEngChange('lname')} placeholder="Dela Cruz" /></div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-email">Email *</label><input id="admin-engineer-email" type="email" required autoComplete="email" value={engForm.email} onChange={handleEngChange('email')} placeholder="engineer@email.com" /></div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-phone">Phone</label><input id="admin-engineer-phone" type="tel" maxLength={30} autoComplete="tel" value={engForm.phone} onChange={handleEngChange('phone')} placeholder="+63 9XX XXX XXXX" /></div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-password">Password *</label><input id="admin-engineer-password" type="password" required minLength={8} autoComplete="new-password" value={engForm.password} onChange={handleEngChange('password')} placeholder="Min. 8 characters" /></div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-specialization">Specialization</label>
                    <select id="admin-engineer-specialization" value={engForm.spec} onChange={handleEngChange('spec')}>
                      <option>Civil</option><option>Structural</option><option>Electrical</option><option>Mechanical</option><option>Geodetic</option>
                    </select>
                  </div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-experience">Experience</label><input id="admin-engineer-experience" type="number" inputMode="numeric" min="0" max="60" value={engForm.exp} onChange={handleEngChange('exp')} placeholder="5 years" /></div>
                  <div className={styles.engField}><label htmlFor="admin-engineer-rate">Daily Rate</label><input id="admin-engineer-rate" type="number" inputMode="numeric" min="1000" max="50000" value={engForm.rate} onChange={handleEngChange('rate')} placeholder="2500" /></div>
                  <div className={`${styles.engField} ${styles.full}`}><label htmlFor="admin-engineer-skills">Skills</label><input id="admin-engineer-skills" maxLength={180} value={engForm.skills} onChange={handleEngChange('skills')} placeholder="Structural, Foundation, QA" /></div>
                  <div className={`${styles.engField} ${styles.full}`}><label htmlFor="admin-engineer-bio">Bio</label><textarea id="admin-engineer-bio" maxLength={240} value={engForm.bio} onChange={handleEngChange('bio')} placeholder="Brief experience summary" /></div>
                </div>
                <div className={styles.engActions}>
                  <button className="btn btn-gold" type="submit">Add Engineer</button>
                </div>
              </form>

              <div className={styles.engTableWrap}>
                <div className={styles.engTableMeta}>
                  <div className={styles.engTitle}>Engineer Roster</div>
                  <div className={styles.engCount}>{visibleEngineers.length} shown</div>
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
                                <button className={`btn btn-outline btn-sm ${styles.statusAction}`} type="button" onClick={() => toggleEngStatus(e.id)}>{e.status === 'available' ? 'Mark Busy' : 'Mark Available'}</button>
                                <button className={`btn btn-danger btn-sm ${styles.removeAction}`} type="button" onClick={() => removeEngineer(e.id, e.accountEmail)}>Remove</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className={styles.mobileCards} aria-label="Engineer roster cards">
                  {visibleEngineers.length === 0 ? (
                    <div className={styles.mobileEmpty}>No engineers match this filter.</div>
                  ) : (
                    visibleEngineers.map(e => (
                      <article key={e.id} className={styles.adminCard}>
                        <div className={styles.cardTop}>
                          <div>
                            <div className={styles.cardEyebrow}>{e.spec}</div>
                            <div className={styles.cardTitle}>{e.name}</div>
                          </div>
                          <span className={`status-pill ${e.status === 'available' ? 's-completed' : 's-busy'}`}>{formatLabel(e.status)}</span>
                        </div>
                        <div className={styles.cardRows}>
                          <div><span>Experience</span><strong>{e.exp}</strong></div>
                          <div><span>Daily Rate</span><strong>{formatPHP(e.rate)}</strong></div>
                          <div><span>Rating</span><strong>{e.rating} / 5</strong></div>
                        </div>
                        <div className={styles.mobileActions}>
                          <button className={`btn btn-outline btn-sm ${styles.statusAction}`} type="button" onClick={() => toggleEngStatus(e.id)}>{e.status === 'available' ? 'Mark Busy' : 'Mark Available'}</button>
                          <button className={`btn btn-danger btn-sm ${styles.removeAction}`} type="button" onClick={() => removeEngineer(e.id, e.accountEmail)}>Remove</button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'services' && (
            <>
              <div className={styles.tableWrap}>
                <table className="data-table">
                  <thead><tr><th>Service</th><th>Type</th><th>Material Cost</th><th>Labor</th><th>Duration</th><th>Min Area</th></tr></thead>
                  <tbody>
                    {SERVICES.map(s => (
                      <tr key={s.id}>
                        <td className={styles.keyCell}>{s.name}</td>
                        <td>{s.type}</td>
                        <td className={styles.moneyCell}>{formatPHP(s.baseCostPerSqm.materials)} / sqm</td>
                        <td className={styles.brandCell}>{formatPHP(s.baseCostPerSqm.labor)} / sqm</td>
                        <td>{s.duration}</td>
                        <td>{s.minSqm} sqm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.mobileCards} aria-label="Service catalog cards">
                {SERVICES.map(s => (
                  <article key={s.id} className={styles.adminCard}>
                    <div className={styles.cardTop}>
                      <div>
                        <div className={styles.cardEyebrow}>{s.type}</div>
                        <div className={styles.cardTitle}>{s.name}</div>
                      </div>
                    </div>
                    <div className={styles.cardRows}>
                      <div><span>Material Cost</span><strong>{formatPHP(s.baseCostPerSqm.materials)} / sqm</strong></div>
                      <div><span>Labor</span><strong>{formatPHP(s.baseCostPerSqm.labor)} / sqm</strong></div>
                      <div><span>Duration</span><strong>{s.duration}</strong></div>
                      <div><span>Min Area</span><strong>{s.minSqm} sqm</strong></div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === 'users' && (
            <>
              <div className={styles.tableWrap}>
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th></tr></thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td className={styles.emptyCell} colSpan={4}>No users are registered.</td></tr>
                    ) : (
                      users.map(u => (
                        <tr key={normalizeEmail(u.email) || `user-${u.id}`}>
                          <td className={styles.keyCell}>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className={`status-pill ${u.role === 'admin' ? 's-confirmed' : u.role === 'engineer' ? 's-ongoing' : 's-completed'}`}>{formatLabel(u.role)}</span></td>
                          <td className={styles.mutedCell}>{u.phone || 'Not provided'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className={styles.mobileCards} aria-label="User directory cards">
                {users.length === 0 ? (
                  <div className={styles.mobileEmpty}>No users are registered.</div>
                ) : (
                  users.map(u => (
                    <article key={normalizeEmail(u.email) || `user-card-${u.id}`} className={styles.adminCard}>
                      <div className={styles.cardTop}>
                        <div>
                          <div className={styles.cardEyebrow}>{u.email}</div>
                          <div className={styles.cardTitle}>{u.name}</div>
                        </div>
                        <span className={`status-pill ${u.role === 'admin' ? 's-confirmed' : u.role === 'engineer' ? 's-ongoing' : 's-completed'}`}>{formatLabel(u.role)}</span>
                      </div>
                      <div className={styles.cardRows}>
                        <div><span>Phone</span><strong>{u.phone || 'Not provided'}</strong></div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
