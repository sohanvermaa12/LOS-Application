'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '../hooks/useIsMobile';

export default function AppShell({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return <div className="app-shell"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu" tabIndex={sidebarOpen ? 0 : -1} /><main className="main-content"><Header title={title} onMenu={() => setSidebarOpen(true)} /><div className="page-wrap">{children}</div></main></div>;
}