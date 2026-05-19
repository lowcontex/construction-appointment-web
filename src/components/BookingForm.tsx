'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import { calcCost, formatPHP } from '@/utils/costing';
import styles from './BookingForm.module.css';

export default function BookingForm() {
  const { booking, setBooking, bookings, setBookings, engineers, currentUser, showToast, showPage, setSuccessRef, openModal } = useApp();
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bArea, setBArea] = useState('');
  const [floors, setFloors] = useState('1');
  const [grade, setGrade] = useState<'standard' | 'premium' | 'economy'>('standard');
  const [date, setDate] = useState('');
  const [timeline, setTimeline] = useState<'normal' | 'rush'>('normal');
  const [notes, setNotes] = useState('');

  const selectedService = SERVICES.find(s => s.id === booking.service);
  const selectedEngineer = engineers.find(e => e.id === booking.engineer);
  const cost = selectedService && bArea && Number(bArea) > 0
    ? calcCost(selectedService, Number(bArea), Number(floors) || 1, grade, timeline)
    : null;

  const nextStep = () => {
    if (step === 1 && !booking.service) { showToast('Please select a service.', '⚠️'); return; }
    if (step === 2) {
      if (!name || !bArea || !address) { showToast('Please fill in all required fields.', '⚠️'); return; }
    }
    if (step === 3 && !booking.engineer) { showToast('Please select an engineer.', '⚠️'); return; }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const confirmBooking = () => {
    if (!currentUser) { showToast('Please login to confirm booking', '⚠️'); openModal('login'); return; }
    if (!selectedService || !selectedEngineer) return;
    const id = 'BK-' + String(bookings.length + 1).padStart(3, '0');
    setBookings(prev => [{
      id, client: name || currentUser.name, service: selectedService.name,
      engineer: selectedEngineer.name, area: Number(bArea), total: Math.round(cost?.total || 0),
      status: 'Pending', date: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    setSuccessRef('Booking Reference: ' + id);
    setBooking({ service: null, engineer: null });
    showPage('success');
    showToast('Booking submitted successfully! 🎉', '✅');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Book a Project</div>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '2.5rem' }}>
        Fill in your project details and get a full cost estimate before confirming.
      </p>

      <div className={styles.steps}>
        {['Service', 'Details', 'Engineer', 'Confirm'].map((label, i) => {
          const num = i + 1;
          return (
            <div key={num} className={`${styles.step} ${num === step ? styles.active : ''} ${num < step ? styles.done : ''}`}>
              <div className={styles.circle}>{num < step ? '✓' : num}</div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}><span>🏗️</span>Select Service</div>
            <div className={styles.picker}>
              {SERVICES.map(s => (
                <div
                  key={s.id}
                  className={`${styles.pick} ${booking.service === s.id ? styles.selected : ''}`}
                  onClick={() => setBooking(prev => ({ ...prev, service: s.id }))}
                >
                  <div className={styles.pickIcon}>{s.icon}</div>
                  <div className={styles.pickName}>{s.name}</div>
                  <div className={styles.pickPrice}>{formatPHP(s.baseCostPerSqm.materials)}/sqm mat.</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.nav}><div /><button className="btn btn-gold" onClick={nextStep}>Next: Project Details →</button></div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}><span>📋</span>Project Details</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Juan Dela Cruz" /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" /></div>
              <div className="form-group form-full"><label className="form-label">Project Address</label><input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete address" /></div>
              <div className="form-group"><label className="form-label">Floor Area (sqm)</label><input className="form-input" type="number" value={bArea} onChange={e => setBArea(e.target.value)} placeholder="e.g. 80" /></div>
              <div className="form-group"><label className="form-label">No. of Floors</label><select className="form-select" value={floors} onChange={e => setFloors(e.target.value)}><option value="1">1 Floor</option><option value="2">2 Floors</option><option value="3">3 Floors</option></select></div>
              <div className="form-group"><label className="form-label">Material Grade</label>
                <select className="form-select" value={grade} onChange={e => setGrade(e.target.value as typeof grade)}>
                  <option value="standard">Standard</option><option value="premium">Premium (+30%)</option><option value="economy">Economy (-20%)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Preferred Start Date</label><input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Timeline</label>
                <select className="form-select" value={timeline} onChange={e => setTimeline(e.target.value as typeof timeline)}>
                  <option value="normal">Normal</option><option value="rush">Rush (+20% labor)</option>
                </select>
              </div>
              <div className="form-group form-full"><label className="form-label">Additional Notes</label><textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements, existing structures, etc." /></div>
            </div>
            {cost && (
              <div className="cost-summary">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--sky)', fontWeight: 700, marginBottom: '.7rem' }}>Estimated Project Cost</div>
                <div className="cs-row"><span className="cs-label">Materials ({cost.totalArea} sqm)</span><span className="cs-val">{formatPHP(cost.mat)}</span></div>
                <div className="cs-row"><span className="cs-label">Labor</span><span className="cs-val">{formatPHP(cost.labor)}</span></div>
                {cost.fixed > 0 && <div className="cs-row"><span className="cs-label">Fixed Installations</span><span className="cs-val">{formatPHP(cost.fixed)}</span></div>}
                <div className="cs-row"><span className="cs-label">VAT (12%)</span><span className="cs-val">{formatPHP(cost.vat)}</span></div>
                <div className="cs-row"><span>Total Estimate</span><span>{formatPHP(cost.total)}</span></div>
                <div className="cs-note">* Final cost subject to site inspection.</div>
              </div>
            )}
          </div>
          <div className={styles.nav}>
            <button className="btn btn-outline" onClick={prevStep}>← Back</button>
            <button className="btn btn-gold" onClick={nextStep}>Next: Choose Engineer →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}><span>👷</span>Select Engineer</div>
            <div className={styles.picker}>
              {engineers.map(e => (
                <div
                  key={e.id}
                  className={`${styles.engPick} ${booking.engineer === e.id ? styles.selected : ''}`}
                  onClick={() => setBooking(prev => ({ ...prev, engineer: e.id }))}
                >
                  <div className={styles.engPickAvatar}>{e.avatar}</div>
                  <div className={styles.pickName}>{e.name}</div>
                  <div className={styles.engPickSpec}>{e.spec}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>★ {e.rating} · {e.exp}</div>
                  <div className={styles.pickPrice}>{formatPHP(e.rate)}/day</div>
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    <span className={e.status === 'available' ? 'badge-available' : 'badge-busy'} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{e.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.nav}>
            <button className="btn btn-outline" onClick={prevStep}>← Back</button>
            <button className="btn btn-gold" onClick={nextStep}>Review & Confirm →</button>
          </div>
        </div>
      )}

      {step === 4 && selectedService && selectedEngineer && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}><span>✅</span>Review Your Booking</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--sky)', fontWeight: 700, marginBottom: '.8rem' }}>Client Info</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Name:</span> {name}</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Phone:</span> {phone || '—'}</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Address:</span> {address}</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Start Date:</span> {date || 'TBD'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--sky)', fontWeight: 700, marginBottom: '.8rem' }}>Project Info</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Service:</span> {selectedService.icon} {selectedService.name}</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Area:</span> {bArea} sqm × {floors} floor(s)</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Grade:</span> {grade.charAt(0).toUpperCase() + grade.slice(1)}</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}><span style={{ color: 'var(--muted)' }}>Engineer:</span> {selectedEngineer.avatar} {selectedEngineer.name}</div>
              </div>
            </div>
            {notes && (
              <div style={{ marginTop: '1rem', fontSize: '13px', color: 'var(--muted)', padding: '.75rem', background: 'var(--slate)', borderRadius: 'var(--r)', border: '1px solid var(--mid)' }}>
                📝 {notes}
              </div>
            )}
            {cost && (
              <div className="cost-summary" style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)', fontWeight: 700, marginBottom: '.7rem' }}>Final Cost Summary</div>
                <div className="cs-row"><span className="cs-label">Materials</span><span className="cs-val">{formatPHP(cost.mat)}</span></div>
                <div className="cs-row"><span className="cs-label">Labor</span><span className="cs-val">{formatPHP(cost.labor)}</span></div>
                {cost.fixed > 0 && <div className="cs-row"><span className="cs-label">Fixed Installations</span><span className="cs-val">{formatPHP(cost.fixed)}</span></div>}
                <div className="cs-row"><span className="cs-label">VAT (12%)</span><span className="cs-val">{formatPHP(cost.vat)}</span></div>
                <div className="cs-row"><span style={{ color: 'var(--gold)' }}>TOTAL ESTIMATE</span><span style={{ color: 'var(--gold)', fontFamily: 'var(--font-head)', fontSize: '1.4rem' }}>{formatPHP(cost.total)}</span></div>
                <div className="cs-note">* Estimate includes materials, labor, and VAT. Subject to final site assessment.</div>
              </div>
            )}
          </div>
          <div className={styles.nav}>
            <button className="btn btn-outline" onClick={prevStep}>← Back</button>
            <button className="btn btn-gold" onClick={confirmBooking}>Confirm & Submit Booking ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}
