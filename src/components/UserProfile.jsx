import { Building2, Clock3, IdCard, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Card from './Card';
import PageHeader from './PageHeader';

const profile = {
  name: 'Vikram Aditya Mehta',
  employeeId: 'HDFC-ADM-01',
  email: 'superadmin@hdfcbank.com',
  phone: '+919876500001',
  role: 'SUPER_ADMIN',
  userType: 'STAFF',
  organization: 'HDFC Bank',
  organizationCode: 'HDFC01',
  organizationType: 'BANK',
  branch: 'Mumbai Fort Branch',
  branchCode: 'HDFC01-BR-01',
  branchId: '1',
  lastLogin: '2026-09-21T05:26:34'
};

function ProfileField({ icon: Icon, label, children }) {
  return <div className="profile-field"><span className="profile-field-icon"><Icon size={17} /></span><div><span>{label}</span><strong>{children}</strong></div></div>;
}

export default function UserProfile() {
  return <>
    <PageHeader eyebrow="ACCOUNT" title="User profile" description="Account identity, access, and branch assignment." />
    <Card className="profile-overview">
      <div className="profile-avatar" aria-hidden="true">VM</div>
      <div className="profile-overview-copy"><div className="eyebrow">HDFC BANK STAFF</div><h2>{profile.name}</h2><p>{profile.employeeId}</p></div>
      <div className="profile-badges"><span>{profile.role}</span><span>{profile.userType}</span></div>
    </Card>
    <Card className="profile-details-card">
      <div className="profile-section-heading"><div><h2>Contact information</h2><p>How this account can be identified and reached.</p></div></div>
      <div className="profile-fields">
        <ProfileField icon={IdCard} label="Employee ID">{profile.employeeId}</ProfileField>
        <ProfileField icon={Mail} label="Email"><a href={`mailto:${profile.email}`}>{profile.email}</a></ProfileField>
        <ProfileField icon={Phone} label="Phone"><a href={`tel:${profile.phone}`}>{profile.phone}</a></ProfileField>
        <ProfileField icon={Clock3} label="Last login">2026-09-21 05:26:34</ProfileField>
      </div>
    </Card>
    <Card className="profile-details-card">
      <div className="profile-section-heading"><div><h2>Organization and access</h2><p>Assigned organization, branch, and account permissions.</p></div><ShieldCheck size={20} /></div>
      <div className="profile-fields">
        <ProfileField icon={Building2} label="Organization">{profile.organization} ({profile.organizationCode}, {profile.organizationType})</ProfileField>
        <ProfileField icon={MapPin} label="Branch">{profile.branch} ({profile.branchCode})</ProfileField>
        <ProfileField icon={IdCard} label="Branch ID">{profile.branchId}</ProfileField>
        <ProfileField icon={ShieldCheck} label="Access role">{profile.role} · {profile.userType}</ProfileField>
      </div>
    </Card>
  </>;
}