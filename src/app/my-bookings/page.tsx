'use client';

import { useApp } from '@/context/AppContext';
import styles from '@/components/DashboardPage.module.css';
import { formatPHP } from '@/utils/costing';

export default function MyBookingsPage() {
  const { currentUser, bookings, showPage } = useApp();

  if (!currentUser) {
    return (
      <div className={styles.guard}>
        <div className={styles.guardCard}>
          <div className={styles.guardTitle}>My Bookings</div>
          <p className={styles.guardText}>Please log in to view your bookings.</p>
          <button className="btn btn-gold" onClick={() => showPage('home')}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'customer') {
    return (
      <div className={styles.guard}>
        <div className={styles.guardCard}>
          <div className={styles.guardTitle}>Access Denied</div>
          <p className={styles.guardText}>This page is for customers only.</p>
          <button className="btn btn-outline" onClick={() => showPage('home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const mine = bookings.filter(b => b.customerEmail === currentUser.email);
  const active = mine.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Ongoing').length;
  const completed = mine.filter(b => b.status === 'Completed').length;
  const totalValue = mine.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className={styles.shell}>
      <div className={styles.hero}>
        <div>
          <div className={styles.kicker}>Customer Dashboard</div>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>Track your project requests, assigned engineers, dates, and booking status.</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Bookings</div>
          <div className={styles.metricValue}>{mine.length}</div>
          <div className={styles.metricSub}>total requests</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Active</div>
          <div className={styles.metricValue}>{active}</div>
          <div className={styles.metricSub}>pending or in progress</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Estimated Value</div>
          <div className={styles.metricValue}>{formatPHP(totalValue)}</div>
          <div className={styles.metricSub}>{completed} completed</div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Service</th>
              <th>Engineer</th>
              <th>Area (sqm)</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={7}>No bookings yet.</td>
              </tr>
            ) : (
              mine.map(b => (
                <tr key={b.id}>
                  <td className={styles.keyCell}>{b.id}</td>
                  <td>{b.service}</td>
                  <td>{b.engineer}</td>
                  <td>{b.area}</td>
                  <td className={styles.moneyCell}>{formatPHP(b.total)}</td>
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
