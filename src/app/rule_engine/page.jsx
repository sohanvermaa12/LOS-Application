'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import RuleFormPopup from '../../components/RuleFormPopup';

const initialRules = [
  {
    id: 1,
    name: 'Minimum Applicant Age',
    loanType: 'Gold Loan',
    type: 'Eligibility',
    field: 'Applicant Age',
    operator: 'Less than',
    value: '18',
    action: 'Fail validation',
    errorMessage: 'Applicant does not meet the minimum age requirement.',
    active: true,
    changed: '14 Oct 2026 by Admin'
  },
  {
    id: 2,
    name: 'Gold Purity',
    loanType: 'Gold Loan',
    type: 'Validation',
    field: 'Gold Purity',
    operator: 'Less than',
    value: '[min purity]',
    action: 'Fail validation',
    errorMessage: 'Gold purity is below the minimum requirement.',
    active: true,
    changed: '12 Oct 2026 by Admin'
  },
  {
    id: 3,
    name: 'Gold Weight',
    loanType: 'Gold Loan',
    type: 'Validation',
    field: 'Net Weight',
    operator: 'Less than or equal to',
    value: '0',
    action: 'Fail validation',
    errorMessage: 'Enter a valid gold weight.',
    active: true,
    changed: '10 Oct 2026 by Admin'
  },
  {
    id: 4,
    name: 'Loan-to-Value (LTV)',
    loanType: 'Gold Loan',
    type: 'Calculation',
    field: 'Loan Amount',
    operator: 'Greater than',
    value: '[LTV limit]',
    action: 'Manual review',
    errorMessage: 'Loan amount exceeds the permitted LTV limit.',
    active: true,
    changed: '8 Oct 2026 by Admin'
  },
  {
    id: 5,
    name: 'KYC Verification',
    loanType: 'Business Loan',
    type: 'Document',
    field: 'KYC Status',
    operator: 'Not equal to',
    value: 'Verified',
    action: 'Fail validation',
    errorMessage: 'Complete KYC verification before continuing.',
    active: false,
    changed: '6 Oct 2026 by Admin'
  }
];

function conditionFor(rule) {
  const operators = {
    'Less than': '<',
    'Less than or equal to': '≤',
    'Equal to': '=',
    'Not equal to': '≠',
    'Greater than': '>',
    'Greater than or equal to': '≥'
  };
  return `${rule.field} ${operators[rule.operator] || rule.operator} ${rule.value}`;
}

