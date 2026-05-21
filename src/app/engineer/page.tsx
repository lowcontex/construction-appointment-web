'use client';

import { useApp } from '@/context/AppContext';
import styles from '@/components/DashboardPage.module.css';
import Reveal from '@/components/Reveal';

export default function EngineerDashboardPage() {
  const { currentUser, bookings, showPage } = useApp();

  if (!currentUser) {
    return (
      <div className={styles.guard}>
        <div className={styles.guardCard}>
          <div className={styles.guardTitle}>Engineer Access</div>
          <p className={styles.guardText}>Please log in to view your dashboard.</p>
          <button className="btn btn-gold" onClick={() => showPage('home')}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'engineer') {
    return (
      <div className={styles.guard}>
        <div className={styles.guardCard}>
          <div className={styles.guardTitle}>Access Denied</div>
          <p className={styles.guardText}>This page is for engineers only.</p>
          <button className="btn btn-outline" onClick={() => showPage('home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const firstName = currentUser.name.trim().split(/\s+/)[0] ?? '';
  const assigned = firstName ? bookings.filter(b => b.engineer.includes(firstName)) : [];
  const activeAssigned = assigned.filter(b => b.status === 'Confirmed' || b.status === 'Ongoing');
  const pendingAssigned = assigned.filter(b => b.status === 'Pending').length;
  const completed = assigned.filter(b => b.status === 'Completed').length;

  return (
    <div className={styles.shell}>
      <Reveal className={styles.heroSurface}>
        <div>
          <div className={styles.kicker}>Engineer Dashboard</div>
          <h1 className={styles.title}>Welcome, {currentUser.name}</h1>
          <p className={styles.subtitle}>Track assigned projects, upcoming work, and client details from a compact field-ready view.</p>
        </div>
        <div className={styles.heroActions}>
          <button className="btn btn-outline" type="button" onClick={() => showPage('home')}>Back to Home</button>
        </div>
      </Reveal>

      <div className={styles.summaryGrid}>
        <Reveal className={styles.metric} variant="card" delay={40}>
          <div className={styles.metricLabel}>Assigned</div>
          <div className={styles.metricValue}>{assigned.length}</div>
          <div className={styles.metricSub}>total projects</div>
        </Reveal>
        <Reveal className={styles.metric} variant="card" delay={80}>
          <div className={styles.metricLabel}>Active Work</div>
          <div className={styles.metricValue}>{activeAssigned.length}</div>
          <div className={styles.metricSub}>confirmed or ongoing</div>
        </Reveal>
        <Reveal className={styles.metric} variant="card" delay={120}>
          <div className={styles.metricLabel}>Completed</div>
          <div className={styles.metricValue}>{completed}</div>
          <div className={styles.metricSub}>{pendingAssigned} pending review</div>
        </Reveal>
      </div>

      <div className={styles.workspace}>
        <Reveal className={styles.panel} variant="card" delay={80}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Active Work</div>
              <p className={styles.panelDesc}>Projects that need field attention now.</p>
            </div>
            <div className={styles.panelCount}>{activeAssigned.length} Active</div>
          </div>
          <div className={styles.workList}>
            {activeAssigned.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No active assignments</div>
                Confirmed or ongoing projects will appear here when an admin updates the booking status.
              </div>
            ) : (
              activeAssigned.map(b => (
                <div key={b.id} className={styles.workItem}>
                  <div className={styles.workItemHeader}>
                    <div>
                      <div className={styles.workTitle}>{b.service}</div>
                      <div className={styles.workSub}>{b.client}</div>
                    </div>
                    <span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className={styles.workMeta}>
                    <div>
                      <span className={styles.metaLabel}>Booking</span>
                      <span className={styles.metaValue}>{b.id}</span>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Start Date</span>
                      <span className={styles.metaValue}>{b.date}</span>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Area</span>
                      <span className={styles.metaValue}>{b.area} sqm</span>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Status</span>
                      <span className={styles.metaValue}>{b.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Reveal>

        <Reveal className={styles.tableSection} delay={120}>
          <div className={styles.tableHeader}>
            <div>
              <div className={styles.tableTitle}>Assignment Log</div>
              <p className={styles.tableDesc}>A complete list of projects currently tied to your engineer profile.</p>
            </div>
            <div className={styles.panelCount}>{assigned.length} Total</div>
          </div>
          <div className={styles.tableWrap}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Area</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assigned.length === 0 ? (
                  <tr>
                    <td className={styles.emptyCell} colSpan={6}>No assigned bookings yet.</td>
                  </tr>
                ) : (
                  assigned.map(b => (
                    <tr key={b.id}>
                      <td className={styles.keyCell}>{b.id}</td>
                      <td>{b.client}</td>
                      <td>{b.service}</td>
                      <td>{b.area} sqm</td>
                      <td className={styles.mutedCell}>{b.date}</td>
                      <td><span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.mobileCards} aria-label="Assigned booking cards">
            {assigned.length === 0 ? (
              <div className={styles.emptyCard}>No assigned bookings yet.</div>
            ) : (
              assigned.map(b => (
                <article key={b.id} className={styles.bookingCard}>
                  <div className={styles.cardTop}>
                    <div>
                      <div className={styles.cardEyebrow}>{b.id}</div>
                      <div className={styles.cardTitle}>{b.service}</div>
                    </div>
                    <span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className={styles.cardRows}>
                    <div><span>Client</span><strong>{b.client}</strong></div>
                    <div><span>Area</span><strong>{b.area} sqm</strong></div>
                    <div><span>Date</span><strong>{b.date}</strong></div>
                  </div>
                </article>
              ))
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
