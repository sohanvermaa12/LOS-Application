'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { LOGOUT_PENDING_KEY } from '../services/login';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const redirectIfLoggedOut = () => {
      if (window.sessionStorage.getItem(LOGOUT_PENDING_KEY) === 'true') {
        window.location.replace('/login');
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) redirectIfLoggedOut();
    };

    redirectIfLoggedOut();
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return <div className="app-shell"><Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)} onClose={() => setSidebarOpen(false)} /><main className="main-content"><Header menuOpen={sidebarOpen} onMenu={() => setSidebarOpen((open) => !open)} /><div className="page-wrap">{children}</div></main></div>;
}