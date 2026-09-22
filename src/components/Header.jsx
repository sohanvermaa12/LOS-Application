'use client';

import { Bell, LogOut, Menu } from 'lucide-react';

export default function Header({ title, onMenu }) {
  const handleLogout = () => {
    window.localStorage.removeItem('authData');
    window.location.href = '/login';
  };

  return <header className="topbar"><button className="icon-button menu-trigger" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button><div className="crumb"><span>Retail credit</span><span>/</span><strong>{title}</strong></div><div className="top-actions"><button className="icon-button logout-button" onClick={handleLogout} aria-label="Logout" title="Logout"><LogOut size={19} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button></div></header>;
}