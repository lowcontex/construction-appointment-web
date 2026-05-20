'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPHP } from '@/utils/costing';
import Reveal from './Reveal';
import styles from './EngineerGrid.module.css';

function initials(name: string): string {
  const p = name.split(' ');
  return ((p[1]?.[0] || '') + (p[2]?.[0] || '')).toUpperCase() || 'EN';
}

const specs = ['All', 'Civil', 'Structural', 'Electrical', 'Mechanical'];

export default function EngineerGrid() {
  const { engineers, showPage } = useApp();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? engineers : engineers.filter(e => e.spec === filter);

  return (
    <Reveal className="section">
      <div className="section-tag">Our Team</div>
      <div className="section-title">Meet Our Licensed Engineers</div>
      <p className="section-sub">All engineers are PRC-licensed, experienced, and vetted by our team. Pick the right expert for your project.</p>
      <div className={styles.filters}>
        {specs.map(s => (
          <button
            key={s}
            className={`btn btn-outline btn-sm ${filter === s ? styles.activeFilter : ''}`}
            style={filter === s ? { borderColor: 'var(--brand)', color: 'var(--brand)' } : undefined}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {filtered.map((e, i) => (
          <Reveal key={e.id} className={styles.card} variant="card" delay={i * 70}>
            <div className={styles.avatar}>
              <div className={styles.avatarInitial}>{initials(e.name)}</div>
              <span className={`${styles.badge} ${e.status === 'available' ? 'badge-available' : 'badge-busy'}`}>
                {e.status}
              </span>
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{e.name}</div>
              <div className={styles.spec}>{e.spec} Engineering</div>
              <div className={styles.exp}>{e.exp} experience</div>
              <div className={styles.rating}>
                ★ {e.rating} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({e.reviews} reviews)</span>
              </div>
              <div className={styles.skills}>
                {e.skills.map(sk => <span key={sk} className={styles.skill}>{sk}</span>)}
              </div>
            </div>
            <div className={styles.footer}>
              <div>
                <div className={styles.rate}>{formatPHP(e.rate)}</div>
                <div className={styles.rateLbl}>per day</div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => showPage('booking')}>Hire</button>
            </div>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
