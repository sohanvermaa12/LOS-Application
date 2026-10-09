'use client';

import Link from 'next/link';
import { BarChart3, BriefcaseBusiness, ClipboardList, House, PanelLeftClose, PanelLeftOpen, Settings2, ShieldCheck, UsersRound } from 'lucide-react';

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
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <div className="brand-block">
      <Link href="/bank_profile" onClick={onClose} aria-label="Open bank profile" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="brand-mark"><span>AX</span></div>
      </Link>
      <button className="icon-button sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
      <button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu">×</button>
    </div>
    <nav className="main-nav">{items.map(({ href, label, icon: Icon }) => <Link className="nav-item" href={href} key={`${href}-${label}`} onClick={onClose} aria-label={label} title={label}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav>
    <div className="sidebar-footer"><div className="mini-avatar" title="Vikram Aditya Mehta">VM</div><div className="user-meta"><strong>Vikram Aditya Mehta</strong><span>SUPER_ADMIN</span></div></div>
  </aside>;
}