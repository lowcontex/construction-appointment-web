'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import styles from './Hero.module.css';

export default function Hero() {
  const { showPage } = useApp();

  return (
    <div className={styles.hero}>
      <Image
        className={styles.heroImage}
        src="/img/hero-construction-site.webp"
        alt=""
        fill
        priority
        quality={76}
        sizes="100vw"
      />
      <div className={styles.grid}></div>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.eyebrow}>Trusted Construction Partner</div>
          <h1 className={styles.heading}>Build Your <em className={styles.em}>Vision</em><br />With Expert Hands</h1>
          <p className={styles.sub}>From house construction to commercial renovation with transparent pricing, licensed engineers, and quality materials. Know your cost before you commit.</p>
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
  const { showPage, setBooking } = useApp();
  const [selectedService, setSelectedService] = useState('');
  const [area, setArea] = useState('');

  const service = SERVICES.find(s => s.id === selectedService);
  const areaValue = Math.max(0, Number(area) || 0);

  const mat = service && areaValue > 0 ? service.baseCostPerSqm.materials * areaValue : 0;
  const labor = service && areaValue > 0 ? service.baseCostPerSqm.labor * areaValue : 0;
  const total = mat + labor;
  const continueToBooking = () => {
    if (selectedService) {
      setBooking(prev => ({ ...prev, service: selectedService }));
    }
    showPage('booking');
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Quick Estimate</div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="quick-estimate-service">Service Type</label>
        <select id="quick-estimate-service" className={styles.select} value={selectedService} onChange={e => setSelectedService(e.target.value)}>
          <option value="">Select Service</option>
          {SERVICES.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="quick-estimate-area">Floor Area (sqm)</label>
        <input id="quick-estimate-area" className={styles.input} type="number" min="1" max="10000" inputMode="numeric" placeholder="e.g. 80" value={area} onChange={e => setArea(e.target.value)} />
      </div>
      {selectedService && areaValue > 0 && (
        <div className={styles.result}>
          <div className={styles.resultTitle}>Estimated Cost</div>
          <div className={styles.resultRow}><span>Materials</span><span>PHP {mat.toLocaleString()}</span></div>
          <div className={styles.resultRow}><span>Labor</span><span>PHP {labor.toLocaleString()}</span></div>
          <div className={styles.resultTotal}><span>Total</span><span>PHP {total.toLocaleString()}</span></div>
        </div>
      )}
      <button className={`btn btn-gold ${styles.fullButton}`} type="button" onClick={continueToBooking}>
        Proceed to Full Booking
      </button>
    </div>
  );
}
