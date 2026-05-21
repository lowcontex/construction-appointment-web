'use client';

import { AppProvider } from '@/context/AppContext';
import Topbar from './Topbar';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import Toast from './Toast';

function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <Header />
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
