'use client';

import { useMemo, useState } from 'react';
import { Building2, Package, Plus, Radio, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

const masterTypes = [
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'products', label: 'Loan Products', icon: Package },
  { id: 'sources', label: 'Lead Sources', icon: Radio }
];

const initialMasters = {
  branches: [
    { code: 'BR-001', name: 'Pune Main Branch', detail: 'Pune', active: true },
    { code: 'BR-002', name: 'Mumbai Branch', detail: 'Mumbai', active: true },
    { code: 'BR-003', name: 'Nashik Branch', detail: 'Nashik', active: false }
  ],
  products: [
    { code: 'PR-001', name: 'Personal Loan', detail: 'Unsecured', active: true },
    { code: 'PR-002', name: 'Gold Loan', detail: 'Secured', active: true },
    { code: 'PR-003', name: 'Business Loan', detail: 'Unsecured', active: false }
  ],
  sources: [
    { code: 'LS-001', name: 'Website', detail: 'Digital', active: true },
    { code: 'LS-002', name: 'Branch Office', detail: 'In-person', active: true },
    { code: 'LS-003', name: 'Partner Network', detail: 'Referral', active: true }
  ]
};

export default function MasterCreationPage() {
  const [activeType, setActiveType] = useState('branches');
  const [masters, setMasters] = useState(initialMasters);
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [formError, setFormError] = useState('');

  const activeMaster = masterTypes.find((type) => type.id === activeType);
  const rows = masters[activeType];
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => `${row.code} ${row.name} ${row.detail}`.toLowerCase().includes(query));
  }, [rows, search]);

  const addMaster = (event) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    if (rows.some((row) => row.code.toLowerCase() === normalizedCode.toLowerCase())) {
      setFormError('That code is already in use for this master.');
      return;
    }

    setMasters((current) => ({
      ...current,
      [activeType]: [...current[activeType], {
        code: normalizedCode,
        name: normalizedName,
        detail: detail.trim() || 'Not specified',
        active: true
      }]
    }));
    setCode('');
    setName('');
    setDetail('');
    setFormError('');
  };

  const toggleMaster = (targetCode) => {
    setMasters((current) => ({
      ...current,
      [activeType]: current[activeType].map((row) => row.code === targetCode ? { ...row, active: !row.active } : row)
    }));
  };

  const changeType = (type) => {
    setActiveType(type);
    setSearch('');
    setFormError('');
  };

  return (
    <AppShell title="Master Creation">
      <PageHeader eyebrow="ADMINISTRATION" title="Master Creation" description="Manage the reference data used across loan operations." />

      <div className="report-tabs" role="tablist" aria-label="Master categories">
        {masterTypes.map(({ id, label, icon: Icon }) => (
          <button
            className={`report-tab${activeType === id ? ' active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeType === id}
            key={id}
            onClick={() => changeType(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <Card className="table-panel">
        <div className="panel-heading">
          <div>
            <h2>{activeMaster.label}</h2>
            <p>{rows.length} records · {rows.filter((row) => row.active).length} active</p>
          </div>
          <label className="filter-select" aria-label={`Search ${activeMaster.label}`}>
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" />
          </label>
        </div>

        <form className="filter-row" onSubmit={addMaster}>
          <input className="filter-select" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code" aria-label="Code" required />
          <input className="filter-select" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Name" required />
          <input className="filter-select" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={activeType === 'branches' ? 'City' : 'Description'} aria-label={activeType === 'branches' ? 'City' : 'Description'} />
          <button className="primary-button" type="submit"><Plus size={16} /> Add master</button>
        </form>
        {formError && <p role="alert" className="form-error">{formError}</p>}

        <div className="table-scroll">
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>{activeType === 'branches' ? 'City' : 'Description'}</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.code}>
                  <td><strong>{row.code}</strong></td>
                  <td>{row.name}</td>
                  <td>{row.detail}</td>
                  <td><span className={`status ${row.active ? 'status-green' : 'status-amber'}`}>{row.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="secondary-button" type="button" onClick={() => toggleMaster(row.code)} aria-label={`${row.active ? 'Deactivate' : 'Activate'} ${row.name}`}>
                      {row.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {row.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && <tr><td colSpan="5">No matching records.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}