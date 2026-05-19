'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  doLogin: (email: string, password: string) => void;
  doRegister: (form: Record<string, string>, role: string) => void;
  logout: () => void;
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
  const [toast, setToast] = useState<ToastState>({ message: '', icon: '', visible: false });
  const [successRef, setSuccessRef] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const showPage = useCallback((id: PageId) => {
    setCurrentPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const paths: Record<PageId, string> = {
      home: '/',
      services: '/services',
      engineers: '/engineers',
      booking: '/booking',
      admin: '/admin',
      success: '/success',
    };
    router.push(paths[id]);
  }, [router]);

  const openModal = useCallback((tab: 'login' | 'register') => {
    setModalOpen(true);
    setModalTab(tab);
  }, []);

  const closeModal = useCallback(() => { setModalOpen(false); }, []);

  const switchAuthTab = useCallback((tab: 'login' | 'register') => { setModalTab(tab); }, []);

  const showToast = useCallback((msg: string, icon: string = '') => {
    setToast({ message: msg, icon, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const doLogin = useCallback((email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { showToast('Invalid credentials.'); return; }
    setCurrentUser(user);
    closeModal();
    showToast('Welcome back, ' + user.name + '!');
    if (user.role === 'admin') setTimeout(() => showPage('admin'), 500);
  }, [users, showToast, closeModal, showPage]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    showPage('home');
    showToast('Logged out successfully.');
  }, [showPage, showToast]);

  const doRegister = useCallback((form: Record<string, string>, role: string) => {
    const { fname, lname, email, phone, password, prc, spec, exp, rate, bio } = form;
    if (!fname || !email || !password) { showToast('Please fill in all required fields.'); return; }
    if (users.find(u => u.email === email)) { showToast('Email already registered.'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters.'); return; }

    const newUser: User = {
      id: users.length + 1,
      name: fname + ' ' + lname,
      email,
      password,
      phone,
      role: role as User['role'],
    };

    if (role === 'engineer') {
      if (!prc) { showToast('PRC License No. is required for engineers.'); return; }
      const specShort = spec.split(' ')[0];
      setEngineers(prev => [...prev, {
        id: prev.length + 1,
        name: 'Engr. ' + fname + ' ' + lname,
        spec: specShort,
        avatar: '',
        exp: exp + ' years',
        rate: parseInt(rate) || 2500,
        rating: 5.0,
        reviews: 0,
        status: 'available' as const,
        skills: [specShort],
        bio: bio || 'Newly registered engineer.',
      }]);
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    closeModal();
    showToast('Account created! Welcome, ' + fname + '!');
  }, [users, showToast, closeModal]);

  return (
    <AppContext.Provider value={{
      currentPage, showPage, currentUser,
      engineers, setEngineers, users, setUsers, bookings, setBookings,
      booking, setBooking, modalOpen, modalTab, openModal, closeModal,
      switchAuthTab, doLogin, doRegister, logout, toast, showToast, successRef, setSuccessRef,
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
