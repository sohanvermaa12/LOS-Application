'use client';

import Link from 'next/link';
import { BarChart3, BriefcaseBusiness, House, Settings2, ShieldCheck, UsersRound, ClipboardList } from 'lucide-react';

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

export default function Sidebar({ open, onClose }) {
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="brand-block"><div className="brand-mark"><span>LOS</span></div><div><strong>LOS</strong><small>LEAD MANAGEMENT</small></div><button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu">×</button></div>
    <nav className="main-nav">{items.map(({ href, label, icon: Icon }) => <Link className="nav-item" href={href} key={`${href}-${label}`} onClick={onClose}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav>
    <div className="sidebar-footer"><div className="mini-avatar">VM</div><div className="user-meta"><strong>Vikram Aditya Mehta</strong><span>SUPER_ADMIN</span></div></div>
  </aside>;
}