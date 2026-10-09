'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return <div className="app-shell"><Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)} onClose={() => setSidebarOpen(false)} /><main className="main-content"><Header title={title} onMenu={() => setSidebarOpen(true)} /><div className="page-wrap">{children}</div></main></div>;
}