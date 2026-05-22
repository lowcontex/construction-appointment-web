'use client';

import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className={`toast ${toast.visible ? 'show' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      {toast.icon && <span className="toast-icon">{toast.icon}</span>}
      <span>{toast.message}</span>
    </div>
  );
}
