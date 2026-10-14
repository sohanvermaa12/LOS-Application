'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  UsersRound
} from 'lucide-react';
import { getUserProfile } from '../services/user_profile';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/lead_managenet', label: 'Lead Management', icon: BriefcaseBusiness },
  { href: '/customer_management', label: 'Customer Management', icon: UsersRound },
  { href: '/loan_application', label: 'Loan Application Management', icon: ClipboardList },
  { href: '/rule_engine', label: 'Rule Engine', icon: ShieldCheck },
  { href: '/user_management', label: 'User Management', icon: UsersRound },
  { href: '/master_creation', label: 'Master Creation', icon: ClipboardList },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings2 }
];

export default function Sidebar({ open, collapsed, onToggle, onClose }) {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      try {
        const userProfile = await getUserProfile();
        if (isCurrent) setProfile(userProfile);
      } catch (requestError) {
        if (isCurrent) {
          setProfileError(requestError.message || 'Unable to load the user profile.');
        }
      }
    }

    loadProfile();
    return () => {
      isCurrent = false;
    };
  }, []);

  const firstName = [profile?.first_name, profile?.firstName].find(
    (value) => typeof value === 'string' && value.trim(),
  )?.trim();
  const role = [profile?.role, profile?.role_name].find(
    (value) => typeof value === 'string' && value.trim(),
  )?.trim();
  const displayName = firstName || (profileError ? 'Profile unavailable' : 'Loading...');

  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
      <aside
        id="app-sidebar"
        className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}
        aria-label="Main navigation"
      >
        <div className="brand-block">
          <Link
            href="/bank_profile"
            onClick={onClose}
            aria-label="Open bank profile"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div className="brand-mark"><span>AX</span></div>
          </Link>
          <button
            className="icon-button sidebar-toggle"
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            className="icon-button mobile-close"
            type="button"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="main-nav" aria-label="Primary">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              className="nav-item"
              href={href}
              key={`${href}-${label}`}
              onClick={onClose}
              aria-label={label}
              title={label}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer" title={profileError || undefined}>
          <div className="mini-avatar" title={displayName}>
            {firstName ? firstName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-meta">
            <strong>{displayName}</strong>
            <span>{profileError ? 'Unable to load role' : role || (profile ? 'Role unavailable' : '')}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
