'use client';
import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, FileSpreadsheet, Pencil, Plus, Search, Upload, UserRound, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import NewLead from '../../components/NewLead';
import LeadDetails from '../../components/LeadDetails';
import { saveLeads } from '../../services/leadService';
import { assignLead, exportAllLeads, getAllLeads, getLeadById, importLeadsCsv, updateLead } from '../../services/lead_management';
import { getUsers } from '../../services/user_management';

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

const getUserRows = (result) => [
  result?.data?.users,
  result?.data?.items,
  result?.data?.records,
  result?.data?.content,
  result?.data,
  result?.users,
  result?.items,
  result?.records,
  result?.content,
].find(Array.isArray) || [];

const getEmployeeId = (user) => user?.employeeId ?? user?.empNo ?? user?.employee?.employeeId ?? user?.employee?.empNo ?? '';
const getEmployeeName = (user) => user?.name || user?.fullName || [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' ') || user?.username || user?.userName || user?.email || '';
const isMaker = (user) => {
  const roles = [user?.userRole, user?.user_role, user?.role, user?.roleName, user?.roles, user?.designation]
    .flatMap((role) => Array.isArray(role) ? role : [role])
    .filter(Boolean)
    .map((role) => typeof role === 'string' ? role : role.name || role.roleName || '');
  return roles.some((role) => String(role).toLowerCase().includes('maker'));
};

const toIsoDate = (date) => {
  const value = String(date || '');
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const [day, month, year] = value.split('-');
  return year && month && day ? `${year}-${month}-${day}` : '';
};

