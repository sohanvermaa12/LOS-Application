'use client';

import { useEffect, useState } from 'react';
import { Building2, ChevronRight, ExternalLink, Home, Phone, Plus, ShieldCheck, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import { getBankProfile } from '../../services/bankProfile';

const fieldLabels = {
  name: 'Bank Name',
  type: 'Type',
  id: 'Bank ID',
  bank_code: 'Bank Code',
  bank_name: 'Bank Name',
  legal_name: 'Legal Name',
  bank_type: 'Bank Type',
  license_number: 'License Number',
  PAN: 'PAN',
  gst_number: 'GST Number',
  direct_clearing_number: 'Direct Clearing Number',
  direct_clearing_member: 'Direct Clearing Member',
  direct_member_iftas: 'Direct IFTAS Member',
  micr_details: 'MICR Details',
  ifsc_code: 'IFSC Code',
  number_of_branches: 'Number of Branches',
  sponsor_bank_of_clearing: 'Clearing Sponsor Bank',
  sponsor_bank_of_iftas: 'IFTAS Sponsor Bank',
  address_type: 'Address Type',
  unit_gala_name_and_number: 'Unit / Building',
  street_road: 'Street / Road',
  landmark: 'Landmark',
  city: 'City',
  state: 'State',
  pincode: 'PIN Code',
  website: 'Website',
  regulatory_authority_id: 'Regulatory Authority ID',
  regulatory_status: 'Regulatory Status',
  country: 'Country',
  status: 'Status',
  contact_email: 'Contact Email',
  contact_phone: 'Contact Phone',
};

const hiddenFields = new Set([
  'pkid',
  'registration_number',
  'CIN',
  'micr_city_code',
  'micr_bank_code',
  'micr_branch_code',
  'logo',
  'status',
  'regulatory_status',
]);

const sectionDefinitions = [
  { id: 'organization', title: 'Organization & Address', description: 'Bank identity, classification and registered address', icon: Building2 },
  { id: 'regulatory', title: 'Regulatory & Clearing', description: 'Licensing, compliance and clearing network details', icon: ShieldCheck },
  { id: 'contact', title: 'Contact Information', description: 'Bank contact channels', icon: Phone },
  { id: 'additional', title: 'Additional Details', description: 'Other information returned by the organization API', icon: Building2 },
];

function getSectionId(key) {
  if (/^(name|type|id|pkid|bank_code|bank_name|legal_name|bank_type|number_of_branches|address_type|unit_gala_name_and_number|street_road|landmark|city|state|pincode|country|website|logo)$/i.test(key)) {
    return 'organization';
  }
  if (/(license|registration|pan|gst|cin|regulatory|clearing|iftas|micr|ifsc|sponsor_bank|^status$)/i.test(key)) {
    return 'regulatory';
  }
  if (/(contact|email|phone)/i.test(key)) return 'contact';
  if (/(^db_|created_at|updated_at)/i.test(key)) return 'system';
  return 'additional';
}

function getFieldLabel(key) {
  return fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—';

  if (key === 'website' || key === 'logo') {
    const url = String(value);
    try {
      if (['http:', 'https:'].includes(new URL(url).protocol)) {
        return <a className="bank-profile-link" href={url} target="_blank" rel="noreferrer">{url}<ExternalLink size={15} /></a>;
      }
    } catch {
      return url;
    }
    return url;
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
}

function ProfileField({ field }) {
  const isStatus = field.key === 'status' || field.key === 'regulatory_status';
  return (
    <div className="bank-profile-field">
      <span>{field.label || getFieldLabel(field.key)}</span>
      <strong className={isStatus ? 'bank-profile-status-value' : ''}>{isStatus ? <i /> : null}{formatValue(field.key, field.value)}</strong>
    </div>
  );
}

function ProfileSection({ id, title, description, icon: Icon, fields }) {
  if (!fields.length) return null;

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
        {fields.map((field) => <ProfileField field={field} key={field.key} />)}
      </div>
    </section>
  );
}

export default function BankProfilePage() {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ code: '', name: '', city: '' });
  const [branchSuccess, setBranchSuccess] = useState('');

  const sections = bank
    ? sectionDefinitions.map((section) => ({
      ...section,
      fields: Object.entries(bank)
        .filter(([key]) => {
          if (hiddenFields.has(key) || /^(db_|system_|created_at$|updated_at$)/i.test(key)) return false;
          if (key === 'gst_no' && bank.gst_number !== null && bank.gst_number !== undefined && bank.gst_number !== '') return false;
          return getSectionId(key) === section.id;
        })
        .map(([key, value]) => ({ key, value, label: key === 'gst_no' ? 'GST Number' : undefined })),
    }))
    : [];

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

  function submitBranch(event) {
    event.preventDefault();
    setBranchForm({ code: '', name: '', city: '' });
    setBranchSuccess('Branch added successfully.');
  }

  function closeBranchDialog() {
    setAddBranchOpen(false);
    setBranchForm({ code: '', name: '', city: '' });
    setBranchSuccess('');
  }

  return (
    <AppShell title="Bank Profile">
      <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
        <div className="bank-profile-page">
          <div className="bank-profile-toolbar">
            <nav className="bank-profile-breadcrumb" aria-label="Breadcrumb">
              <Home size={15} />
              <ChevronRight size={14} />
              <span>Bank Profile</span>
            </nav>
            <button className="bank-profile-add-button" type="button" onClick={() => setAddBranchOpen(true)}>
              <Plus size={18} />
              Add Branch
            </button>
          </div>
          {loading ? (
            <div className="bank-profile-message">Loading bank profile...</div>
          ) : error ? (
            <div className="bank-profile-message bank-profile-error" role="alert">{error}</div>
          ) : bank ? (
            <>
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
                    { label: 'Country', value: bank.country },
                  ].filter((fact) => fact.value !== undefined && fact.value !== null && fact.value !== '').map((fact) => (
                    <div key={fact.label}><span>{fact.label}</span><strong>{formatValue(fact.label, fact.value)}</strong></div>
                  ))}
                </div>
              </section>

              <div className="bank-profile-grid">
                {sections.map((section) => <ProfileSection key={section.id} {...section} />)}
              </div>
            </>
          ) : (
            <div className="bank-profile-message">No bank profile data was returned.</div>
          )}
        </div>
        {addBranchOpen && (
          <div className="bank-profile-modal-backdrop" onClick={closeBranchDialog}>
            <section
              className="bank-profile-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-branch-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="bank-profile-modal-header">
                <div>
                  <h2 id="add-branch-title">Add Branch</h2>
                  <p>Enter the branch details below.</p>
                </div>
                <button className="bank-profile-modal-close" type="button" onClick={closeBranchDialog} aria-label="Close add branch dialog">
                  <X size={20} />
                </button>
              </header>
              <form className="bank-profile-branch-form" onSubmit={submitBranch}>
                <label>
                  Branch Code
                  <input
                    autoFocus
                    required
                    value={branchForm.code}
                    onChange={(event) => {
                      setBranchForm((current) => ({ ...current, code: event.target.value }));
                      setBranchSuccess('');
                    }}
                    placeholder="Enter branch code"
                  />
                </label>
                <label>
                  Branch Name
                  <input
                    required
                    value={branchForm.name}
                    onChange={(event) => {
                      setBranchForm((current) => ({ ...current, name: event.target.value }));
                      setBranchSuccess('');
                    }}
                    placeholder="Enter branch name"
                  />
                </label>
                <label>
                  City
                  <input
                    value={branchForm.city}
                    onChange={(event) => {
                      setBranchForm((current) => ({ ...current, city: event.target.value }));
                      setBranchSuccess('');
                    }}
                    placeholder="Enter city"
                  />
                </label>
                {branchSuccess && <p className="bank-profile-branch-success" role="status">{branchSuccess}</p>}
                <div className="bank-profile-modal-actions">
                  <button className="bank-profile-cancel-button" type="button" onClick={closeBranchDialog}>Cancel</button>
                  <button className="bank-profile-add-button" type="submit"><Plus size={17} /> Add Branch</button>
                </div>
              </form>
            </section>
          </div>
        )}
        <style>{`
          .bank-profile-page {
            --bank-blue: #2165e8;
            --bank-ink: #17345f;
            --bank-muted: #7189a8;
            --bank-line: #d8e6fa;
            max-width: 1560px;
            margin: 0 auto;
            padding: 18px 22px 36px;
            color: var(--bank-ink);
            font-family: "Google Sans", Arial, sans-serif;
            font-size: 16px;
          }
          .bank-profile-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin: 0 0 18px; }
          .bank-profile-breadcrumb { display: flex; align-items: center; gap: 10px; margin: 0; color: #6782a4; font-size: 14px; }
          .bank-profile-breadcrumb svg:first-child { color: #607fa6; }
          .bank-profile-breadcrumb svg:nth-child(2) { color: #99acc3; }
          .bank-profile-add-button { display: inline-flex; align-self: flex-start; align-items: center; justify-content: center; gap: 8px; width: fit-content; margin: 0; min-height: 42px; padding: 0 16px; border: 1px solid #2165e8; border-radius: 8px; background: #2165e8; color: #fff; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; }
          .bank-profile-add-button:hover { background: #1855c8; }
          .bank-profile-summary { display: grid; grid-template-columns: minmax(290px, 1.15fr) minmax(420px, 1fr); align-items: center; gap: 26px; min-height: 150px; padding: 24px 26px; border: 1px solid var(--bank-line); border-radius: 12px; background: #fff; }
          .bank-profile-identity { display: flex; align-items: center; gap: 20px; min-width: 0; }
          .bank-profile-avatar { display: grid; place-items: center; flex: 0 0 82px; width: 82px; height: 82px; border-radius: 16px; background: #edf4ff; color: var(--bank-blue); font-size: 28px; font-weight: 800; }
          .bank-profile-identity-copy { min-width: 0; }
          .bank-profile-overline { display: block; margin-bottom: 7px; color: var(--bank-muted); font-size: 13px; font-weight: 700; text-transform: uppercase; }
          .bank-profile-identity-copy h1 { margin: 0; color: #142f59; font-size: 28px; line-height: 1.3; font-weight: 700; }
          .bank-profile-tags { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; margin-top: 10px; color: var(--bank-muted); font-size: 14px; }
          .bank-profile-badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 20px; background: #dff7eb; color: #138553; font-size: 13px; font-weight: 700; text-transform: capitalize; }
          .bank-profile-badge i, .bank-profile-status-value i { width: 8px; height: 8px; flex: none; border-radius: 50%; background: #19b76d; }
          .bank-profile-summary-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); min-width: 0; }
          .bank-profile-summary-facts > div { display: grid; align-content: center; gap: 9px; min-width: 0; min-height: 64px; padding: 0 18px; border-left: 1px solid #e0eaf8; }
          .bank-profile-summary-facts span { color: var(--bank-muted); font-size: 13px; font-weight: 600; }
          .bank-profile-summary-facts strong { overflow-wrap: anywhere; color: #1a365f; font-size: 15px; font-weight: 700; line-height: 1.45; }
          .bank-profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 20px; }
          .bank-profile-section { min-width: 0; overflow: hidden; border: 1px solid var(--bank-line); border-radius: 12px; background: #fff; }
          .bank-profile-section-heading { display: flex; align-items: center; gap: 15px; min-height: 72px; padding: 14px 20px; background: #f3f7fd; }
          .bank-profile-section-icon { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 50%; background: var(--bank-blue); color: #fff; }
          .bank-profile-section-heading h2 { margin: 0 0 4px; color: #1b3b6b; font-size: 18px; font-weight: 700; }
          .bank-profile-section-heading p { margin: 0; color: #7189a8; font-size: 13px; line-height: 1.45; }
          .bank-profile-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 22px; padding: 21px 22px; }
          .bank-profile-field { display: grid; align-content: start; gap: 6px; min-width: 0; }
          .bank-profile-field > span { color: #7186a1; font-size: 13px; font-weight: 600; }
          .bank-profile-field > strong { overflow-wrap: anywhere; color: #1d3c6a; font-size: 15px; font-weight: 600; line-height: 1.5; }
          .bank-profile-field > strong.bank-profile-status-value { display: inline-flex; align-items: center; gap: 8px; width: max-content; max-width: 100%; padding: 5px 11px; border-radius: 16px; background: #def6eb; color: #16905d; font-size: 13px; text-transform: uppercase; }
          .bank-profile-field > strong.bank-profile-status-value i { width: 7px; height: 7px; }
          .bank-profile-link { display: inline-flex; align-items: center; gap: 6px; color: #1d69d9; text-decoration: underline; overflow-wrap: anywhere; }
          .bank-profile-message { padding: 26px; border: 1px solid var(--bank-line); border-radius: 10px; background: #fff; color: #516b8c; font-size: 16px; }
          .bank-profile-error { border-color: #f2caca; background: #fff7f7; color: #ad3030; }
          .bank-profile-modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(15 32 55 / 48%); }
          .bank-profile-modal { width: min(100%, 520px); overflow: hidden; border: 1px solid #d8e6fa; border-radius: 14px; background: #fff; box-shadow: 0 24px 70px rgb(15 32 55 / 24%); }
          .bank-profile-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px; border-bottom: 1px solid #e6edf7; }
          .bank-profile-modal-header h2 { margin: 0; color: #17345f; font-size: 22px; }
          .bank-profile-modal-header p { margin: 6px 0 0; color: #7189a8; font-size: 14px; }
          .bank-profile-modal-close { display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 8px; background: #f1f5fb; color: #526b8c; cursor: pointer; }
          .bank-profile-branch-form { display: grid; gap: 17px; padding: 23px 24px 24px; }
          .bank-profile-branch-form label { display: grid; gap: 7px; color: #304b70; font-size: 14px; font-weight: 600; }
          .bank-profile-branch-form input { width: 100%; min-height: 44px; box-sizing: border-box; padding: 0 12px; border: 1px solid #cbd9eb; border-radius: 7px; outline: none; color: #17345f; font: inherit; font-size: 15px; }
          .bank-profile-branch-form input:focus { border-color: #2165e8; box-shadow: 0 0 0 3px rgb(33 101 232 / 13%); }
          .bank-profile-branch-success { margin: 0; padding: 11px 13px; border: 1px solid #b9e8ce; border-radius: 7px; background: #effbf4; color: #147346; font-size: 14px; font-weight: 600; }
          .bank-profile-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 3px; }
          .bank-profile-cancel-button { min-height: 42px; padding: 0 16px; border: 1px solid #cbd9eb; border-radius: 8px; background: #fff; color: #405775; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; }
          @media (max-width: 1050px) {
            .bank-profile-summary { grid-template-columns: 1fr; gap: 20px; }
            .bank-profile-summary-facts > div:first-child { border-left: 0; padding-left: 0; }
          }
          @media (max-width: 760px) {
            .bank-profile-page { padding: 14px 12px 26px; }
            .bank-profile-grid { grid-template-columns: 1fr; }
            .bank-profile-summary { padding: 20px; }
          }
          @media (max-width: 480px) {
            .bank-profile-toolbar { align-items: flex-start; flex-direction: column; gap: 12px; }
            .bank-profile-identity { align-items: flex-start; gap: 13px; }
            .bank-profile-avatar { flex-basis: 62px; width: 62px; height: 62px; font-size: 21px; }
            .bank-profile-identity-copy h1 { font-size: 22px; }
            .bank-profile-summary-facts { grid-template-columns: 1fr; gap: 14px; }
            .bank-profile-summary-facts > div { min-height: 0; padding: 0; border-left: 0; }
            .bank-profile-fields { grid-template-columns: 1fr; gap: 16px; padding: 18px; }
            .bank-profile-section-heading { padding: 12px 16px; }
          }
        `}</style>
      </>
    </AppShell>
  );
}
