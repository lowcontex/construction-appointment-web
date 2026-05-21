'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Engineer, Booking, BookingState, PageId } from '@/types';
import { initialEngineers, initialUsers, initialBookings } from '@/data/engineers';

interface ToastState {
  message: string;
  icon: string;
  visible: boolean;
}

interface AppContextType {
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
const STORAGE_VERSION = '3'; // increment when storage schema or initial data changes
const USER_ROLES = new Set<User['role']>(['admin', 'engineer', 'customer']);
const ROLE_PRIORITY: Record<User['role'], number> = {
  admin: 3,
  engineer: 2,
  customer: 1,
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function cleanText(value: string, maxLength = 120) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function getNextUserId(userList: User[]) {
  return userList.reduce((max, user) => Math.max(max, user.id), 0) + 1;
}

function isSameEmail(left: string, right: string) {
  return normalizeEmail(left) === normalizeEmail(right);
}

function hasRegisteredEmail(userList: User[], email: string) {
  const safeEmail = normalizeEmail(email);
  return userList.some(user => normalizeEmail(user.email) === safeEmail);
}

function getPreferredUser(left: User, right: User) {
  const roleDelta = ROLE_PRIORITY[right.role] - ROLE_PRIORITY[left.role];
  if (roleDelta > 0) return right;
  if (roleDelta < 0) return left;
  return right.id < left.id ? right : left;
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
  if (!Array.isArray(value)) return null;

  const usersByEmail = new Map<string, User>();
  value.filter(isUser).forEach(user => {
    const safeEmail = normalizeEmail(user.email);
    if (!safeEmail) return;
    const normalizedUser = { ...user, email: safeEmail };
    const existing = usersByEmail.get(safeEmail);
    usersByEmail.set(safeEmail, existing ? getPreferredUser(existing, normalizedUser) : normalizedUser);
  });

  const safeUsers = Array.from(usersByEmail.values());
  const usedIds = new Set<number>();
  let nextId = getNextUserId(safeUsers);

  return safeUsers.map(user => {
    if (Number.isSafeInteger(user.id) && user.id > 0 && !usedIds.has(user.id)) {
      usedIds.add(user.id);
      return user;
    }

    while (usedIds.has(nextId)) nextId += 1;
    const remappedUser = { ...user, id: nextId };
    usedIds.add(nextId);
    nextId += 1;
    return remappedUser;
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
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
  const [, startTransition] = useTransition();
  const router = useRouter();

  const showPage = useCallback((id: PageId) => {
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
    const targetPath = paths[id];
    if (typeof window !== 'undefined' && window.location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    startTransition(() => {
      router.push(targetPath, { scroll: true });
    });
  }, [router, startTransition]);

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
    const user = users
      .filter(u => normalizeEmail(u.email) === safeEmail && u.password === password)
      .sort((a, b) => ROLE_PRIORITY[b.role] - ROLE_PRIORITY[a.role])[0];
    if (!user) { showToast('Invalid credentials.'); return; }
    setCurrentUser(user);
    closeModal();
    showToast('Welcome back, ' + user.name + '!');
    handlePostAuth(user);
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
    if (hasRegisteredEmail(users, safeEmail)) { showToast('This email is already registered.'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters.'); return; }

    const newUser: User = {
      id: getNextUserId(users),
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
    handlePostAuth(newUser);
  }, [users, showToast, closeModal, handlePostAuth]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      // Clear storage if version mismatch or tampered data
      if (parsed?.version !== STORAGE_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (parsed?.currentUser) setCurrentUser(parsed.currentUser);
      if (parsed?.booking) setBooking(parsed.booking);
      if (parsed?.bookings) setBookings(parsed.bookings);
      if (parsed?.users) setUsers(parsed.users);
      if (parsed?.engineers) setEngineers(parsed.engineers);
      if (parsed?.pendingAction) setPendingAction(parsed.pendingAction);
    } catch {
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
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to persist app state to localStorage.', { error });
      }
    }, 160);

    return () => window.clearTimeout(timer);
  }, [currentUser, booking, bookings, users, engineers, pendingAction]);

  return (
    <AppContext.Provider value={{
      showPage, currentUser,
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
