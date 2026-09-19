import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

export default function SettingsPage() {
  return <AppShell title="Configuration"><PageHeader eyebrow="ADMINISTRATION" title="Configuration" description="Manage workspace preferences and integration settings." /><Card><h2>Java API connection</h2><p className="modal-copy">The frontend is ready to connect to the lending services through the configured API base URL.</p><div className="review-summary"><span>Environment<strong>Development</strong></span><span>Base URL<strong>Configured in .env.local</strong></span><span>Authentication<strong>Bearer token ready</strong></span></div></Card></AppShell>;
}