'use client';

import Link from 'next/link';
import { BarChart3, BriefcaseBusiness, ClipboardList, House, LifeBuoy, Settings2, UsersRound } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/applications', label: 'Lead Generation', icon: BriefcaseBusiness },
  { href: '/applications', label: 'Applications', icon: ClipboardList },
  { href: '/customers', label: 'Customers', icon: UsersRound },
  { href: '/reports', label: 'Reports', icon: BarChart3 }
];

export default function Sidebar({ open, onClose }) {
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="brand-block"><div className="brand-mark"><span>LOS</span></div><div><strong>LOS</strong><small>LEAD MANAGEMENT</small></div><button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu">×</button></div>
    <div className="workspace-label">WORKSPACE <span>•</span> RETAIL CREDIT</div>
    <nav className="main-nav">{items.map(({ href, label, icon: Icon }) => <Link className="nav-item" href={href} key={`${href}-${label}`} onClick={onClose}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav>
    <div className="nav-divider" /><div className="workspace-label">MANAGE</div>
    <nav className="main-nav"><Link className="nav-item" href="/settings" onClick={onClose}><Settings2 size={18} /><span>Settings</span></Link><button className="nav-item" onClick={onClose}><LifeBuoy size={18} /><span>Help centre</span></button></nav>
    <div className="sidebar-footer"><div className="mini-avatar">AS</div><div className="user-meta"><strong>Aditya Sharma</strong><span>Credit Manager</span></div></div>
  </aside>;
}