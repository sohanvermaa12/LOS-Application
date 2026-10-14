'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search } from 'lucide-react';
import AppShell from '../../components/AppShell';
import NewLead from '../../components/NewLead';
import LeadDetails from '../../components/LeadDetails';

const leadTableColumns = [
  ['id', 'Lead ID'],
  ['customerName', 'Customer Name'],
  ['namePrefix', 'Title'],
  ['firstName', 'First Name'],
  ['middleName', 'Middle Name'],
  ['lastName', 'Last Name'],
  ['mobileNumber', 'Mobile Number'],
  ['email', 'Email ID'],
  ['dateOfBirth', 'Date of Birth'],
  ['age', 'Age'],
  ['customerType', 'Customer Type'],
  ['gender', 'Gender'],
  ['maritalStatus', 'Marital Status'],
  ['residentialStatus', 'Residential Status'],
  ['dependents', 'Dependents'],
  ['panCard', 'PAN Card'],
  ['aadhaarCard', 'Aadhaar Card'],
  ['passportNo', 'Passport Number'],
  ['passportExpiryDate', 'Passport Expiry Date'],
  ['loanProductType', 'Loan Product Type'],
  ['loanAmount', 'Loan Amount'],
  ['loanPurpose', 'Loan Purpose'],
  ['collateral', 'Down Payment / Collateral'],
  ['tenure', 'Tenure'],
  ['instalments', 'Instalments'],
  ['interestRate', 'Interest Rate'],
  ['monthlyEmi', 'Monthly EMI'],
  ['totalInterest', 'Total Interest'],
  ['securityAmount', 'Total Amount'],
  ['employmentType', 'Employment Type'],
  ['annualIncome', 'Annual Income'],
  ['designation', 'Designation'],
  ['employerName', 'Employer / Business'],
  ['location', 'Location'],
  ['state', 'State'],
  ['takeHomePay', 'Take Home Pay'],
  ['deductions', 'Deductions'],
  ['bankName', 'Bank Name'],
  ['primaryBankAccount', 'Bank Account'],
  ['acquisitionChannel', 'Acquisition Channel'],
  ['referralDate', 'Referral Date'],
  ['partnerId', 'Partner ID'],
  ['partnerName', 'Partner Name'],
  ['employeeId', 'Employee ID'],
  ['employeeName', 'Employee Name'],
  ['assignedBy', 'Assigned By'],
  ['assignedToName', 'Assigned To'],
  ['status', 'Status'],
  ['date', 'Lead Date'],
];

const leadSearchFields = [
  { value: 'all', label: 'All lead fields' },
  ...leadTableColumns.map(([value, label]) => ({ value, label })),
];

const leadFieldValue = (lead, field) => {
  const aliases = {
    customerName: lead.customerName || lead.name,
    mobileNumber: lead.mobileNumber || lead.mobile,
    loanProductType: lead.loanProductType || lead.product,
    loanAmount: lead.loanAmount || lead.amount,
    acquisitionChannel: lead.acquisitionChannel || lead.source,
  };
  return Object.prototype.hasOwnProperty.call(aliases, field) ? aliases[field] : lead[field];
};

const maskSensitiveValue = (field, value) => {
  const text = String(value ?? '');
  if (field === 'aadhaarCard' && text.length >= 4) return `XXXX-XXXX-${text.slice(-4)}`;
  if (field === 'panCard' && text.length >= 4) return `${text.slice(0, 2)}XXXXXX${text.slice(-2)}`;
  if (field === 'primaryBankAccount' && text.length >= 4) return `••••${text.slice(-4)}`;
  return text;
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
};

const LEADS_PER_PAGE = 5;

const toIsoDate = (date) => {
  const [day, month, year] = String(date || '').split('-');
  return year && month && day ? `${year}-${month}-${day}` : '';
};

