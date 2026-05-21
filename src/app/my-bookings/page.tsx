'use client';

import { useApp } from '@/context/AppContext';
import styles from '@/components/DashboardPage.module.css';
import { formatPHP } from '@/utils/costing';
import Reveal from '@/components/Reveal';

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
      <Reveal className={styles.heroSurface}>
        <div>
          <div className={styles.kicker}>Customer Dashboard</div>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>Track every project request, engineer assignment, estimate, and booking status from one clear view.</p>
        </div>
        <div className={styles.heroActions}>
          <button className="btn btn-gold" type="button" onClick={() => showPage('booking')}>Book Another Project</button>
        </div>
      </Reveal>

      <div className={styles.summaryGrid}>
        <Reveal className={styles.metric} variant="card" delay={40}>
          <div className={styles.metricLabel}>Bookings</div>
          <div className={styles.metricValue}>{mine.length}</div>
          <div className={styles.metricSub}>total requests</div>
        </Reveal>
        <Reveal className={styles.metric} variant="card" delay={80}>
          <div className={styles.metricLabel}>Active</div>
          <div className={styles.metricValue}>{active}</div>
          <div className={styles.metricSub}>pending or in progress</div>
        </Reveal>
        <Reveal className={styles.metric} variant="card" delay={120}>
          <div className={styles.metricLabel}>Estimated Value</div>
          <div className={styles.metricValue}>{formatPHP(totalValue)}</div>
          <div className={styles.metricSub}>{completed} completed</div>
        </Reveal>
      </div>

      <Reveal className={styles.tableSection} delay={100}>
        <div className={styles.tableHeader}>
          <div>
            <div className={styles.tableTitle}>Project Requests</div>
            <p className={styles.tableDesc}>Each booking card shows the work type, engineer, date, status, and estimated value.</p>
          </div>
          <div className={styles.panelCount}>{mine.length} Total</div>
        </div>

        {mine.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>No bookings yet</div>
            Start a project request to see estimates, engineer assignments, and status updates here.
            <div className={styles.emptyActions}>
              <button className="btn btn-gold" type="button" onClick={() => showPage('booking')}>Start Booking</button>
              <button className="btn btn-outline" type="button" onClick={() => showPage('services')}>View Services</button>
            </div>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {mine.map(b => (
              <article key={b.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div>
                    <div className={styles.bookingId}>{b.id}</div>
                    <div className={styles.bookingTitle}>{b.service}</div>
                  </div>
                  <span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
                <div className={styles.bookingGrid}>
                  <div>
                    <span className={styles.fieldLabel}>Engineer</span>
                    <span className={styles.fieldValue}>{b.engineer}</span>
                  </div>
                  <div>
                    <span className={styles.fieldLabel}>Start Date</span>
                    <span className={styles.fieldValue}>{b.date}</span>
                  </div>
                  <div>
                    <span className={styles.fieldLabel}>Area</span>
                    <span className={styles.fieldValue}>{b.area} sqm</span>
                  </div>
                  <div>
                    <span className={styles.fieldLabel}>Estimate</span>
                    <span className={styles.fieldValue}>{formatPHP(b.total)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Reveal>

      <div className={styles.mobileCards} aria-label="My booking cards">
        {mine.length === 0 ? (
          <Reveal className={styles.emptyCard} variant="card" delay={140}>No bookings yet.</Reveal>
        ) : (
          mine.map((b, i) => (
            <Reveal key={b.id} className={styles.bookingCard} variant="card" delay={80 + i * 50}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.cardEyebrow}>{b.id}</div>
                  <div className={styles.cardTitle}>{b.service}</div>
                </div>
                <span className={`status-pill s-${b.status.toLowerCase()}`}>{b.status}</span>
              </div>
              <div className={styles.cardRows}>
                <div><span>Engineer</span><strong>{b.engineer}</strong></div>
                <div><span>Area</span><strong>{b.area} sqm</strong></div>
                <div><span>Total</span><strong>{formatPHP(b.total)}</strong></div>
                <div><span>Date</span><strong>{b.date}</strong></div>
              </div>
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
