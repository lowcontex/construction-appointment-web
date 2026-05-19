'use client';

import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className={`toast ${toast.visible ? 'show' : ''}`}>
      {toast.icon && <span className="toast-icon">{toast.icon}</span>}
      <span>{toast.message}</span>
    </div>
  );
}