export default function RuleEnginePage() {
  const [rules, setRules] = useState(initialRules);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All rule types');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredRules = useMemo(() => rules.filter((rule) => {
    const matchesSearch = `${rule.name} ${rule.type} ${rule.field} ${rule.loanType}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesType = typeFilter === 'All rule types' || rule.type === typeFilter;
    const matchesStatus = statusFilter === 'All statuses' || (statusFilter === 'Active' ? rule.active : !rule.active);
    return matchesSearch && matchesType && matchesStatus;
  }), [rules, search, typeFilter, statusFilter]);
  const selectedRule = rules.find((rule) => rule.id === selectedId) || null;

  function saveRule(ruleData) {
    if (ruleData.id) {
      setRules((current) => current.map((rule) => rule.id === ruleData.id ? { ...ruleData, changed: '14 Oct 2026 by Admin' } : rule));
    } else {
      setRules((current) => [{ ...ruleData, id: Date.now(), changed: '14 Oct 2026 by Admin' }, ...current]);
    }
    setShowAdd(false);
    setEditing(false);
  }

  function toggleActive(ruleId) {
    setRules((current) => current.map((rule) => rule.id === ruleId ? { ...rule, active: !rule.active, changed: '14 Oct 2026 by Admin' } : rule));
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setRules((current) => current.filter((rule) => rule.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) {
      setSelectedId(null);
      setEditing(false);
    }
    setDeleteTarget(null);
  }

  return (
    <AppShell title="Rule Engine">
      <div className="rule-engine">
        {selectedRule ? (
          <div className="rule-detail-view">
            <div className="rule-breadcrumb">
              <button type="button" onClick={() => { setSelectedId(null); setEditing(false); }}><ArrowLeft size={15} /> Rule Management</button>
              <span>/ {selectedRule.loanType}</span>
            </div>
            <div className="rule-detail-heading">
              <div>
                <h1>{editing ? 'Edit rule' : 'View rule'}</h1>
                <p>{editing ? 'Update the selected rule details.' : 'Details of the selected rule, with edit, deactivate and delete.'}</p>
              </div>
            </div>
            <section className="rule-detail-card">
              {editing ? (
                <RuleFormPopup
                  embedded
                  rule={selectedRule}
                  onCancel={() => setEditing(false)}
                  onSave={saveRule}
                />
              ) : (
                <>
                  <div className="rule-detail-title">
                    <h2>{selectedRule.name}</h2>
                    <span className={`rule-status ${selectedRule.active ? 'active' : 'inactive'}`}>{selectedRule.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <dl className="rule-detail-list">
                    <div><dt>Loan product</dt><dd>{selectedRule.loanType}</dd></div>
                    <div><dt>Rule type</dt><dd>{selectedRule.type}</dd></div>
                    <div><dt>Condition</dt><dd>{conditionFor(selectedRule)}</dd></div>
                    <div><dt>Action</dt><dd>{selectedRule.action}</dd></div>
                    <div><dt>Error message</dt><dd>{selectedRule.errorMessage}</dd></div>
                    <div><dt>Last changed</dt><dd>{selectedRule.changed}</dd></div>
                  </dl>
                  <div className="rule-detail-actions">
                    <button type="button" className="rule-button primary" onClick={() => setEditing(true)}>Edit</button>
                    <button
                      type="button"
                      className={`rule-switch rule-detail-switch ${selectedRule.active ? 'on' : ''}`}
                      role="switch"
                      aria-checked={selectedRule.active}
                      aria-label={`${selectedRule.active ? 'Deactivate' : 'Activate'} ${selectedRule.name}`}
                      title={selectedRule.active ? 'Deactivate' : 'Activate'}
                      onClick={() => toggleActive(selectedRule.id)}
                    ><span /></button>
                    <button type="button" className="rule-button danger-outline" onClick={() => setDeleteTarget(selectedRule)}>Delete</button>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : (
          <>
            <div
              className="rule-list-heading"
              style={{ marginTop: '-15px', marginBottom: '20px' }}
            >
              <h1 style={{ margin: 0, color: '#23474C', font: '700 24px Manrope' }}>
                Rules Management
              </h1>

              <button
                type="button"
                className="rule-button primary add-rule-button"
                onClick={() => setShowAdd(true)}
              >
                <Plus size={16} /> Add Rule
              </button>
            </div>

            <div className="rule-filters">
              <label className="rule-search">
                <Search size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rules" aria-label="Search rules" />
              </label>
              <select aria-label="Filter by rule type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option>All rule types</option>
                <option>Eligibility</option>
                <option>Validation</option>
                <option>Calculation</option>
                <option>Document</option>
                <option>Workflow</option>
              </select>
              <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <section className="rule-table-card">
              <div className="rule-table-scroll">
                <table className="rule-table">
                  <thead><tr><th>Rule name</th><th>Type</th><th>Condition</th><th>Action</th><th>Status</th><th className="rule-actions-heading">Actions</th></tr></thead>
                  <tbody>
                    {filteredRules.map((rule) => (
                      <tr key={rule.id}>
                        <td><strong>{rule.name}</strong></td>
                        <td>{rule.type}</td>
                        <td>{conditionFor(rule)}</td>
                        <td>{rule.action}</td>
                        <td><span className={`rule-status ${rule.active ? 'active' : 'inactive'}`}>{rule.active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <div className="rule-row-actions">
                            <button type="button" className="rule-icon-action" aria-label={`View ${rule.name}`} title="View" onClick={() => { setSelectedId(rule.id); setEditing(false); }}><Eye size={16} /></button>
                            <button type="button" className="rule-icon-action" aria-label={`Edit ${rule.name}`} title="Edit" onClick={() => { setSelectedId(rule.id); setEditing(true); }}><Pencil size={15} /></button>
                            <button
                              type="button"
                              className={`rule-switch ${rule.active ? 'on' : ''}`}
                              role="switch"
                              aria-checked={rule.active}
                              aria-label={`${rule.active ? 'Deactivate' : 'Activate'} ${rule.name}`}
                              title={rule.active ? 'Deactivate' : 'Activate'}
                              onClick={() => toggleActive(rule.id)}
                            ><span /></button>
                            <button type="button" className="rule-icon-action delete-link" aria-label={`Delete ${rule.name}`} title="Delete" onClick={() => setDeleteTarget(rule)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRules.length === 0 && <tr><td colSpan="6" className="rule-empty">No rules match your search or filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {showAdd && <RuleFormPopup onCancel={() => setShowAdd(false)} onSave={saveRule} />}
        {deleteTarget && (
          <div className="rule-delete-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null); }}>
            <section className="rule-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-rule-title">
              <h2 id="delete-rule-title">Delete this rule?</h2>
              <p>“{deleteTarget.name}” will be removed from {deleteTarget.loanType}.<br />This cannot be undone.</p>
              <div className="rule-delete-actions">
                <button type="button" className="rule-button secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button type="button" className="rule-button delete-solid" onClick={confirmDelete}>Delete rule</button>
              </div>
            </section>
          </div>
        )}
      </div>
      <style>{`
        .rule-engine{max-width:1340px;margin:0 auto;color:#17334d}
        .rule-list-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:23px}
        .rule-list-heading h1,.rule-detail-heading h1{margin:0;color:#142e47;font:700 27px Manrope,Arial,sans-serif;letter-spacing:-.55px}
        .rule-button{min-height:38px;padding:0 15px;border:1px solid #cbd6e2;border-radius:7px;background:#fff;color:#16344d;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:7px;white-space:nowrap}
        .rule-button:hover{background:#f7fafc}
        .rule-button.primary{border-color:#117573;background:#117573;color:#fff}
        .rule-button.primary:hover{background:#0c6463}
        .add-rule-button{min-height:43px;padding:0 18px;font-size:13px}
        .rule-filters{display:grid;grid-template-columns:minmax(220px,1fr) 180px 160px;gap:12px;margin-bottom:23px}
        .rule-search{height:44px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #cbd6e2;border-radius:8px;background:#fff;color:#8494a5}
        .rule-search input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#17334d;font-size:13px}
        .rule-search input::placeholder{color:#7f8d9d}
        .rule-filters select{height:44px;width:100%;padding:0 12px;border:1px solid #cbd6e2;border-radius:8px;background:#fff;color:#18334d;font-size:13px}
        .rule-table-card,.rule-detail-card{overflow:hidden;border:1px solid #d8e1eb;border-radius:11px;background:#fff}
        .rule-table-scroll{overflow-x:auto;padding:0 8px}
        .rule-table{width:100%;min-width:850px;border-collapse:collapse;text-align:left}
        .rule-table th{height:44px;padding:0 14px;border-bottom:1px solid #d8e1eb;background:#fff;color:#3a536c;font-size:11px;text-transform:none;letter-spacing:0}
        .rule-table th.rule-actions-heading{text-align:right}
        .rule-table td{height:47px;padding:0 14px;border-bottom:1px solid #e8edf2;color:#17334d;font-size:13px;white-space:nowrap}
        .rule-table tbody tr:last-child td{border-bottom:0}
        .rule-table tbody tr:hover{background:#fbfcfe}
        .rule-table td strong{color:#122f4c;font-size:13px}
        .rule-status{display:inline-flex;align-items:center;justify-content:center;min-width:56px;padding:5px 10px;border-radius:20px;font-size:10px;font-weight:700}
        .rule-status.active{background:#dcf3e6;color:#167344}
        .rule-status.inactive{background:#e9edf1;color:#526578}
        .rule-row-actions{display:flex;align-items:center;justify-content:flex-end;gap:13px}
        .rule-row-actions .rule-icon-action{width:26px;height:28px;padding:0;display:inline-grid;place-items:center;border-radius:5px;color:#126879}
        .rule-row-actions .rule-icon-action:hover{background:#edf5f5}
        .rule-row-actions .rule-icon-action.delete-link{color:#c42323}
        .rule-row-actions .rule-icon-action.delete-link:hover{background:#fff0f0}
        .rule-switch{width:34px;height:19px;padding:2px;border:0;border-radius:20px;background:#c7d0da;display:flex;align-items:center;transition:background .15s ease}
        .rule-switch span{width:15px;height:15px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #18334d35;transition:transform .15s ease}
        .rule-switch.on{background:#16816e}
        .rule-switch.on span{transform:translateX(15px)}
    .rule-detail-switch{position:relative;width:48px;height:38px;flex:0 0 48px;padding:0;border:1px solid #cbd6e2;border-radius:7px;background:#fff;justify-content:center}
.rule-detail-switch::before{position:absolute;top:9px;left:6px;width:34px;height:19px;border-radius:20px;background:#c7d0da;content:"";transition:background .15s ease}
        .rule-detail-switch.on{background:#fff}
        .rule-detail-switch.on::before{background:#16816e}
      .rule-detail-switch span{position:absolute;top:11px;left:6px}
        .rule-detail-switch.on span{transform:translateX(15px)}
        .rule-switch:focus-visible,.rule-row-actions .rule-icon-action:focus-visible{outline:2px solid #167c78;outline-offset:2px}
        .rule-empty{height:80px!important;text-align:center;color:#738398!important}
        .rule-breadcrumb{display:flex;align-items:center;gap:7px;margin:-5px 0 8px;color:#576f86;font-size:11px}
        .rule-detail-view{width:100%;max-width:780px;margin-inline:auto}
        .rule-breadcrumb button{display:inline-flex;align-items:center;gap:5px;padding:0;color:#315775;font-size:11px}
        .rule-breadcrumb button:hover{text-decoration:underline}
        .rule-detail-heading{margin-bottom:20px}
        .rule-detail-heading h1{font-size:23px}
        .rule-detail-heading p{margin:5px 0 0;color:#536b81;font-size:12px}
        .rule-detail-card{padding:19px 20px}
        .rule-detail-title{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:0 0 10px}
        .rule-detail-title h2{margin:0;color:#142f4b;font:700 14px Manrope,Arial,sans-serif}
        .rule-detail-list{margin:0}
        .rule-detail-list>div{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #e8edf2}
        .rule-detail-list dt{color:#526c83;font-size:11px}
        .rule-detail-list dd{margin:0;color:#16334d;font-size:11px;font-weight:700;text-align:right}
        .rule-detail-actions{display:flex;gap:16px;margin-top:15px}
        .rule-form-dialog{width:min(100%,430px);max-height:min(92vh,760px);overflow-y:auto;padding:17px 19px;border:1px solid #d8e1eb;border-radius:11px;background:#fff;box-shadow:0 16px 40px rgba(25,49,75,.2)}
        .rule-form{display:grid;gap:14px}
        .rule-form-heading{padding-bottom:2px}
        .rule-form-heading h2{margin:0;color:#15334e;font:700 19px Manrope,Arial,sans-serif}
        .rule-form-heading p{margin:4px 0 0;color:#61758a;font-size:11px}
        .rule-form-field{display:grid;gap:6px;min-width:0;color:#39556f;font-size:10px;font-weight:700}
        .rule-form-field input,.rule-form-field select{width:100%;height:36px;padding:0 9px;border:1px solid #cbd6e2;border-radius:6px;background:#fff;color:#17334d;font-size:12px;font-weight:400;outline:0}
        .rule-form-field input:focus,.rule-form-field select:focus{border-color:#117573;box-shadow:0 0 0 2px rgba(17,117,115,.13)}
        .rule-form-type{display:grid;gap:7px;color:#39556f;font-size:10px;font-weight:700}
        .rule-type-options{display:flex;flex-wrap:wrap;gap:6px}
        .rule-type-options button{min-height:29px;padding:0 10px;border:1px solid #cbd6e2;border-radius:18px;background:#fff;color:#294861;font-size:10px}
        .rule-type-options button.selected{border-color:#117573;background:#117573;color:#fff}
        .rule-form-condition{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}
        .rule-form-active{display:flex;align-items:center;gap:7px;color:#25435e;font-size:11px}
        .rule-form-active input{margin:0;accent-color:#117573}
        .rule-form-actions{display:flex;justify-content:flex-end;gap:9px;padding-top:2px}
        .rule-detail-card>.rule-form{gap:16px}
        .rule-button.secondary{border-color:#cbd6e2;background:#fff}
        .rule-button.danger-outline{border-color:#c92727;color:#c92727}
        .rule-button.danger-outline:hover{background:#fff7f7}
        .rule-delete-overlay,.rule-form-overlay{position:fixed;z-index:1200;inset:0;display:grid;place-items:center;padding:18px;background:rgba(19,39,61,.34)}
        .rule-delete-dialog{width:min(100%,344px);padding:20px;border:1px solid #d9e1e9;border-radius:11px;background:#fff;box-shadow:0 12px 32px rgba(25,49,75,.16)}
        .rule-delete-dialog h2{margin:0 0 8px;color:#17334d;font:700 14px Manrope,Arial,sans-serif}
        .rule-delete-dialog p{margin:0;color:#4f6880;font-size:11px;line-height:1.6}
        .rule-delete-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:15px}
        .rule-button.delete-solid{border-color:#bd251d;background:#bd251d;color:white}
        .rule-button.delete-solid:hover{background:#a51d17}
        @media(max-width:700px){.rule-list-heading h1{font-size:23px}.rule-filters{grid-template-columns:1fr 1fr}.rule-search{grid-column:1/-1}.rule-detail-card{padding:15px}.rule-detail-list>div{align-items:flex-start;padding:9px 0}.rule-detail-list dd{max-width:65%}.rule-form-condition{grid-template-columns:1fr 1fr}.rule-form-condition .rule-form-field:last-child{grid-column:1/-1}}
        @media(max-width:420px){.rule-filters{grid-template-columns:1fr}.rule-search{grid-column:auto}.rule-detail-actions{flex-wrap:wrap}.rule-button{padding:0 11px}}
      `}</style>
    </AppShell>
  );
}
