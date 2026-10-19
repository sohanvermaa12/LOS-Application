'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import NewLead from '../../components/NewLead';
import LeadDetails from '../../components/LeadDetails';
import { saveLeads } from '../../services/leadService';
import { getAllLeads } from '../../services/lead_management';

const leadTableColumns = [
  ['id', 'Lead ID'],
  ['firstName', 'First Name'],
  ['lastName', 'Last Name'],
  ['mobileNumber', 'Mobile Number'],
  ['assignedBy', 'Assigned By'],
  ['assignedToName', 'Assigned To'],
  ['status', 'Status'],
  ['date', 'Lead Date'],
];

const leadFieldValue = (lead, field) => {
  const aliases = {
    mobileNumber: lead.mobileNumber || lead.mobile,
    assignedBy: lead.assignedBy || lead.createdBy,
    assignedToName: lead.assignedToName || lead.assignedCheckerName || lead.assignedViewerName,
    date: lead.date || lead.leadDate,
  };
  return Object.prototype.hasOwnProperty.call(aliases, field) ? aliases[field] : lead[field];
};

const statusKeys = {
  Pending: 'new',
  New: 'new',
  'In Progress': 'progress',
  Contacted: 'contacted',
  Qualified: 'qualified',
  'On Hold': 'progress',
  Rejected: 'progress',
  Converted: 'qualified',
  NEW: 'new',
  PENDING: 'new',
  IN_PROGRESS: 'progress',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  REJECTED: 'progress',
  CONVERTED: 'qualified',
};

const LEADS_PER_PAGE = 5;

const toIsoDate = (date) => {
  const value = String(date || '');
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const [day, month, year] = value.split('-');
  return year && month && day ? `${year}-${month}-${day}` : '';
};

const normalizeLeadRecord = (lead) => {
  const nameParts = String(lead.customerName || lead.name || '').trim().split(/\s+/).filter(Boolean);
  const apiDate = lead.date || lead.leadDate || lead.createdAt || '';
  const dateMatch = String(apiDate).match(/^(\d{4})-(\d{2})-(\d{2})/);

  return {
    ...lead,
    id: lead.leadId || lead.id || lead._id || '',
    firstName: lead.firstName || nameParts[0] || '',
    lastName: lead.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''),
    mobileNumber: lead.mobileNumber || lead.mobile || lead.phoneNumber || '',
    assignedBy: lead.assignedBy || lead.createdBy || '',
    assignedToName: lead.assignedToName || lead.assignedCheckerName || lead.assignedViewerName || '',
    date: dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : apiDate,
    name: lead.customerName || lead.name || nameParts.join(' '),
    status: lead.leadStatus || lead.status || 'New',
    product: lead.loanProductType || lead.product || '',
    amount: lead.loanAmount ?? lead.amount ?? '',
    source: lead.leadAcquisitionChannel || lead.acquisitionChannel || lead.source || '',
  };
};

