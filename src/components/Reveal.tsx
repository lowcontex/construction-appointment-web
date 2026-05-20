'use client';

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import styles from './Reveal.module.css';

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  variant?: 'section' | 'card';
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'section',
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          setVisible(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${styles[variant]} ${visible ? styles.visible : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
