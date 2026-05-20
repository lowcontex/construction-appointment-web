'use client';

import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
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
  return (
    <div
      className={`${styles.reveal} ${styles[variant]} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