const leadManagementStyles = `
.lm-page{max-width:1480px;margin:0 auto;padding:4px 0 28px;color:#20383a;font-family:var(--font-sans,inherit)}
.lm-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:19px}
.lm-heading-copy span{color:#748789;font-size:10px;font-weight:800;letter-spacing:.1em}
.lm-heading-copy h1{margin:5px 0 4px;color:#193f42;font-size:24px;font-weight:750}
.lm-heading-copy p{margin:0;color:#748587;font-size:12px;line-height:1.5}
.lm-add-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 15px;border:1px solid #177e7a;border-radius:5px;background:#177e7a;color:#fff;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer}
.lm-add-button:hover{border-color:#0c6662;background:#0c6662}
.lm-toolbar{display:grid;grid-template-columns:minmax(250px,1.5fr) minmax(155px,.75fr) repeat(2,minmax(145px,.7fr)) auto;align-items:end;gap:12px;margin-bottom:14px;padding:14px;border:1px solid #dfe8e6;border-radius:6px;background:#f8faf9}
.lm-filter{display:grid;gap:6px;min-width:0;color:#52696b;font-size:10px;font-weight:700}
.lm-search-box{display:flex;align-items:center;gap:8px;min-width:0;height:39px;padding:0 10px;border:1px solid #cbd9d7;border-radius:5px;background:#fff;color:#78898a}
.lm-search-box:focus-within{border-color:#568e88;box-shadow:0 0 0 3px rgba(23,126,122,.1)}
.lm-search-box input{width:100%;min-width:0;height:100%;border:0;outline:0;background:transparent;color:#203c42;font:inherit;font-size:12px}
.lm-filter select,.lm-filter input{width:100%;min-width:0;height:39px;padding:0 10px;border:1px solid #cbd9d7;border-radius:5px;background:#fff;color:#30494b;font:inherit;font-size:12px;outline:none}
.lm-filter select:focus,.lm-filter input:focus{border-color:#568e88;box-shadow:0 0 0 3px rgba(23,126,122,.1)}
.lm-reset{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:39px;padding:0 11px;border:1px solid #cfddda;border-radius:5px;background:#fff;color:#536a6c;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}
.lm-reset:hover{background:#eff6f4}
.lm-results{overflow:hidden;border:1px solid #dfe8e6;border-radius:6px;background:#fff}
.lm-results-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #e8eeec;color:#738486;font-size:10px}
.lm-results-meta strong{color:#355356;font-size:11px}
.lm-table-wrap{overflow:auto;max-width:100%}
.lm-table{width:100%;min-width:890px;border-collapse:collapse;table-layout:auto}
.lm-table th,.lm-table td{height:48px;padding:9px 12px;border-bottom:1px solid #edf1f0;text-align:left;white-space:nowrap;font-size:11px}
.lm-table th{height:40px;background:#f5f8f7;color:#5a7072;font-size:9px;font-weight:800;letter-spacing:.035em;text-transform:uppercase}
.lm-table tbody tr:hover{background:#fafcfb}
.lm-table tbody tr:last-child td{border-bottom:0}
.lm-table td{color:#354d4f}
.lm-table .lm-id{color:#176e67;font-weight:750}
.lm-status{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border:1px solid #e1e9e7;border-radius:4px;background:#f6f8f7;color:#536a6c;font-size:10px;font-weight:700}
.lm-status:before{width:6px;height:6px;border-radius:50%;background:#9bacaa;content:''}
.lm-status.status-new{border-color:#d5e5e3;background:#f0f7f5;color:#256c67}.lm-status.status-new:before{background:#49978a}
.lm-status.status-progress{border-color:#efe4c8;background:#fffaf0;color:#846b31}.lm-status.status-progress:before{background:#c59a40}
.lm-status.status-contacted{border-color:#d7e6f0;background:#f2f8fb;color:#3e6f8c}.lm-status.status-contacted:before{background:#5b9aba}
.lm-status.status-qualified{border-color:#cfe5d9;background:#f1faf4;color:#32744d}.lm-status.status-qualified:before{background:#4e9a67}
.lm-actions{display:flex;align-items:center;gap:5px}
.lm-action{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:30px;padding:0 8px;border:1px solid #d8e3e1;border-radius:4px;background:#fff;color:#315d5b;font-size:10px;font-weight:700;cursor:pointer}
.lm-action:hover{border-color:#a9cbc3;background:#f1f8f5}
.lm-empty{padding:42px 18px!important;text-align:center!important;color:#718284!important}
.lm-load-error{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding:11px 13px;border:1px solid #efcaca;border-radius:5px;background:#fff5f5;color:#9d3030;font-size:12px}
.lm-load-error button{border:1px solid #d9aaaa;border-radius:4px;background:#fff;color:#8c3030;padding:6px 10px;font:inherit;font-weight:700;cursor:pointer}
.lm-pagination{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 14px;border-top:1px solid #e8eeec;color:#718284;font-size:10px}
.lm-pager{display:flex;align-items:center;gap:7px}
.lm-pager button{display:grid;place-items:center;width:30px;height:30px;border:1px solid #d8e3e1;border-radius:4px;background:#fff;color:#456567;cursor:pointer}
.lm-pager button:hover:not(:disabled){background:#f1f8f5}.lm-pager button:disabled{cursor:not-allowed;opacity:.45}
.lm-page-number{min-width:48px;text-align:center;color:#496163;font-weight:700}
@media(max-width:880px){.lm-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}.lm-filter-search{grid-column:1/-1}.lm-reset{justify-self:start}}
@media(max-width:540px){.lm-page{padding-top:0}.lm-heading{align-items:flex-start;flex-direction:column;gap:12px}.lm-add-button{width:100%}.lm-toolbar{grid-template-columns:1fr;padding:12px}.lm-filter-search{grid-column:auto}.lm-reset{width:100%}.lm-results-meta{align-items:flex-start;flex-direction:column}.lm-pagination{align-items:flex-start;flex-direction:column}}
`;