const initialLeads = [
  { id: 'LD000123', name: 'Neha Patil', mobile: '9876543210', email: 'neha.patil@gmail.com', source: 'Website', date: '26-09-2026', status: 'New', statusKey: 'new', branch: 'Pune - FC Road', product: 'Home Loan', amount: '25,00,000', remarks: 'Interested in home loan, please contact me.' },
  { id: 'LD000122', name: 'Rohit Sharma', mobile: '8765432109', email: 'rohit.sharma@gmail.com', source: 'Mobile App', date: '25-09-2026', status: 'In Progress', statusKey: 'progress', branch: 'Koramangala', product: 'Personal Loan', amount: '12,00,000', remarks: 'Looking for quick processing.' },
  { id: 'LD000121', name: 'Pooja Deshmukh', mobile: '9123456780', email: 'pooja.deshmukh@gmail.com', source: 'Branch Office', date: '25-09-2026', status: 'Contacted', statusKey: 'contacted', branch: 'Andheri West', product: 'Business Loan', amount: '18,50,000', remarks: 'Waiting for discussion callback.' },
  { id: 'LD000120', name: 'Amit Joshi', mobile: '9988776655', email: 'amit.joshi@gmail.com', source: 'Partner Network', date: '24-09-2026', status: 'New', statusKey: 'new', branch: 'Pimpri', product: 'Home Loan', amount: '30,00,000', remarks: 'Family property loan inquiry.' },
  { id: 'LD000119', name: 'Sneha Kulkarni', mobile: '9098765432', email: 'sneha.kulkarni@gmail.com', source: 'Sales Team', date: '24-09-2026', status: 'Qualified', statusKey: 'qualified', branch: 'Salt Lake', product: 'Personal Loan', amount: '9,50,000', remarks: 'Documents uploaded and pending review.' },

];

