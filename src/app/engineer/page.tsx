'use client';

import { useApp } from '@/context/AppContext';
import styles from '@/components/DashboardPage.module.css';

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
  const active = assigned.filter(b => b.status === 'Confirmed' || b.status === 'Ongoing').length;
  const completed = assigned.filter(b => b.status === 'Completed').length;

  return (
    <div className={styles.shell}>
      <div className={styles.hero}>
        <div>
          <div className={styles.kicker}>Engineer Dashboard</div>
          <h1 className={styles.title}>Assigned Bookings</h1>
          <p className={styles.subtitle}>View project requests assigned to you and track their current status.</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Assigned</div>
          <div className={styles.metricValue}>{assigned.length}</div>
          <div className={styles.metricSub}>total projects</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Active</div>
          <div className={styles.metricValue}>{active}</div>
          <div className={styles.metricSub}>confirmed or ongoing</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Completed</div>
          <div className={styles.metricValue}>{completed}</div>
          <div className={styles.metricSub}>closed projects</div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Client</th>
              <th>Service</th>
              <th>Area (sqm)</th>
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
                  <td>{b.area}</td>
                  <td className={styles.mutedCell}>{b.date}</td>
                  <td><span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
