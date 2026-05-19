'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import styles from './Hero.module.css';

export default function Hero() {
  const { showPage } = useApp();

  return (
    <div className={styles.hero}>
      <div className={styles.grid}></div>
      <div className={styles.inner} style={{ animation: 'fadeUp .5s cubic-bezier(0.25,0.46,0.45,0.94) both' }}>
        <div>
          <div className={styles.eyebrow}>Trusted Construction Partner</div>
          <h1 className={styles.heading}>Build Your <em className={styles.em}>Vision</em><br />With Expert Hands</h1>
          <p className={styles.sub}>From house construction to commercial renovation — transparent pricing, licensed engineers, and quality materials. Know your cost before you commit.</p>
          <div className={styles.stats}>
            <div><div className={styles.statVal}>250+</div><div className={styles.statLbl}>Projects Done</div></div>
            <div><div className={styles.statVal}>40+</div><div className={styles.statLbl}>Engineers</div></div>
            <div><div className={styles.statVal}>98%</div><div className={styles.statLbl}>Satisfaction</div></div>
          </div>
          <div className={styles.actions}>
            <button className="btn btn-gold" onClick={() => showPage('booking')}>Book a Project</button>
            <button className="btn btn-outline" onClick={() => showPage('services')}>View Costs & Materials</button>
          </div>
        </div>
        <QuickEstimateCard />
      </div>
    </div>
  );
}

function QuickEstimateCard() {
  const { showPage } = useApp();
  const [selectedService, setSelectedService] = useState('');
  const [area, setArea] = useState('');

  const service = SERVICES.find(s => s.id === selectedService);

  const mat = service && area ? service.baseCostPerSqm.materials * Number(area) : 0;
  const labor = service && area ? service.baseCostPerSqm.labor * Number(area) : 0;
  const total = mat + labor;

  return (
    <div className={styles.card}>
      <div className={styles.cardBefore}>BOOK NOW</div>
      <div className={styles.cardTitle}>Quick Estimate</div>
      <div className={styles.field}>
        <label className={styles.label}>Service Type</label>
        <select className={styles.select} value={selectedService} onChange={e => setSelectedService(e.target.value)}>
          <option value="">— Select Service —</option>
          {SERVICES.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Floor Area (sqm)</label>
        <input className={styles.input} type="number" placeholder="e.g. 80" value={area} onChange={e => setArea(e.target.value)} />
      </div>
      {selectedService && area && Number(area) > 0 && (
        <div className={styles.result}>
          <div className={styles.resultTitle}>Estimated Cost</div>
          <div className={styles.resultRow}><span>Materials</span><span>₱{mat.toLocaleString()}</span></div>
          <div className={styles.resultRow}><span>Labor</span><span>₱{labor.toLocaleString()}</span></div>
          <div className={styles.resultTotal}><span>Total</span><span>₱{total.toLocaleString()}</span></div>
        </div>
      )}
      <button className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} onClick={() => showPage('booking')}>
        Proceed to Full Booking →
      </button>
    </div>
  );
}
