'use client';

import Link from 'next/link';
import { BarChart3, BriefcaseBusiness, FileText, House, Settings2, ShieldCheck, UsersRound, ClipboardList } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/user_management', label: 'User Management', icon: UsersRound },
  { href: '/lead_managenet', label: 'Lead Management', icon: BriefcaseBusiness },
  { href: '/product_managemet', label: 'Product Management', icon: ClipboardList },
  { href: '/rule_engine', label: 'Rule Engine', icon: ShieldCheck },
  { href: '/audit_blogs', label: 'Audit logs', icon: FileText },
  { href: '/settings', label: 'Setting', icon: Settings2 }
];

export default function Sidebar({ open, onClose }) {
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="brand-block"><div className="brand-mark"><span>LOS</span></div><div><strong>LOS</strong><small>LEAD MANAGEMENT</small></div><button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu">×</button></div>
    <div className="workspace-label">WORKSPACE <span>•</span> RETAIL CREDIT</div>
    <nav className="main-nav">{items.map(({ href, label, icon: Icon }) => <Link className="nav-item" href={href} key={`${href}-${label}`} onClick={onClose}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav>
    <div className="sidebar-footer"><div className="mini-avatar">AS</div><div className="user-meta"><strong>Aditya Sharma</strong><span>Credit Manager</span></div></div>
  </aside>;
}