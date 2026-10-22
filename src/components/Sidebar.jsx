'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  ClipboardCheck,
  FilePlus2,
  House,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Settings2,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/lead_managenet', label: 'Lead Management', icon: BriefcaseBusiness },
  { href: '/customer_management', label: 'Customer Management', icon: UsersRound },
  { href: '/loan_application', label: 'Individual Customer Onboarding', icon: ClipboardList },
  { href: '/loan_application_form', label: 'Loan Application', icon: FilePlus2 },
  { href: '/rule_engine', label: 'Rule Engine', icon: ShieldCheck },
  { href: '/user_management', label: 'User Management', icon: UsersRound },
  { href: '/master_creation', label: 'Bank Master', icon: ClipboardList },
  { href: '/product_management', label: 'Product Management', icon: Package },
  { href: '/loan_eligibility', label: 'Loan Eligibility', icon: ClipboardCheck },
  { href: '/interest_rate_master', label: 'Interest Rate Master', icon: Percent },
  { href: '/lookup_management', label: 'Lookup Management', icon: BookOpen },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

export default function Sidebar({ open, collapsed, onToggle, onClose }) {
  const pathname = usePathname();

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
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(`${href}/`);

            return (
              <Link
                className={`nav-item ${isActive ? 'active' : ''}`}
                href={href}
                key={`${href}-${label}`}
                onClick={onClose}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                title={label}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
