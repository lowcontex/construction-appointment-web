'use client';

import { useApp } from '@/context/AppContext';

export default function SuccessPage() {
  const { successRef, showPage } = useApp();

  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
      <div style={{
        fontFamily: 'var(--font-head)', fontSize: '2.8rem', fontWeight: 800,
        color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.8rem',
      }}>
        Booking Submitted!
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.8', marginBottom: '.7rem' }}>
        Your project booking has been received. Our team will review and confirm within 24 hours.
      </p>
      <div style={{
        fontFamily: 'var(--font-head)', fontSize: '1.5rem',
        color: 'var(--gold)', margin: '1.5rem 0',
      }}>
        {successRef || 'Booking Reference: BK-000'}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '2rem' }}>
        Track your booking status in the Admin Dashboard.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-gold" onClick={() => showPage('home')}>Back to Home</button>
        <button className="btn btn-outline" onClick={() => showPage('admin')}>View Dashboard</button>
      </div>
    </div>
  );
}
