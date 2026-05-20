'use client';

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
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

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.14 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${styles[variant]} ${visible ? styles.visible : ''} ${className}`}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
