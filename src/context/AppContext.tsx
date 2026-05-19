'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { User, Engineer, Booking, BookingState, PageId } from '@/types';
import { initialEngineers, initialUsers, initialBookings } from '@/data/engineers';

interface ToastState {
  message: string;
  icon: string;
  visible: boolean;
}

interface AppContextType {
  currentPage: PageId;
  showPage: (id: PageId) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  engineers: Engineer[];
  setEngineers: React.Dispatch<React.SetStateAction<Engineer[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  modalOpen: boolean;
  modalTab: 'login' | 'register';
  openModal: (tab: 'login' | 'register') => void;
  closeModal: () => void;
  switchAuthTab: (tab: 'login' | 'register') => void;
  toast: ToastState;
  showToast: (msg: string, icon?: string) => void;
  successRef: string;
  setSuccessRef: (ref: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [engineers, setEngineers] = useState<Engineer[]>(initialEngineers);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [booking, setBooking] = useState<BookingState>({ service: null, engineer: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');
  const [toast, setToast] = useState<ToastState>({ message: '', icon: '\u2713', visible: false });
  const [successRef, setSuccessRef] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPage = useCallback((id: PageId) => {
    setCurrentPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openModal = useCallback((tab: 'login' | 'register') => {
    setModalOpen(true);
    setModalTab(tab);
  }, []);

  const closeModal = useCallback(() => { setModalOpen(false); }, []);

  const switchAuthTab = useCallback((tab: 'login' | 'register') => { setModalTab(tab); }, []);

  const showToast = useCallback((msg: string, icon: string = '\u2713') => {
    setToast({ message: msg, icon, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      currentPage, showPage, currentUser, setCurrentUser,
      engineers, setEngineers, users, setUsers, bookings, setBookings,
      booking, setBooking, modalOpen, modalTab, openModal, closeModal,
      switchAuthTab, toast, showToast, successRef, setSuccessRef,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
