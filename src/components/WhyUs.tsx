'use client';

import styles from './WhyUs.module.css';

const features = [
  { icon: '📋', title: 'Full Cost Breakdown', desc: 'See exactly what materials and labor cost before signing anything. No hidden fees, ever.' },
  { icon: '👷', title: 'Licensed Engineers', desc: 'All engineers are PRC-licensed and background-checked. You pick who handles your project.' },
  { icon: '🏗️', title: 'Quality Materials', desc: 'We source only from accredited suppliers. Premium and standard options available.' },
  { icon: '📅', title: 'Online Booking', desc: 'Book anytime, track your project status, and communicate with your engineer — all online.' },
  { icon: '🔒', title: 'Insured Projects', desc: 'Every project is covered by contractor\'s liability insurance. Your investment is protected.' },
  { icon: '⭐', title: 'Guaranteed Work', desc: 'Workmanship warranty on all completed projects. We stand behind every nail we drive.' },
];

export default function WhyUs() {
  return (
    <div className="section">
      <div className="section-tag">Why Choose Us</div>
      <div className="section-title">Built on Trust & Transparency</div>
      <div className={styles.grid}>
        {features.map((f, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.icon}>{f.icon}</div>
            <div className={styles.title}>{f.title}</div>
            <div className={styles.desc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