const csvCell = (value) => {
  const text = value === null || value === undefined
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

const leadsToCsv = (records) => {
  const columns = [...new Set(records.flatMap((lead) => Object.keys(lead)))];
  return [
    columns.map(csvCell).join(','),
    ...records.map((lead) => columns.map((column) => csvCell(lead[column])).join(',')),
  ].join('\r\n');
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
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
    email: lead.email || lead.emailAddress || '',
    panCard: lead.panCard || lead.panNumber || '',
    aadhaarCard: lead.aadhaarCard || lead.aadhaarNumber || '',
    passportNo: lead.passportNo || lead.passportNumber || '',
    dependents: lead.dependents ?? lead.numberOfDependents ?? '',
    loanPurpose: lead.loanPurpose || lead.purposeOfLoan || '',
    instalments: lead.instalments ?? lead.numberOfInstalments ?? '',
    monthlyEmi: lead.monthlyEmi ?? lead.emi ?? '',
    collateral: lead.collateral ?? lead.downPaymentCollateral ?? '',
    deductions: lead.deductions ?? lead.deductionsOrEmisPayable ?? '',
    primaryBankAccount: lead.primaryBankAccount || lead.accountNumber || '',
    acquisitionChannel: lead.acquisitionChannel || lead.leadAcquisitionChannel || lead.source || '',
    referralDate: lead.referralDate || lead.date || '',
    partnerId: lead.partnerId || lead.sourcingAgentPartnerId || '',
    partnerName: lead.partnerName || lead.agentPartnerName || '',
    assignedBy: lead.assignedBy || lead.createdBy || '',
    assignedToName: lead.assignedToName || lead.assignedCheckerName || lead.assignedViewerName || '',
    date: dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : apiDate,
    name: lead.customerName || lead.name || nameParts.join(' '),
    status: lead.leadStatus || lead.status || 'New',
    statusKey: statusKeys[lead.leadStatus || lead.status] || 'new',
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
.lm-dialog-backdrop{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:18px;background:rgba(18,38,39,.48)}
.lm-assignment-dialog{width:min(100%,420px);padding:22px;border:1px solid #dfe8e6;border-radius:8px;background:#fff;box-shadow:0 18px 60px rgba(19,44,43,.24)}
.lm-assignment-dialog h2{margin:0 0 6px;color:#193f42;font-size:18px}
.lm-assignment-dialog p{margin:0 0 18px;color:#748587;font-size:12px}
.lm-assignment-dialog label{display:grid;gap:7px;color:#52696b;font-size:11px;font-weight:700}
.lm-assignment-dialog select{width:100%;height:40px;padding:0 10px;border:1px solid #cbd9d7;border-radius:5px;background:#fff;color:#30494b;font:inherit;font-size:12px}
.lm-assignment-error{margin:12px 0 0!important;color:#9d3030!important}
.lm-assignment-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.lm-assignment-actions button{min-height:36px;padding:0 12px;border:1px solid #d2dfdc;border-radius:5px;background:#fff;color:#52696b;font-size:11px;font-weight:700;cursor:pointer}
.lm-assignment-actions button[type=submit]{border-color:#177e7a;background:#177e7a;color:#fff}
.lm-assignment-actions button:disabled{cursor:not-allowed;opacity:.6}
.lm-heading-actions{display:flex;align-items:center;gap:9px}
.lm-export-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 15px;border:1px solid #cbd9d7;border-radius:5px;background:#fff;color:#315d5b;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer}
.lm-export-button:hover{border-color:#a9cbc3;background:#f1f8f5}
.lm-export-dialog{width:min(100%,440px);padding:22px;border:1px solid #dfe8e6;border-radius:8px;background:#fff;box-shadow:0 18px 60px rgba(19,44,43,.24)}
.lm-export-dialog h2{margin:0 0 6px;color:#193f42;font-size:18px}
.lm-export-dialog>p{margin:0 0 18px;color:#748587;font-size:12px}
.lm-export-options{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.lm-export-option{display:grid;justify-items:start;gap:9px;min-height:105px;padding:14px;border:1px solid #d8e3e1;border-radius:6px;background:#fff;color:#315d5b;text-align:left;font:inherit;cursor:pointer}
.lm-export-option:hover:not(:disabled),.lm-export-option.selected{border-color:#70aaa0;background:#f1f8f5}
.lm-export-option:disabled{cursor:wait;opacity:.7}
.lm-export-option strong{color:#315356;font-size:12px}
.lm-export-option span{color:#748587;font-size:10px;line-height:1.4}
.lm-export-dates{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.lm-export-dates label{display:grid;gap:6px;color:#52696b;font-size:10px;font-weight:700}
.lm-export-dates input{height:39px;padding:0 9px;border:1px solid #cbd9d7;border-radius:5px;background:#fff;color:#30494b;font:inherit;font-size:12px}
.lm-export-error{margin:12px 0 0!important;color:#9d3030!important}
.lm-export-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.lm-export-actions button{min-height:36px;padding:0 12px;border:1px solid #d2dfdc;border-radius:5px;background:#fff;color:#52696b;font-size:11px;font-weight:700;cursor:pointer}
.lm-export-actions button[type=submit]{border-color:#177e7a;background:#177e7a;color:#fff}
.lm-export-actions button:disabled{cursor:not-allowed;opacity:.6}
.lm-bulk-dialog{width:min(100%,460px);padding:22px;border:1px solid #dfe8e6;border-radius:8px;background:#fff;box-shadow:0 18px 60px rgba(19,44,43,.24)}
.lm-bulk-dialog h2{margin:0 0 6px;color:#193f42;font-size:18px}
.lm-bulk-dialog>p{margin:0 0 18px;color:#748587;font-size:12px}
.lm-bulk-file{display:grid;gap:8px;padding:18px;border:1px dashed #a9c3be;border-radius:6px;background:#f8fbfa;color:#52696b;font-size:11px;font-weight:700}
.lm-bulk-file input{width:100%;color:#52696b;font:inherit;font-weight:400}
.lm-bulk-selected{display:flex;align-items:center;gap:7px;overflow-wrap:anywhere;color:#315d5b;font-size:11px;font-weight:600}
.lm-bulk-progress{display:grid;gap:7px;margin-top:16px}
.lm-bulk-progress-meta{display:flex;justify-content:space-between;color:#52696b;font-size:10px;font-weight:700}
.lm-bulk-progress-track{height:9px;overflow:hidden;border-radius:99px;background:#e7efed}
.lm-bulk-progress-fill{height:100%;border-radius:inherit;background:#177e7a;transition:width .18s ease}
.lm-bulk-success{display:flex;align-items:flex-start;gap:8px;margin:14px 0 0!important;color:#267348!important;font-size:12px!important;font-weight:700}
.lm-bulk-error{margin:14px 0 0!important;color:#9d3030!important;font-size:11px!important;line-height:1.5}
.lm-bulk-row-errors{max-height:120px;overflow:auto;margin:8px 0 0;padding-left:24px;color:#8b5c20;font-size:10px;line-height:1.5}
.lm-bulk-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.lm-bulk-actions button{min-height:36px;padding:0 12px;border:1px solid #d2dfdc;border-radius:5px;background:#fff;color:#52696b;font-size:11px;font-weight:700;cursor:pointer}
.lm-bulk-actions button[type=submit]{border-color:#177e7a;background:#177e7a;color:#fff}
.lm-bulk-actions button:disabled{cursor:not-allowed;opacity:.6}
.lm-empty{padding:42px 18px!important;text-align:center!important;color:#718284!important}
.lm-load-error{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding:11px 13px;border:1px solid #efcaca;border-radius:5px;background:#fff5f5;color:#9d3030;font-size:12px}
.lm-load-error button{border:1px solid #d9aaaa;border-radius:4px;background:#fff;color:#8c3030;padding:6px 10px;font:inherit;font-weight:700;cursor:pointer}
.lm-pagination{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 14px;border-top:1px solid #e8eeec;color:#718284;font-size:10px}
.lm-pager{display:flex;align-items:center;gap:7px}
.lm-pager button{display:grid;place-items:center;width:30px;height:30px;border:1px solid #d8e3e1;border-radius:4px;background:#fff;color:#456567;cursor:pointer}
.lm-pager button:hover:not(:disabled){background:#f1f8f5}.lm-pager button:disabled{cursor:not-allowed;opacity:.45}
.lm-page-number{min-width:48px;text-align:center;color:#496163;font-weight:700}
@media(max-width:880px){.lm-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}.lm-filter-search{grid-column:1/-1}.lm-reset{justify-self:start}}
@media(max-width:540px){.lm-page{padding-top:0}.lm-heading{align-items:flex-start;flex-direction:column;gap:12px}.lm-heading-actions{width:100%}.lm-heading-actions button{flex:1}.lm-toolbar{grid-template-columns:1fr;padding:12px}.lm-filter-search{grid-column:auto}.lm-reset{width:100%}.lm-results-meta{align-items:flex-start;flex-direction:column}.lm-pagination{align-items:flex-start;flex-direction:column}}
`;

export default function LeadManagementPage() {
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importRowErrors, setImportRowErrors] = useState([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportMode, setExportMode] = useState('all');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportError, setExportError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLoadingLeadDetails, setIsLoadingLeadDetails] = useState(false);
  const [leadDetailsError, setLeadDetailsError] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [assignmentLead, setAssignmentLead] = useState(null);
  const [makerUsers, setMakerUsers] = useState([]);
  const [makerLoading, setMakerLoading] = useState(false);
  const [makerError, setMakerError] = useState('');
  const [selectedMakerId, setSelectedMakerId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
  }, [searchQuery, statusFilter, fromDate, toDate]);

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
        status: response?.leadStatus || response?.data?.leadStatus || 'NEW',
        statusKey: statusKeys[response?.leadStatus || response?.data?.leadStatus || 'NEW'],
        branch: '',
        product: form.loanProductType,
        amount: Number(form.loanAmount).toLocaleString('en-IN'),
        remarks: '',
      }, ...current];
    });
  };

  const handleUpdateLead = async (form, updates) => {
    if (!editingLead?.id) throw new Error('The lead ID is missing.');

    const response = await updateLead(editingLead.id, updates);
    const nextLeads = leads.map((lead) => {
      if (lead.id !== editingLead.id) return lead;

      return normalizeLeadRecord({
        ...lead,
        ...form,
        ...(response && typeof response === 'object' ? response : {}),
        id: lead.id,
        leadId: lead.id,
        name: form.customerName,
        customerName: form.customerName,
        mobile: form.mobileNumber,
        product: form.loanProductType,
        amount: Number(form.loanAmount).toLocaleString('en-IN'),
      });
    });
    setLeads(saveLeads(nextLeads));
    setEditingLead(null);
  };

  const openAssignmentDialog = async (lead) => {
    setAssignmentLead(lead);
    setMakerUsers([]);
    setSelectedMakerId('');
    setMakerError('');
    setMakerLoading(true);
    try {
      const users = getUserRows(await getUsers());
      const makers = users.filter((user) => getEmployeeId(user) && isMaker(user));
      setMakerUsers(makers);
      if (!makers.length) setMakerError('No maker employees are available to assign.');
    } catch (error) {
      setMakerError(error instanceof Error ? error.message : 'Unable to load maker employees.');
    } finally {
      setMakerLoading(false);
    }
  };

  const handleAssignLead = async (event) => {
    event.preventDefault();
    if (!assignmentLead || isAssigning) return;

    setMakerError('');
    setIsAssigning(true);
    try {
      let authData;
      try {
        authData = JSON.parse(window.localStorage.getItem('authData') || '{}');
      } catch {
        throw new Error('Your session is invalid. Please sign in again.');
      }
      const currentUser = authData.user || authData.profile || authData.employee || authData;
      const assignedBy = currentUser.employeeId || currentUser.empNo || currentUser.employee?.employeeId || currentUser.employee?.empNo;
      if (!assignedBy) throw new Error('Your employee ID is unavailable. Please sign in again.');

      const selectedMaker = makerUsers.find((user) => String(getEmployeeId(user)) === selectedMakerId);
      const response = await assignLead(assignmentLead.id, selectedMakerId, assignedBy);
      const assignedRecord = response?.data?.lead || response?.data || response?.lead || response;
      setLeads((current) => current.map((lead) => {
        if (lead.id !== assignmentLead.id) return lead;
        return normalizeLeadRecord({
          ...lead,
          ...(assignedRecord && typeof assignedRecord === 'object' ? assignedRecord : {}),
          leadId: lead.id,
          assignedBy,
          assignedToId: selectedMakerId,
          assignedToName: getEmployeeName(selectedMaker) || selectedMakerId,
          leadStatus: assignedRecord?.leadStatus || assignedRecord?.status || 'IN_PROGRESS',
        });
      }));
      setAssignmentLead(null);
    } catch (error) {
      setMakerError(error instanceof Error ? error.message : 'Unable to assign this lead.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleExport = async (event, mode = exportMode) => {
    event?.preventDefault();
    if (isExporting) return;

    setExportError('');
    if (mode === 'date') {
      if (!exportFromDate || !exportToDate) {
        setExportError('Select both a start date and an end date.');
        return;
      }
      if (exportFromDate > exportToDate) {
        setExportError('The start date must be on or before the end date.');
        return;
      }
    }

    setIsExporting(true);
    try {
      if (mode === 'all') {
        const csvBlob = await exportAllLeads();
        downloadBlob(csvBlob, 'leads.csv');
      } else {
        if (isLoadingLeads) throw new Error('Wait for the leads to finish loading, then try again.');
        if (loadError) throw new Error('Leads could not be loaded. Retry loading leads before exporting a date range.');
        const matchingLeads = leads.filter((lead) => {
          const leadDate = toIsoDate(lead.date || lead.leadDate || lead.createdAt);
          return leadDate && leadDate >= exportFromDate && leadDate <= exportToDate;
        });
        if (!matchingLeads.length) throw new Error('No leads were found in the selected date range.');
        const csv = `\uFEFF${leadsToCsv(matchingLeads)}`;
        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `leads-${exportFromDate}-to-${exportToDate}.csv`);
      }
      setShowExportDialog(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Unable to export leads.');
    } finally {
      setIsExporting(false);
    }
  };

  const openBulkImport = () => {
    setBulkFile(null);
    setImportProgress(0);
    setImportError('');
    setImportSuccess('');
    setImportRowErrors([]);
    setShowBulkImport(true);
  };

  const handleBulkFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImportError('');
    setImportSuccess('');
    setImportRowErrors([]);
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      setBulkFile(null);
      event.target.value = '';
      setImportError('Choose a CSV (.csv) file.');
      return;
    }
    setBulkFile(file);
  };

  const handleBulkImport = async (event) => {
    event.preventDefault();
    if (!bulkFile || isImporting) return;

    setImportError('');
    setImportSuccess('');
    setImportProgress(0);
    setIsImporting(true);
    try {
      const result = await importLeadsCsv(bulkFile, setImportProgress);
      const resultData = result?.data && typeof result.data === 'object' ? result.data : result;
      const importedCount = resultData.importedCount ?? resultData.successCount ?? resultData.totalImported;
      const rejectedCount = resultData.failedCount ?? resultData.errorCount;
      const rowErrors = resultData.errors || resultData.rowErrors || resultData.failedRows || [];
      const rowErrorList = Array.isArray(rowErrors) ? rowErrors : [];
      const countText = importedCount !== undefined ? ` ${importedCount} lead${Number(importedCount) === 1 ? '' : 's'}` : '';
      const hasRowErrors = Number(rejectedCount) > 0 || rowErrorList.length > 0;
      setImportRowErrors(rowErrorList.slice(0, 10).map((error) => {
        if (typeof error === 'string') return error;
        const row = error.rowNumber ?? error.row ?? error.lineNumber;
        const message = error.message ?? error.error ?? 'Row could not be imported.';
        return row ? `Row ${row}: ${message}` : String(message);
      }));
      setImportSuccess(`${resultData.message || (hasRowErrors ? 'Import completed with row errors.' : `Leads imported successfully.${countText ? ` Imported${countText}.` : ''}`)}${rejectedCount ? ` ${rejectedCount} row${Number(rejectedCount) === 1 ? '' : 's'} could not be imported.` : ''}`);
      setReloadKey((key) => key + 1);
      window.setTimeout(() => {
        setShowBulkImport(false);
        setBulkFile(null);
      }, 1800);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to import leads.');
    } finally {
      setIsImporting(false);
    }
  };

  const loadLeadDetails = async (lead) => {
    setSelectedLead(lead);
    setIsLoadingLeadDetails(true);
    setLeadDetailsError('');

    try {
      const details = normalizeLeadRecord(await getLeadById(lead.id));
      setSelectedLead(details);
      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load lead details.';
      setLeadDetailsError(message);
      throw error;
    } finally {
      setIsLoadingLeadDetails(false);
    }
  };

  const openLeadEditor = async (lead, detailsAlreadyLoaded = false) => {
    setLeadDetailsError('');
    try {
      const details = detailsAlreadyLoaded ? lead : await loadLeadDetails(lead);
      setSelectedLead(null);
      setEditingLead(details);
    } catch {
      setSelectedLead(lead);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchQuery(searchInput.trim().toLowerCase());
  };
  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('All');
    setFromDate('');
    setToDate('');
  };

  const filteredLeads = leads.filter((lead) => {
    const leadStatus = lead.status === 'Pending' ? 'New' : lead.status || 'New';
    const statusMatches = statusFilter === 'All' || leadStatus === statusFilter;
    const leadDate = toIsoDate(leadFieldValue(lead, 'date'));
    const fromMatches = !fromDate || Boolean(leadDate && leadDate >= fromDate);
    const toMatches = !toDate || Boolean(leadDate && leadDate <= toDate);
    const fieldValues = ['id', 'firstName', 'lastName', 'mobileNumber', 'assignedBy', 'assignedToName'].map((field) => leadFieldValue(lead, field));
    const searchMatches = !searchQuery || fieldValues.some((value) => String(value ?? '').toLowerCase().includes(searchQuery));
    return statusMatches && fromMatches && toMatches && searchMatches;
  });
  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE));
  const visiblePage = Math.min(currentPage, pageCount);
  const pageStart = filteredLeads.length ? (visiblePage - 1) * LEADS_PER_PAGE : 0;
  const paginatedLeads = filteredLeads.slice(pageStart, pageStart + LEADS_PER_PAGE);
  const pageEnd = Math.min(pageStart + LEADS_PER_PAGE, filteredLeads.length);
  return (
    <>
      <AppShell title="Lead Management">
        <style>{leadManagementStyles}</style>
        <main className="lm-page">
          <header className="lm-heading">
            <div className="lm-heading-copy"><span>SALES OPERATIONS</span><h1>Lead Management</h1><p>Track applicants, ownership and lead progress.</p></div>
            <div className="lm-heading-actions">
              <button type="button" className="lm-export-button" onClick={() => {
                setExportMode('all');
                setExportError('');
                setShowExportDialog(true);
              }}><Download size={16} /> Export Lead</button>
              <button type="button" className="lm-add-button" onClick={() => setShowNewLead(true)}><Plus size={16} /> Add New Lead</button>
              <button type="button" className="lm-export-button" onClick={openBulkImport}><Upload size={16} /> Upload Bulk Lead</button>
            </div>
          </header>

          <section className="lm-toolbar" aria-label="Lead filters">
            <label className="lm-filter lm-filter-search" htmlFor="lead-search-text">Search leads
              <span className="lm-search-box"><Search size={15} aria-hidden="true" /><input id="lead-search-text" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }} onBlur={handleSearch} placeholder="Lead ID, name, mobile or assignee" /></span>
            </label>
            <label className="lm-filter" htmlFor="lead-status-filter">Status
              <select id="lead-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option>
                {['New', 'In Progress', 'Contacted', 'Qualified', 'On Hold', 'Rejected', 'Converted'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="lm-filter" htmlFor="lead-from-date">Lead date from<input id="lead-from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
            <label className="lm-filter" htmlFor="lead-to-date">Lead date to<input id="lead-to-date" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
            {(searchInput || statusFilter !== 'All' || fromDate || toDate) && <button type="button" className="lm-reset" onClick={clearFilters}><X size={14} /> Clear filters</button>}
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
                            ? <span className={`lm-status status-${lead.statusKey || statusKeys[lead.status] || 'new'}`}>{lead.status === 'Pending' ? 'New' : lead.status || 'New'}</span>
                            : String(leadFieldValue(lead, field) ?? '—')}
                        </td>
                      ))}
                      <td><div className="lm-actions">
                        <button type="button" className="lm-action" onClick={() => loadLeadDetails(lead).catch(() => {})} aria-label={`View lead ${lead.id}`} title="View lead"><Eye size={14} /></button>
                        <button type="button" className="lm-action" onClick={() => openLeadEditor(lead)} aria-label={`Edit lead ${lead.id}`} title="Edit lead"><Pencil size={14} /></button>
                        <button type="button" className="lm-action" onClick={() => openAssignmentDialog(lead)} aria-label={`Assign lead ${lead.id}`} title="Assign lead"><UserRound size={14} /> Assigned To</button>
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
        loading={isLoadingLeadDetails}
        error={leadDetailsError}
        onRetry={() => selectedLead && loadLeadDetails(selectedLead).catch(() => {})}
        onClose={() => setSelectedLead(null)}
        onEdit={(lead) => openLeadEditor(lead, !isLoadingLeadDetails && !leadDetailsError)}
      />
      {showExportDialog ? (
        <div className="lm-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isExporting) setShowExportDialog(false);
        }}>
          <form className="lm-export-dialog" onSubmit={handleExport} role="dialog" aria-modal="true" aria-labelledby="lm-export-title">
            <h2 id="lm-export-title">Export Leads</h2>
            <p>Download lead data as a CSV file that opens in Excel.</p>
            <div className="lm-export-options">
              <button type="button" className={`lm-export-option${exportMode === 'all' ? ' selected' : ''}`} disabled={isExporting} onClick={() => {
                setExportMode('all');
                setExportError('');
                handleExport(null, 'all');
              }}>
                <FileSpreadsheet size={18} />
                <strong>Export All</strong>
                <span>Download all leads from the leads export API.</span>
              </button>
              <button type="button" className={`lm-export-option${exportMode === 'date' ? ' selected' : ''}`} disabled={isExporting} onClick={() => {
                setExportMode('date');
                setExportError('');
              }}>
                <CalendarDays size={18} />
                <strong>Export by Date</strong>
                <span>Choose a date range to export matching leads.</span>
              </button>
            </div>
            {exportMode === 'date' ? (
              <div className="lm-export-dates">
                <label htmlFor="lead-export-from">From
                  <input id="lead-export-from" type="date" value={exportFromDate} max={exportToDate || undefined} onChange={(event) => setExportFromDate(event.target.value)} required />
                </label>
                <label htmlFor="lead-export-to">To
                  <input id="lead-export-to" type="date" value={exportToDate} min={exportFromDate || undefined} onChange={(event) => setExportToDate(event.target.value)} required />
                </label>
              </div>
            ) : null}
            {exportError ? <p className="lm-export-error" role="alert">{exportError}</p> : null}
            <div className="lm-export-actions">
              <button type="button" onClick={() => setShowExportDialog(false)} disabled={isExporting}>Cancel</button>
              {exportMode === 'date' ? <button type="submit" disabled={isExporting}>{isExporting ? 'Exporting...' : 'Export Now'}</button> : null}
            </div>
          </form>
        </div>
      ) : null}
      {showBulkImport ? (
        <div className="lm-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isImporting) setShowBulkImport(false);
        }}>
          <form className="lm-bulk-dialog" onSubmit={handleBulkImport} role="dialog" aria-modal="true" aria-labelledby="lm-bulk-title">
            <h2 id="lm-bulk-title">Upload Bulk Leads</h2>
            <p>Select a CSV file using the lead import template.</p>
            {!importSuccess ? (
              <label className="lm-bulk-file" htmlFor="bulk-leads-file">
                CSV file
                <input id="bulk-leads-file" type="file" accept=".csv,text/csv" onChange={handleBulkFileChange} disabled={isImporting} />
                {bulkFile ? <span className="lm-bulk-selected"><FileSpreadsheet size={15} /> {bulkFile.name} ({(bulkFile.size / 1024).toFixed(1)} KB)</span> : null}
              </label>
            ) : null}
            {isImporting || importSuccess ? (
              <div className="lm-bulk-progress" role="status" aria-live="polite">
                <div className="lm-bulk-progress-meta"><span>{importSuccess ? 'Import complete' : 'Importing leads...'}</span><span>{importProgress}%</span></div>
                <div className="lm-bulk-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={importProgress} aria-label="Lead import progress">
                  <div className="lm-bulk-progress-fill" style={{ width: `${importProgress}%` }} />
                </div>
              </div>
            ) : null}
            {importSuccess ? <p className="lm-bulk-success"><CheckCircle2 size={17} />{importSuccess}</p> : null}
            {importRowErrors.length ? <ul className="lm-bulk-row-errors">{importRowErrors.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}</ul> : null}
            {importError ? <p className="lm-bulk-error" role="alert">{importError}</p> : null}
            <div className="lm-bulk-actions">
              {!importSuccess ? <button type="button" onClick={() => setShowBulkImport(false)} disabled={isImporting}>Cancel</button> : null}
              {!importSuccess ? <button type="submit" disabled={!bulkFile || isImporting}>{isImporting ? `Importing ${importProgress}%` : 'Import Now'}</button> : null}
            </div>
          </form>
        </div>
      ) : null}
      {assignmentLead ? (
        <div className="lm-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isAssigning) setAssignmentLead(null);
        }}>
          <form className="lm-assignment-dialog" onSubmit={handleAssignLead} role="dialog" aria-modal="true" aria-labelledby="lm-assignment-title">
            <h2 id="lm-assignment-title">Assign Lead</h2>
            <p>Choose a maker employee for lead {assignmentLead.id}.</p>
            <label htmlFor="lead-maker-select">Assign To
              <select id="lead-maker-select" value={selectedMakerId} onChange={(event) => setSelectedMakerId(event.target.value)} required disabled={makerLoading || isAssigning || !makerUsers.length}>
                <option value="">{makerLoading ? 'Loading makers...' : 'Select maker'}</option>
                {makerUsers.map((user) => {
                  const employeeId = String(getEmployeeId(user));
                  return <option key={employeeId} value={employeeId}>{getEmployeeName(user) || employeeId} ({employeeId})</option>;
                })}
              </select>
            </label>
            {makerError ? <p className="lm-assignment-error" role="alert">{makerError}</p> : null}
            <div className="lm-assignment-actions">
              <button type="button" onClick={() => setAssignmentLead(null)} disabled={isAssigning}>Cancel</button>
              <button type="submit" disabled={makerLoading || isAssigning || !makerUsers.length || !selectedMakerId}>{isAssigning ? 'Assigning...' : 'Assign'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}