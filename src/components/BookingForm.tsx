'use client';

import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICES } from '@/data/services';
import { calcCost, formatPHP } from '@/utils/costing';
import styles from './BookingForm.module.css';

const MIN_AREA = 1;
const MAX_AREA = 10000;
const DRAFT_KEY = 'booking-draft-v1';

function initials(name: string): string {
  const p = name.split(' ');
  return ((p[1]?.[0] || '') + (p[2]?.[0] || '')).toUpperCase() || 'EN';
}

function cleanText(value: string, maxLength = 180) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function nextBookingId(bookings: { id: string }[]) {
  const highest = bookings.reduce((max, booking) => {
    const numeric = Number(booking.id.replace(/^BK-/, ''));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);

  return 'BK-' + String(highest + 1).padStart(3, '0');
}

function handleRadioGroupKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(event.key)) return;

  const radios = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
  if (!radios.length) return;

  event.preventDefault();
  const activeIndex = radios.indexOf(document.activeElement as HTMLButtonElement);
  const fallbackIndex = radios.findIndex(radio => radio.getAttribute('aria-checked') === 'true');
  const currentIndex = activeIndex >= 0 ? activeIndex : Math.max(fallbackIndex, 0);
  let nextIndex = currentIndex;

  if (event.key === 'Home') nextIndex = 0;
  if (event.key === 'End') nextIndex = radios.length - 1;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % radios.length;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + radios.length) % radios.length;

  radios[nextIndex].focus();
  radios[nextIndex].click();
}

