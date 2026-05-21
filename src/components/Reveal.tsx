'use client';

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import styles from './Reveal.module.css';

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  variant?: 'section' | 'card';
}

const revealCallbacks = new WeakMap<Element, () => void>();
let revealObserver: IntersectionObserver | null = null;

function getRevealObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;
  if (revealObserver) return revealObserver;

  revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealCallbacks.get(entry.target)?.();
        revealObserver?.unobserve(entry.target);
        revealCallbacks.delete(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  return revealObserver;
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
    const observer = getRevealObserver();
    if (reduceMotion || !observer) {
      setVisible(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    revealCallbacks.set(node, () => setVisible(true));
    observer.observe(node);

    return () => {
      revealCallbacks.delete(node);
      observer.unobserve(node);
    };
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
