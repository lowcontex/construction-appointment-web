'use client';

import { useApp } from '@/context/AppContext';
import Reveal from '@/components/Reveal';
import styles from './SuccessPage.module.css';

export default function SuccessPage() {
  const { successRef, showPage } = useApp();

  return (
    <Reveal className={styles.wrap}>
      <div className={styles.mark}>BK</div>
      <div className={styles.title}>Booking Submitted!</div>
      <p className={styles.message}>
        Your project booking has been received. Our team will review and confirm within 24 hours.
      </p>
      <div className={styles.reference}>
        {successRef || 'Booking Reference: BK-000'}
      </div>
      <p className={styles.note}>
        Save this reference number for follow-up with our team.
      </p>
      <div className={styles.actions}>
        <button className="btn btn-gold" onClick={() => showPage('home')}>Back to Home</button>
        <button className="btn btn-outline" onClick={() => showPage('booking')}>Book Another Project</button>
      </div>
    </Reveal>
  );
}
