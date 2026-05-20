'use client';

import { useState } from 'react';
import { SERVICES } from '@/data/services';
import { calcCost, formatPHP } from '@/utils/costing';
import Reveal from './Reveal';
import styles from './CostEstimator.module.css';

export default function CostEstimator() {
  const [serviceId, setServiceId] = useState('');
  const [area, setArea] = useState('');
  const [grade, setGrade] = useState<'standard' | 'premium' | 'economy'>('standard');
  const [duration, setDuration] = useState<'normal' | 'rush'>('normal');

  const service = SERVICES.find(s => s.id === serviceId);
  const cost = service && area && Number(area) > 0 ? calcCost(service, Number(area), 1, grade, duration) : null;

  return (
    <Reveal className="section" style={{ marginTop: '-2rem' }}>
      <div className="section-tag">Cost Estimator</div>
      <div className="section-title">Calculate Your Budget</div>
      <p className="section-sub">Enter your project details to get an instant cost estimate breakdown.</p>
      <Reveal className={styles.wrap} variant="card" delay={90}>
        <div className={styles.grid}>
          <div>
            <div className={styles.colTitle}>Project Details</div>
            <div className={styles.field}>
              <label className={styles.label}>Service Type</label>
              <select className={styles.select} value={serviceId} onChange={e => setServiceId(e.target.value)}>
                <option value="">— Select —</option>
                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Floor Area (sqm)</label>
              <input className={styles.input} type="number" placeholder="e.g. 100" value={area} onChange={e => setArea(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Material Grade</label>
              <select className={styles.select} value={grade} onChange={e => setGrade(e.target.value as typeof grade)}>
                <option value="standard">Standard</option>
                <option value="premium">Premium (+30%)</option>
                <option value="economy">Economy (-20%)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Project Duration</label>
              <select className={styles.select} value={duration} onChange={e => setDuration(e.target.value as typeof duration)}>
                <option value="normal">Normal Timeline</option>
                <option value="rush">Rush (+20% labor)</option>
              </select>
            </div>
          </div>
          <div>
            <div className={styles.colTitle}>Cost Breakdown</div>
            {cost ? (
              <div className={styles.result}>
                <div className={styles.resultTitle}>Cost Breakdown</div>
                <div className={styles.line}>
                  <span className={styles.lineLabel}>Materials ({area} sqm)</span>
                  <span className={styles.lineVal}>{formatPHP(cost.mat)}</span>
                </div>
                <div className={styles.line}>
                  <span className={styles.lineLabel}>Labor</span>
                  <span className={styles.lineVal}>{formatPHP(cost.labor)}</span>
                </div>
                {cost.fixed > 0 && (
                  <div className={styles.line}>
                    <span className={styles.lineLabel}>Fixed Installations</span>
                    <span className={styles.lineVal}>{formatPHP(cost.fixed)}</span>
                  </div>
                )}
                <div className={styles.line}>
                  <span className={styles.lineLabel}>VAT (12%)</span>
                  <span className={styles.lineVal}>{formatPHP(cost.vat)}</span>
                </div>
                <div className={`${styles.line} ${styles.total}`}>
                  <span>Total Estimate</span>
                  <span>{formatPHP(cost.total)}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '1rem 0' }}>
                Select a service and enter floor area to see cost estimate.
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </Reveal>
  );
}