export default function BookingForm() {
  const { booking, setBooking, bookings, setBookings, engineers, currentUser, showToast, showPage, setSuccessRef, openModal, pendingAction, setPendingAction } = useApp();
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
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return;
    try {
      const draft = JSON.parse(stored);
      if (draft.step) setStep(draft.step);
      if (draft.name) setName(draft.name);
      if (draft.phone) setPhone(draft.phone);
      if (draft.address) setAddress(draft.address);
      if (draft.bArea) setBArea(draft.bArea);
      if (draft.floors) setFloors(draft.floors);
      if (draft.grade) setGrade(draft.grade);
      if (draft.date) setDate(draft.date);
      if (draft.timeline) setTimeline(draft.timeline);
      if (draft.notes) setNotes(draft.notes);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || name) return;
    setName(currentUser.name);
    if (!phone && currentUser.phone) setPhone(currentUser.phone);
  }, [currentUser, name, phone]);

  useEffect(() => {
    const draft = { step, name, phone, address, bArea, floors, grade, date, timeline, notes };
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // Draft persistence is a convenience; booking remains usable without it.
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [step, name, phone, address, bArea, floors, grade, date, timeline, notes]);

  const selectedService = SERVICES.find(s => s.id === booking.service);
  const selectedEngineer = engineers.find(e => e.id === booking.engineer);
  const cost = selectedService && bArea && Number(bArea) > 0
    ? calcCost(selectedService, Number(bArea), Number(floors) || 1, grade, timeline)
    : null;
  const hasDraft = Boolean(
    booking.service || booking.engineer || name || phone || address || bArea || date || notes ||
    step > 1 || floors !== '1' || grade !== 'standard' || timeline !== 'normal'
  );

  const nextStep = () => {
    if (step === 1 && !booking.service) { showToast('Please select a service.'); return; }
    if (step === 2) {
      const area = Number(bArea);
      if (!cleanText(name) || !cleanText(bArea) || !cleanText(address)) { showToast('Please fill in all required fields.'); return; }
      if (!Number.isFinite(area) || area < MIN_AREA || area > MAX_AREA) { showToast(`Area must be between ${MIN_AREA} and ${MAX_AREA} sqm.`); return; }
      if (date && date < today) { showToast('Start date cannot be in the past.'); return; }
    }
    if (step === 3 && !booking.engineer) { showToast('Please select an engineer.'); return; }
    if (step === 3 && selectedEngineer?.status !== 'available') { showToast('Please choose an available engineer.'); return; }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);
  const clearDraft = () => {
    setStep(1);
    setName(currentUser?.name || '');
    setPhone(currentUser?.phone || '');
    setAddress('');
    setBArea('');
    setFloors('1');
    setGrade('standard');
    setDate('');
    setTimeline('normal');
    setNotes('');
    setBooking({ service: null, engineer: null });
    localStorage.removeItem(DRAFT_KEY);
    showToast('Booking draft cleared.');
  };

  const confirmBooking = useCallback(() => {
    if (!currentUser) {
      setPendingAction('confirm-booking');
      showToast('Please register to confirm booking');
      openModal('register');
      return;
    }
    if (currentUser.role !== 'customer') { showToast('Only customers can submit bookings.'); return; }
    if (!selectedService || !selectedEngineer) return;
    if (selectedEngineer.status !== 'available') { showToast('Please choose an available engineer.'); return; }
    const area = Number(bArea);
    if (!Number.isFinite(area) || area < MIN_AREA || area > MAX_AREA || !cost) { showToast('Please review the project area and estimate.'); return; }
    if (date && date < today) { showToast('Start date cannot be in the past.'); return; }
    const id = nextBookingId(bookings);
    setBookings(prev => [{
      id, client: cleanText(name) || currentUser.name, service: selectedService.name,
      engineer: selectedEngineer.name, area, total: Math.round(cost.total),
      status: 'Pending', date: date || today, customerEmail: currentUser.email,
    }, ...prev]);
    setSuccessRef('Booking Reference: ' + id);
    setBooking({ service: null, engineer: null });
    localStorage.removeItem(DRAFT_KEY);
    showPage('success');
    showToast('Booking submitted successfully!');
  }, [bArea, bookings, cost, currentUser, date, name, openModal, selectedEngineer, selectedService, setBooking, setBookings, setPendingAction, setSuccessRef, showPage, showToast, today]);

  useEffect(() => {
    if (!currentUser || pendingAction !== 'confirm-booking') return;
    setPendingAction(null);
    confirmBooking();
  }, [confirmBooking, currentUser, pendingAction, setPendingAction]);

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <div>
          <div className={styles.title}>Book a Project</div>
          <p className={styles.subtitle}>
            Fill in your project details and get a full cost estimate before confirming.
          </p>
        </div>
        {hasDraft && (
          <button className={`btn btn-outline btn-sm ${styles.clearButton}`} type="button" onClick={clearDraft}>
            Clear Draft
          </button>
        )}
      </div>

      <div className={styles.steps} aria-label="Booking progress">
        {['Service', 'Details', 'Engineer', 'Confirm'].map((label, i) => {
          const num = i + 1;
          return (
            <div
              key={num}
              className={`${styles.step} ${num === step ? styles.active : ''} ${num < step ? styles.done : ''}`}
              aria-current={num === step ? 'step' : undefined}
            >
              <div className={styles.circle}>{num < step ? <span aria-hidden="true">&#10003;</span> : num}</div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Select Service</div>
            <div className={styles.picker} role="radiogroup" aria-label="Service options" onKeyDown={handleRadioGroupKeyDown}>
              {SERVICES.map(s => (
                <button
                  type="button"
                  key={s.id}
                  role="radio"
                  className={`${styles.pick} ${booking.service === s.id ? styles.selected : ''}`}
                  aria-checked={booking.service === s.id}
                  onClick={() => setBooking(prev => ({ ...prev, service: s.id }))}
                >
                  <span className={styles.pickIcon} aria-hidden="true"></span>
                  <span className={styles.pickName}>{s.name}</span>
                  <span className={styles.pickPrice}>{formatPHP(s.baseCostPerSqm.materials)}/sqm mat.</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.nav}>
            <div />
            <button className="btn btn-gold" type="button" onClick={nextStep}>Next: Project Details <span aria-hidden="true">&rarr;</span></button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Project Details</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label" htmlFor="booking-client-name">Full Name</label><input id="booking-client-name" className="form-input" autoComplete="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Juan Dela Cruz" /></div>
              <div className="form-group"><label className="form-label" htmlFor="booking-client-phone">Phone</label><input id="booking-client-phone" className="form-input" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" /></div>
              <div className="form-group form-full"><label className="form-label" htmlFor="booking-project-address">Project Address</label><input id="booking-project-address" className="form-input" autoComplete="street-address" required maxLength={180} value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete address" /></div>
              <div className="form-group"><label className="form-label" htmlFor="booking-floor-area">Floor Area (sqm)</label><input id="booking-floor-area" className="form-input" type="number" inputMode="numeric" min={MIN_AREA} max={MAX_AREA} required value={bArea} onChange={e => setBArea(e.target.value)} placeholder="e.g. 80" /></div>
              <div className="form-group"><label className="form-label" htmlFor="booking-floors">No. of Floors</label><select id="booking-floors" className="form-select" value={floors} onChange={e => setFloors(e.target.value)}><option value="1">1 Floor</option><option value="2">2 Floors</option><option value="3">3 Floors</option></select></div>
              <div className="form-group"><label className="form-label" htmlFor="booking-material-grade">Material Grade</label>
                <select id="booking-material-grade" className="form-select" value={grade} onChange={e => setGrade(e.target.value as typeof grade)}>
                  <option value="standard">Standard</option><option value="premium">Premium (+30%)</option><option value="economy">Economy (-20%)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label" htmlFor="booking-start-date">Preferred Start Date</label><input id="booking-start-date" className="form-input" type="date" min={today} value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="form-group"><label className="form-label" htmlFor="booking-timeline">Timeline</label>
                <select id="booking-timeline" className="form-select" value={timeline} onChange={e => setTimeline(e.target.value as typeof timeline)}>
                  <option value="normal">Normal</option><option value="rush">Rush (+20% labor)</option>
                </select>
              </div>
              <div className="form-group form-full"><label className="form-label" htmlFor="booking-notes">Additional Notes</label><textarea id="booking-notes" className="form-textarea" maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements, existing structures, etc." /></div>
            </div>
            {cost && (
              <div className="cost-summary">
                <div className={styles.summaryHeading}>Estimated Project Cost</div>
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
            <button className="btn btn-outline" type="button" onClick={prevStep}><span aria-hidden="true">&larr;</span> Back</button>
            <button className="btn btn-gold" type="button" onClick={nextStep}>Next: Choose Engineer <span aria-hidden="true">&rarr;</span></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Select Engineer</div>
            <div className={styles.picker} role="radiogroup" aria-label="Engineer options" onKeyDown={handleRadioGroupKeyDown}>
              {engineers.map(e => (
                <button
                  type="button"
                  key={e.id}
                  role="radio"
                  className={`${styles.engPick} ${booking.engineer === e.id ? styles.selected : ''}`}
                  aria-checked={booking.engineer === e.id}
                  aria-disabled={e.status !== 'available'}
                  disabled={e.status !== 'available'}
                  onClick={() => setBooking(prev => ({ ...prev, engineer: e.id }))}
                >
                  <span className={styles.engPickAvatar}>{initials(e.name)}</span>
                  <span className={styles.pickName}>{e.name}</span>
                  <span className={styles.engPickSpec}>{e.spec}</span>
                  <span className={styles.engineerMeta}>Rating {e.rating} / 5 <span aria-hidden="true">&middot;</span> {e.exp}</span>
                  <span className={styles.pickPrice}>{formatPHP(e.rate)}/day</span>
                  <span className={styles.engineerStatus}>
                    <span className={`${styles.engineerBadge} ${e.status === 'available' ? 'badge-available' : 'badge-busy'}`}>{e.status}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.nav}>
            <button className="btn btn-outline" type="button" onClick={prevStep}><span aria-hidden="true">&larr;</span> Back</button>
            <button className="btn btn-gold" type="button" onClick={nextStep}>Review & Confirm <span aria-hidden="true">&rarr;</span></button>
          </div>
        </div>
      )}

      {step === 4 && selectedService && selectedEngineer && (
        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Review Your Booking</div>
            <div className={styles.reviewGrid}>
              <div>
                <div className={styles.reviewHeading}>Client Info</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Name:</span> {name}</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Phone:</span> {phone || 'TBD'}</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Address:</span> {address}</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Start Date:</span> {date || 'TBD'}</div>
              </div>
              <div>
                <div className={styles.reviewHeading}>Project Info</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Service:</span> {selectedService.name}</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Area:</span> {bArea} sqm &times; {floors} floor(s)</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Grade:</span> {grade.charAt(0).toUpperCase() + grade.slice(1)}</div>
                <div className={styles.reviewItem}><span className={styles.reviewLabel}>Engineer:</span> {selectedEngineer.name}</div>
              </div>
            </div>
            {notes && (
              <div className={styles.notes}>
                {notes}
              </div>
            )}
            {cost && (
              <div className={`cost-summary ${styles.reviewCost}`}>
                <div className={styles.summaryHeading}>Final Cost Summary</div>
                <div className="cs-row"><span className="cs-label">Materials</span><span className="cs-val">{formatPHP(cost.mat)}</span></div>
                <div className="cs-row"><span className="cs-label">Labor</span><span className="cs-val">{formatPHP(cost.labor)}</span></div>
                {cost.fixed > 0 && <div className="cs-row"><span className="cs-label">Fixed Installations</span><span className="cs-val">{formatPHP(cost.fixed)}</span></div>}
                <div className="cs-row"><span className="cs-label">VAT (12%)</span><span className="cs-val">{formatPHP(cost.vat)}</span></div>
                <div className="cs-row"><span className={styles.totalLabel}>Total Estimate</span><span className={styles.totalValue}>{formatPHP(cost.total)}</span></div>
                <div className="cs-note">* Estimate includes materials, labor, and VAT. Subject to final site assessment.</div>
              </div>
            )}
          </div>
          <div className={styles.nav}>
            <button className="btn btn-outline" type="button" onClick={prevStep}><span aria-hidden="true">&larr;</span> Back</button>
            <button className="btn btn-gold" type="button" onClick={confirmBooking}>Confirm & Submit Booking <span aria-hidden="true">&#10003;</span></button>
          </div>
        </div>
      )}
    </div>
  );
}
