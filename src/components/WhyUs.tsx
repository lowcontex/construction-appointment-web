'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import Reveal from './Reveal';
import styles from './WhyUs.module.css';

const slides = [0, 1, 2, 3];
const AUTOPLAY_DELAY = 4500;
const SWIPE_THRESHOLD = 45;

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goToPrevious = useCallback(() => {
    setActive(current => (current === 0 ? slides.length - 1 : current - 1));
  }, []);

  const goToNext = useCallback(() => {
    setActive(current => (current === slides.length - 1 ? 0 : current + 1));
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduceMotion) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) goToNext();
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [goToNext, paused]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
    setPaused(true);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = (event.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) >= SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) goToNext();
      else goToPrevious();
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
    setPaused(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPrevious();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToNext();
    }
  };

  return (
    <Reveal id="why-us" className="section">
      <div className="section-tag">Why Choose Us</div>
      <div className="section-title">Built on Trust & Transparency</div>
      <Reveal
        className={styles.carousel}
        variant="card"
        delay={90}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className={styles.viewport}
          role="region"
          aria-roledescription="carousel"
          aria-label="Project image carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.track} style={{ transform: `translateX(-${active * 100}%)` }}>
            {slides.map(slide => (
              <div
                key={slide}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${slide + 1} of ${slides.length}`}
                aria-hidden={active !== slide}
              >
                <div className={styles.imageSlot}>
                  {/* Add your carousel image here, for example:
                      <img src="/img/projects/project-1.jpg" alt="Finished construction project" />
                  */}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className={`${styles.control} ${styles.prev}`} type="button" aria-label="Previous project image" onClick={goToPrevious}>
          &lsaquo;
        </button>
        <button className={`${styles.control} ${styles.next}`} type="button" aria-label="Next project image" onClick={goToNext}>
          &rsaquo;
        </button>
        <div className={styles.dots} aria-label="Carousel slides">
          {slides.map(slide => (
            <button
              key={slide}
              className={`${styles.dot} ${active === slide ? styles.activeDot : ''}`}
              type="button"
              aria-label={`Show slide ${slide + 1}`}
              aria-current={active === slide}
              onClick={() => setActive(slide)}
            />
          ))}
        </div>
      </Reveal>
    </Reveal>
  );
}
