'use client';

import { useEffect, useState } from 'react';
import { Building2, ChevronRight, Database, ExternalLink, Home, Phone, ShieldCheck } from 'lucide-react';
import AppShell from '../../components/AppShell';
import { getBankProfile } from '../../services/bankProfile';

const fieldLabels = {
  name: 'Bank Name',
  type: 'Type',
  id: 'Bank ID',
  pkid: 'PKID',
  bank_code: 'Bank Code',
  bank_name: 'Bank Name',
  legal_name: 'Legal Name',
  bank_type: 'Bank Type',
  license_number: 'License Number',
  registration_number: 'Registration Number',
  PAN: 'PAN',
  gst_number: 'GST Number',
  gst_no: 'GST No',
  CIN: 'CIN',
  website: 'Website',
  regulatory_authority_id: 'Regulatory Authority ID',
  regulatory_status: 'Regulatory Status',
  country: 'Country',
  status: 'Status',
  contact_email: 'Contact Email',
  contact_phone: 'Contact Phone',
  db_name: 'DB Name',
  db_host: 'DB Host',
  db_port: 'DB Port',
  created_at: 'Created At',
  updated_at: 'Updated At',
};

const hiddenFields = new Set(['id', 'pkid', 'regulatory_authority_id', 'db_host', 'db_port', 'gst_no']);

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—';

  if (key === 'website') {
    return <a className="bank-profile-link" href={String(value)} target="_blank" rel="noreferrer">{value}<ExternalLink size={14} /></a>;
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  return String(value);
}

function ProfileField({ field }) {
  const isStatus = field.key === 'status' || field.key === 'regulatory_status';
  return (
    <div className="bank-profile-field">
      <span>{field.label || fieldLabels[field.key] || field.key.replace(/_/g, ' ')}</span>
      <strong className={isStatus ? 'bank-profile-status-value' : ''}>{isStatus ? <i /> : null}{formatValue(field.key, field.value)}</strong>
    </div>
  );
}

function ProfileSection({ id, title, description, icon: Icon, fields }) {
  if (!fields.length) return null;

  const splitIndex = Math.ceil(fields.length / 2);
  const columns = [fields.slice(0, splitIndex), fields.slice(splitIndex)];

  return (
    <section className="bank-profile-section" id={id}>
      <header className="bank-profile-section-heading">
        <span className="bank-profile-section-icon"><Icon size={20} strokeWidth={2.2} /></span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="bank-profile-fields">
        {columns.map((column, index) => (
          <div className="bank-profile-field-column" key={`${id}-${index}`}>
            {column.map((field) => <ProfileField field={field} key={field.key} />)}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BankProfilePage() {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hiddenKeys = new Set([...hiddenFields, 'success', 'message']);
  const basicFields = bank ? [
    { key: 'bank_type', value: bank.bank_type ?? bank.type },
    { key: 'legal_name', value: bank.legal_name },
    { key: 'bank_code', value: bank.bank_code },
    { key: 'CIN', value: bank.CIN },
    { key: 'PAN', value: bank.PAN },
    { key: 'website', value: bank.website },
  ].filter((field) => field.value !== undefined) : [];
  const regulatoryFields = bank ? [
    { key: 'registration_number', value: bank.registration_number },
    { key: 'license_number', value: bank.license_number },
    { key: 'gst_number', value: bank.gst_number ?? bank.gst_no },
    { key: 'country', value: bank.country },
    { key: 'regulatory_status', value: bank.regulatory_status },
    { key: 'status', value: bank.status },
  ].filter((field) => field.value !== undefined) : [];
  const contactFields = bank ? [
    { key: 'contact_email', value: bank.contact_email },
    { key: 'contact_phone', value: bank.contact_phone },
  ].filter((field) => field.value !== undefined) : [];
  const systemFields = bank ? [
    { key: 'db_name', value: bank.db_name },
    { key: 'created_at', value: bank.created_at },
    { key: 'updated_at', value: bank.updated_at },
  ].filter((field) => field.value !== undefined) : [];
  const displayedKeys = new Set([
    ...basicFields.map((field) => field.key), 'name', 'type', 'bank_name',
    ...regulatoryFields.map((field) => field.key), 'gst_no',
    ...contactFields.map((field) => field.key),
    ...systemFields.map((field) => field.key),
  ]);
  const additionalFields = bank ? Object.entries(bank)
    .filter(([key]) => !hiddenKeys.has(key) && !displayedKeys.has(key))
    .map(([key, value]) => ({ key, value })) : [];

  const sections = [
    { id: 'organization', title: 'Basic Information', description: 'Core bank and entity details', icon: Building2, fields: basicFields },
    { id: 'regulatory', title: 'Registration & Regulatory', description: 'Licenses, registrations and regulatory status', icon: ShieldCheck, fields: regulatoryFields },
    { id: 'contact', title: 'Contact Information', description: 'Communication and support details', icon: Phone, fields: contactFields },
    { id: 'system', title: 'System/Integration Details', description: 'Technical and integration information', icon: Database, fields: systemFields },
    { id: 'additional', title: 'Additional Details', description: 'Other profile information', icon: Building2, fields: additionalFields },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadBankProfile() {
      try {
        const response = await getBankProfile();
        if (!mounted) return;
        setBank(response?.data || response || null);
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Unable to load bank profile');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBankProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell title="Bank Profile">
      <div className="bank-profile-page">
        {loading ? (
          <div className="bank-profile-message">Loading bank profile...</div>
        ) : error ? (
          <div className="bank-profile-message bank-profile-error">{error}</div>
        ) : bank ? (
          <>
            <nav className="bank-profile-breadcrumb" aria-label="Breadcrumb">
              <Home size={15} />
              <ChevronRight size={14} />
              <span>Bank Profile</span>
            </nav>

            <section className="bank-profile-summary">
              <div className="bank-profile-identity">
                <div className="bank-profile-avatar">{String(bank.bank_name || bank.name || 'B').slice(0, 2).toUpperCase()}</div>
                <div className="bank-profile-identity-copy">
                  <span className="bank-profile-overline">{bank.legal_name || bank.bank_name || bank.name || 'Bank details'}</span>
                  <h1>{bank.bank_name || bank.name || 'Bank Profile'}</h1>
                  <div className="bank-profile-tags">
                    {bank.status ? <span className="bank-profile-badge"><i />{String(bank.status).toLowerCase()}</span> : null}
                    {bank.bank_type || bank.type ? <span>{fieldLabels.bank_type}: {bank.bank_type || bank.type}</span> : null}
                  </div>
                </div>
              </div>
              <div className="bank-profile-summary-facts">
                {[
                  { label: 'Bank Code', value: bank.bank_code },
                  { label: 'Registration Number', value: bank.registration_number },
                  { label: 'Country', value: bank.country },
                ].filter((fact) => fact.value !== undefined).map((fact) => (
                  <div key={fact.label}><span>{fact.label}</span><strong>{formatValue(fact.label, fact.value)}</strong></div>
                ))}
              </div>
            </section>

            <nav className="bank-profile-tabs" aria-label="Profile sections">
              <a className="active" href="#overview">Overview</a>
              <a href="#organization">Organization Details</a>
              <a href="#regulatory">Regulatory & Compliance</a>
              <a href="#contact">Contact & Support</a>
              <a href="#system">System Configuration</a>
            </nav>

            <div className="bank-profile-grid" id="overview">
              {sections.map((section) => <ProfileSection key={section.id} {...section} />)}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
