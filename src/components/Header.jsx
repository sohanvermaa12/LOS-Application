'use client';

import { Bell, LogOut, Menu, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { logout } from '../services/login';

export default function Header({ title, onMenu }) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Always complete local sign-out even if the logout request fails.
    } finally {
      window.localStorage.removeItem('authData');
      window.location.href = '/login';
    }
  };

  return <header className="topbar"><button className="icon-button menu-trigger" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button><div className="crumb"><strong>{title}</strong></div><div className="top-actions"><Link className="icon-button profile-button" href="/profile" aria-label="User profile" title="User profile"><CircleUserRound size={19} /></Link><button className="icon-button logout-button" onClick={handleLogout} aria-label="Logout" title="Logout"><LogOut size={19} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button></div></header>;
}