export default function LeadManagementPage() {
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isActive = true;
    setIsLoadingLeads(true);
    setLoadError('');

    getAllLeads()
      .then((records) => {
        if (isActive) setLeads(records.map(normalizeLeadRecord));
      })
      .catch((error) => {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load leads.');
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingLeads(false);
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, assignedToFilter, fromDate, toDate]);

  const handleCreateLead = (form, response) => {
    setLeads((current) => {
      const nextId = Math.max(...current.map((lead) => Number(String(lead.id).replace(/\D/g, ''))), 0) + 1;
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      const leadId = response?.leadId || response?.data?.leadId || response?.id || `LD${String(nextId).padStart(6, '0')}`;

      return [{
        ...form,
        id: leadId,
        name: form.customerName,
        mobile: form.mobileNumber,
        date,
        status: form.assignedToId ? 'In Progress' : 'Pending',
        statusKey: statusKeys[form.assignedToId ? 'In Progress' : 'Pending'],
        branch: '',
        product: form.loanProductType,
        amount: Number(form.loanAmount).toLocaleString('en-IN'),
        remarks: '',
      }, ...current];
    });
  };

  const handleUpdateLead = (form) => {
    const nextLeads = leads.map((lead) => (
      lead.id === editingLead?.id
        ? {
          ...lead,
          ...form,
          id: lead.id,
          name: form.customerName,
          mobile: form.mobileNumber,
          product: form.loanProductType,
          amount: Number(form.loanAmount).toLocaleString('en-IN'),
          status: form.assignedToId ? 'In Progress' : (form.status || lead.status),
          statusKey: statusKeys[form.assignedToId ? 'In Progress' : (form.status || lead.status)] || 'new',
        }
        : lead
    ));
    setLeads(saveLeads(nextLeads));
    setEditingLead(null);
  };

  const openLeadEditor = (lead) => {
    setSelectedLead(null);
    setEditingLead(lead);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchQuery(searchInput.trim().toLowerCase());
  };
  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setAssignedToFilter('All');
    setFromDate('');
    setToDate('');
  };

  const filteredLeads = leads.filter((lead) => {
    const assignedToMatches = assignedToFilter === 'All' || leadFieldValue(lead, 'assignedToName') === assignedToFilter;
    const leadDate = toIsoDate(leadFieldValue(lead, 'date'));
    const fromMatches = !fromDate || Boolean(leadDate && leadDate >= fromDate);
    const toMatches = !toDate || Boolean(leadDate && leadDate <= toDate);
    const fieldValues = ['id', 'firstName', 'lastName', 'mobileNumber', 'assignedBy', 'assignedToName'].map((field) => leadFieldValue(lead, field));
    const searchMatches = !searchQuery || fieldValues.some((value) => String(value ?? '').toLowerCase().includes(searchQuery));
    return assignedToMatches && fromMatches && toMatches && searchMatches;
  });
  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE));
  const visiblePage = Math.min(currentPage, pageCount);
  const pageStart = filteredLeads.length ? (visiblePage - 1) * LEADS_PER_PAGE : 0;
  const paginatedLeads = filteredLeads.slice(pageStart, pageStart + LEADS_PER_PAGE);
  const pageEnd = Math.min(pageStart + LEADS_PER_PAGE, filteredLeads.length);
  const assignedUsers = [...new Set(leads.map((lead) => leadFieldValue(lead, 'assignedToName')).filter(Boolean))];

  return (
    <>
      <AppShell title="Lead Management">
        <style>{leadManagementStyles}</style>
        <main className="lm-page">
          <header className="lm-heading">
            <div className="lm-heading-copy"><span>SALES OPERATIONS</span><h1>Lead Management</h1><p>Track applicants, ownership and lead progress.</p></div>
            <button type="button" className="lm-add-button" onClick={() => setShowNewLead(true)}><Plus size={16} /> Add New Lead</button>
          </header>

          <section className="lm-toolbar" aria-label="Lead filters">
            <label className="lm-filter lm-filter-search" htmlFor="lead-search-text">Search leads
              <span className="lm-search-box"><Search size={15} aria-hidden="true" /><input id="lead-search-text" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }} onBlur={handleSearch} placeholder="Lead ID, name, mobile or assignee" /></span>
            </label>
            <label className="lm-filter" htmlFor="lead-assigned-to">Assigned to
              <select id="lead-assigned-to" value={assignedToFilter} onChange={(event) => setAssignedToFilter(event.target.value)}>
                <option value="All">All assignees</option>
                {assignedUsers.map((user) => <option key={user} value={user}>{user}</option>)}
              </select>
            </label>
            <label className="lm-filter" htmlFor="lead-from-date">Lead date from<input id="lead-from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
            <label className="lm-filter" htmlFor="lead-to-date">Lead date to<input id="lead-to-date" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
            {(searchInput || assignedToFilter !== 'All' || fromDate || toDate) && <button type="button" className="lm-reset" onClick={clearFilters}><X size={14} /> Clear filters</button>}
          </section>

          {loadError ? <div className="lm-load-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button></div> : null}

          <section className="lm-results" aria-label="Lead records">
            <div className="lm-results-meta"><strong>{filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}</strong><span>Search covers lead ID, first and last name, mobile number, and assignee.</span></div>
            <div className="lm-table-wrap">
              <table className="lm-table">
                <thead><tr>{leadTableColumns.map(([, label]) => <th key={label}>{label}</th>)}<th>Actions</th></tr></thead>
                <tbody>
                  {isLoadingLeads ? <tr><td className="lm-empty" colSpan={leadTableColumns.length + 1}>Loading leads...</td></tr>
                  : loadError ? <tr><td className="lm-empty" colSpan={leadTableColumns.length + 1}>Unable to load leads. Retry the request above.</td></tr>
                  : paginatedLeads.length ? paginatedLeads.map((lead) => (
                    <tr key={lead.id}>
                      {leadTableColumns.map(([field]) => (
                        <td key={field} className={field === 'id' ? 'lm-id' : undefined}>
                          {field === 'status'
                            ? <span className={`lm-status status-${lead.statusKey || statusKeys[lead.status] || 'new'}`}>{lead.status || 'New'}</span>
                            : String(leadFieldValue(lead, field) ?? '—')}
                        </td>
                      ))}
                      <td><div className="lm-actions">
                        <button type="button" className="lm-action" onClick={() => setSelectedLead(lead)} aria-label={`View lead ${lead.id}`} title="View lead"><Eye size={14} /> View</button>
                        <button type="button" className="lm-action" onClick={() => openLeadEditor(lead)} aria-label={`Edit lead ${lead.id}`} title="Edit lead"><Pencil size={14} /> Edit</button>
                      </div></td>
                    </tr>
                  )) : <tr><td className="lm-empty" colSpan={leadTableColumns.length + 1}>No leads match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="lm-pagination">
              <span>Showing {filteredLeads.length ? pageStart + 1 : 0}–{pageEnd} of {filteredLeads.length}</span>
              <div className="lm-pager">
                <button aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={visiblePage === 1}><ChevronLeft size={15} /></button>
                <span className="lm-page-number">{visiblePage} / {pageCount}</span>
                <button aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={visiblePage === pageCount}><ChevronRight size={15} /></button>
              </div>
            </footer>
          </section>
        </main>
      </AppShell>

      <NewLead
        key={editingLead?.id || 'new-lead'}
        open={showNewLead || Boolean(editingLead)}
        initialData={editingLead}
        onClose={() => {
          setShowNewLead(false);
          setEditingLead(null);
        }}
        onCreate={handleCreateLead}
        onUpdate={handleUpdateLead}
      />
      <LeadDetails
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onEdit={(lead) => openLeadEditor(lead)}
      />
    </>
  );
}