import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Link from 'next/link';
import { ArrowRight, CircleUserRound } from 'lucide-react';

export default function SettingsPage() {
  return <AppShell title="Configuration"><PageHeader eyebrow="ADMINISTRATION" title="Configuration" description="Manage workspace preferences and integration settings." /><Card className="settings-profile-card"><div className="settings-profile-copy"><CircleUserRound size={22} /><div><h2>Your profile</h2><p className="modal-copy">View your account details, role, and branch assignment.</p></div></div><Link className="text-button" href="/profile">View profile <ArrowRight size={16} /></Link></Card><Card><h2>Java API connection</h2><p className="modal-copy">The frontend is ready to connect to the lending services through the configured API base URL.</p><div className="review-summary"><span>Environment<strong>Development</strong></span><span>Base URL<strong>Configured in .env.local</strong></span><span>Authentication<strong>Bearer token ready</strong></span></div></Card></AppShell>;
}