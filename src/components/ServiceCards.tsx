'use client';

import { SERVICES } from '@/data/services';
import { formatPHP } from '@/utils/costing';
import { useApp } from '@/context/AppContext';
import Reveal from './Reveal';
import styles from './ServiceCards.module.css';

export default function ServiceCards() {
  const { showPage, setBooking } = useApp();

  const bookService = (serviceId: string) => {
    setBooking(prev => ({ ...prev, service: serviceId }));
    showPage('booking');
  };

  return (
    <Reveal className="section">
      <div className="section-tag">Services & Pricing</div>
      <div className="section-title">Transparent Costs, No Surprises</div>
      <p className="section-sub">Every service includes a detailed materials list and labor estimate. Actual cost depends on floor area and specifications.</p>
      <div className={styles.grid}>
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} variant="card" delay={i * 70}>
            <button
              type="button"
              className={styles.card}
              onClick={() => bookService(s.id)}
              aria-label={`Book ${s.name}`}
            >
              <div className={styles.top}>
                <div className={styles.type}>{s.type}</div>
                <div className={styles.name}>{s.name}</div>
                <div className={styles.desc}>{s.desc}</div>
              </div>
              <div className={styles.body}>
                <div className={styles.materialsTitle}>Key Materials</div>
                {s.materials.slice(0, 5).map((m, i) => (
                  <div key={i} className={styles.materialRow}>
                    <span className={styles.matName}>{m.name}</span>
                    <span className={styles.matCost}>
                      {m.fixed ? `${formatPHP(m.fixed)} (fixed)` : `${formatPHP(m.unitCost)}/${m.unit}`}
                    </span>
                  </div>
                ))}
                <div className={styles.timeline}>Timeline: {s.duration}</div>
              </div>
              <div className={styles.footer}>
                <div>
                  <div className={styles.costLabel}>Materials / sqm</div>
                  <div className={styles.costRange}>{formatPHP(s.baseCostPerSqm.materials)}</div>
                  <div className={styles.costNote}>+ {formatPHP(s.baseCostPerSqm.labor)}/sqm labor</div>
                </div>
                <span className={styles.cta}>Book Now</span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
