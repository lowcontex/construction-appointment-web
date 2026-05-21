'use client';

import Image from 'next/image';
import Reveal from './Reveal';
import styles from './WhyUs.module.css';

const slides = [
  {
    id: 1,
    image: '/img/project-sample-home.png',
    alt: 'Completed modern residential construction project',
  },
  {
    id: 2,
    image: '/img/hero-construction-site.png',
    alt: 'Active construction site with crew and equipment',
  },
  {
    id: 3,
    image: '/img/project-sample-home.png',
    alt: 'Finished residential exterior sample project',
  },
  {
    id: 4,
    image: '/img/hero-construction-site.png',
    alt: 'Construction worksite sample project',
  },
] as const;

export default function WhyUs() {
  return (
    <Reveal id="why-us" className="section">
      <div className="section-tag">Why Choose Us</div>
      <div className="section-title">Built on Trust & Transparency</div>
      <Reveal className={styles.carousel} variant="card" delay={90}>
        <div
          className={styles.viewport}
          role="region"
          aria-roledescription="carousel"
          aria-label="Project image carousel"
          tabIndex={0}
        >
          <div className={styles.track}>
            <SlideGroup />
            <SlideGroup duplicate />
          </div>
        </div>
      </Reveal>
    </Reveal>
  );
}

function SlideGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden={duplicate}>
      {slides.map(slide => (
        <div
          key={`${duplicate ? 'duplicate' : 'primary'}-${slide.id}`}
          className={styles.slide}
          role={duplicate ? undefined : 'group'}
          aria-roledescription={duplicate ? undefined : 'slide'}
          aria-label={duplicate ? undefined : `Slide ${slide.id} of ${slides.length}`}
        >
          <div className={`${styles.imageSlot} ${slide.image ? styles.filledSlot : ''}`}>
            {slide.image ? (
              <Image
                className={styles.projectImage}
                src={slide.image}
                alt={duplicate ? '' : slide.alt}
                fill
                sizes="(max-width: 700px) 78vw, (max-width: 900px) 48vw, 460px"
                priority={!duplicate && slide.id === 1}
              />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
