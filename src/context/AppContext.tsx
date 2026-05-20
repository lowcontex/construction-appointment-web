'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
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
  doRegister: (form: Record<string, string>) => void;
  logout: () => void;
  pendingAction: string | null;
  setPendingAction: (action: string | null) => void;
  toast: ToastState;
  showToast: (msg: string, icon?: string) => void;
  successRef: string;
  setSuccessRef: (ref: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'construction-app-state-v1';
const USER_ROLES = new Set<User['role']>(['admin', 'engineer', 'customer']);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function cleanText(value: string, maxLength = 120) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<User>;
  return (
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.password === 'string' &&
    typeof user.phone === 'string' &&
    typeof user.role === 'string' &&
    USER_ROLES.has(user.role as User['role'])
  );
}

function isBookingState(value: unknown): value is BookingState {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<BookingState>;
  const serviceOk = draft.service === null || typeof draft.service === 'string';
  const engineerOk = draft.engineer === null || typeof draft.engineer === 'number';
  return serviceOk && engineerOk;
}

function sanitizeUsers(value: unknown) {
  return Array.isArray(value) ? value.filter(isUser) : null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [engineers, setEngineers] = useState<Engineer[]>(initialEngineers);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [booking, setBooking] = useState<BookingState>({ service: null, engineer: null });
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');
  const [toast, setToast] = useState<ToastState>({ message: '', icon: '', visible: false });
  const [successRef, setSuccessRef] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const showPage = useCallback((id: PageId) => {
    setCurrentPage(id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const paths: Record<PageId, string> = {
      home: '/',
      services: '/services',
      engineers: '/engineers',
      booking: '/booking',
      admin: '/admin',
      engineer: '/engineer',
      'my-bookings': '/my-bookings',
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

  const handlePostAuth = useCallback((user: User) => {
    if (pendingAction === 'confirm-booking') {
      showPage('booking');
      return;
    }
    if (user.role === 'admin') { showPage('admin'); return; }
    if (user.role === 'engineer') { showPage('engineer'); return; }
    showPage('my-bookings');
  }, [pendingAction, showPage]);

  const doLogin = useCallback((email: string, password: string) => {
    const safeEmail = normalizeEmail(email);
    const user = users.find(u => normalizeEmail(u.email) === safeEmail && u.password === password);
    if (!user) { showToast('Invalid credentials.'); return; }
    setCurrentUser(user);
    closeModal();
    showToast('Welcome back, ' + user.name + '!');
    setTimeout(() => handlePostAuth(user), 400);
  }, [users, showToast, closeModal, handlePostAuth]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setPendingAction(null);
    showPage('home');
    showToast('Logged out successfully.');
  }, [showPage, showToast]);

  const doRegister = useCallback((form: Record<string, string>) => {
    const { fname, lname, email, phone, password } = form;
    const safeFirstName = cleanText(fname, 40);
    const safeLastName = cleanText(lname, 40);
    const safeEmail = normalizeEmail(email);
    const safePhone = cleanText(phone, 30);
    if (!safeFirstName || !safeEmail || !password) { showToast('Please fill in all required fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) { showToast('Please enter a valid email address.'); return; }
    if (users.find(u => normalizeEmail(u.email) === safeEmail)) { showToast('Email already registered.'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters.'); return; }

    const newUser: User = {
      id: users.length + 1,
      name: cleanText(`${safeFirstName} ${safeLastName}`),
      email: safeEmail,
      password,
      phone: safePhone,
      role: 'customer',
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    closeModal();
    showToast('Account created! Welcome, ' + safeFirstName + '!');
    setTimeout(() => handlePostAuth(newUser), 400);
  }, [users, showToast, closeModal, handlePostAuth]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (isUser(parsed?.currentUser)) setCurrentUser(parsed.currentUser);
      if (isBookingState(parsed?.booking)) setBooking(parsed.booking);
      if (Array.isArray(parsed?.bookings)) setBookings(parsed.bookings);
      const safeUsers = sanitizeUsers(parsed?.users);
      if (safeUsers) setUsers(safeUsers);
      if (parsed?.engineers) setEngineers(parsed.engineers);
      if (parsed?.pendingAction) setPendingAction(parsed.pendingAction);
    } catch (error) {
      console.error('Failed to restore app state from localStorage.', { error });
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const data = {
      currentUser,
      booking,
      bookings,
      users,
      engineers,
      pendingAction,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [currentUser, booking, bookings, users, engineers, pendingAction]);

  return (
    <AppContext.Provider value={{
      currentPage, showPage, currentUser,
      engineers, setEngineers, users, setUsers, bookings, setBookings,
      booking, setBooking, modalOpen, modalTab, openModal, closeModal,
      switchAuthTab, doLogin, doRegister, logout, pendingAction, setPendingAction,
      toast, showToast, successRef, setSuccessRef,
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
