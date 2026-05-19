'use client';

import { AppProvider, useApp } from '@/context/AppContext';
import Topbar from './Topbar';
import Header from './Header';
import UserBar from './UserBar';
import Footer from './Footer';
import AuthModal from './AuthModal';
import Toast from './Toast';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  return (
    <>
      <Topbar />
      <Header />
      {currentUser && <UserBar />}
      <main>{children}</main>
      <Footer />
      <AuthModal />
      <Toast />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LayoutShell>{children}</LayoutShell>
    </AppProvider>
  );
}