export default function LeadManagementPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [searchField, setSearchField] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, statusFilter, fromDate, toDate]);

  const handleCreateLead = (form) => {
    setLeads((current) => {
      const nextId = Math.max(...current.map((lead) => Number(lead.id.replace(/\D/g, ''))), 0) + 1;
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      return [{
        ...form,
        id: `LD${String(nextId).padStart(6, '0')}`,
        name: form.customerName,
        mobile: form.mobileNumber,
        source: form.acquisitionChannel,
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
    setLeads((current) => current.map((lead) => (
      lead.id === editingLead?.id
        ? {
          ...lead,
          ...form,
          id: lead.id,
          name: form.customerName,
          mobile: form.mobileNumber,
          source: form.acquisitionChannel,
          product: form.loanProductType,
          amount: Number(form.loanAmount).toLocaleString('en-IN'),
          status: form.assignedToId ? 'In Progress' : (form.status || lead.status),
          statusKey: statusKeys[form.assignedToId ? 'In Progress' : (form.status || lead.status)] || 'new',
        }
        : lead
    )));
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
    setSearchField('all');
    setSearchInput('');
    setSearchQuery('');
    setSourceFilter('All');
    setStatusFilter('All');
    setFromDate('');
    setToDate('');
  };

  const filteredLeads = leads.filter((lead) => {
    const sourceMatches = sourceFilter === 'All' || lead.source === sourceFilter;
    const statusMatches = statusFilter === 'All' || lead.status === statusFilter;
    const leadDate = toIsoDate(lead.date);
    const fromMatches = !fromDate || Boolean(leadDate && leadDate >= fromDate);
    const toMatches = !toDate || Boolean(leadDate && leadDate <= toDate);
    const fieldValues = searchField === 'all'
    ? leadTableColumns.map(([field]) => leadFieldValue(lead, field))
    : [leadFieldValue(lead, searchField)];
    const searchMatches = !searchQuery || fieldValues.some((value) => String(value ?? '').toLowerCase().includes(searchQuery));
    return sourceMatches && statusMatches && fromMatches && toMatches && searchMatches;
  });
  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE));
  const visiblePage = Math.min(currentPage, pageCount);
  const pageStart = filteredLeads.length ? (visiblePage - 1) * LEADS_PER_PAGE : 0;
  const paginatedLeads = filteredLeads.slice(pageStart, pageStart + LEADS_PER_PAGE);
  const pageEnd = Math.min(pageStart + LEADS_PER_PAGE, filteredLeads.length);

  return (
    <>
      <AppShell title="Lead Management">
        <div className="lead-page">
        <div className="lead-header-row">
          <button type="button" className="new-lead-button" onClick={() => setShowNewLead(true)}>
            <Plus size={16} />
            Add New Lead
          </button>
        </div>

          <div className="lead-toolbar">
          <div className="lead-filter lead-search-by">
            <label htmlFor="lead-search-field">Search by</label>
            <div className="select-wrap">
              <select id="lead-search-field" value={searchField} onChange={(event) => setSearchField(event.target.value)}>
                {leadSearchFields.map((field) => <option key={field.value} value={field.value}>{field.label}</option>)}
              </select>
            </div>
          </div>

          <label className="lead-filter lead-search-text" htmlFor="lead-search-text">
            <span>Search</span>
            <div className="lead-search-input">
              <Search size={15} aria-hidden="true" />
              <input
                id="lead-search-text"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
                placeholder={`Search ${searchField === 'all' ? 'all lead fields' : leadSearchFields.find((field) => field.value === searchField)?.label.toLowerCase()}`}
              />
            </div>
          </label>

          <div className="lead-filter">
            <label>Source</label>
            <div className="select-wrap">
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                <option>All</option>
                {[...new Set(leads.map((lead) => lead.source).filter(Boolean))].map((source) => <option key={source}>{source}</option>)}
              </select>
            </div>
          </div>

          <div className="lead-filter">
            <label>From Date</label>
            <div className="date-field">
              <input type="date" aria-label="From date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
              <CalendarDays size={15} />
            </div>
          </div>

          <div className="lead-filter">
            <label>To Date</label>
            <div className="date-field">
              <input type="date" aria-label="To date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} />
              <CalendarDays size={15} />
            </div>
          </div>

          <div className="lead-filter status-filter">
            <label>Status</label>
            <div className="select-wrap">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All</option>
                {[...new Set(leads.map((lead) => lead.status).filter(Boolean))].map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>

          <button type="button" className="primary-button search-button" onClick={handleSearch}>
            <Search size={15} />
            Search
          </button>
          {(searchQuery || sourceFilter !== 'All' || statusFilter !== 'All' || fromDate || toDate) && (
            <button type="button" className="secondary-button lead-reset-button" onClick={clearFilters}>Reset</button>
          )}
        </div>

        <div className="lead-table-panel">
          <table className="lead-table">
            <thead>
              <tr>
                {leadTableColumns.map(([, label]) => <th key={label}>{label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => (
                <tr key={lead.id}>
                  {leadTableColumns.map(([field]) => (
                    <td key={field}>
                      {field === 'status'
                        ? <span className={`lead-status status-${lead.statusKey || statusKeys[lead.status] || 'new'}`}>{lead.status || 'New'}</span>
                        : maskSensitiveValue(field, leadFieldValue(lead, field)) || '—'}
                    </td>
                  ))}
                  <td className="actions-cell">
                    <button type="button" className="lead-row-action" onClick={() => setSelectedLead(lead)} aria-label={`View lead ${lead.id}`} title="View lead">
                      <Eye size={15} /> <span>View</span>
                    </button>
                    <button type="button" className="lead-row-action" onClick={() => openLeadEditor(lead)} aria-label={`Edit lead ${lead.id}`} title="Edit lead">
                      <Pencil size={15} /> <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && <p className="lead-empty-results">No leads match the selected search or filters.</p>}
        </div>

          <div className="lead-pagination">
            <span>Showing {filteredLeads.length ? pageStart + 1 : 0} to {pageEnd} of {filteredLeads.length} records</span>
            <div className="pagination-controls">
              <button className="pager-button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={visiblePage === 1}>
                <ChevronLeft size={16} />
              </button>
              <span className="page-number">{visiblePage} / {pageCount}</span>
              <button className="pager-button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={visiblePage === pageCount}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
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