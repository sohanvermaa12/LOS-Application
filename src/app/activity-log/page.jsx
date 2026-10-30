"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FileText,
  Filter,
  Hash,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import AppShell from "../../components/AppShell";

const activitySeeds = [
  [
    "Lead Management",
    "LEAD-1024",
    "Status",
    "New",
    "Contacted",
    "Updated",
    "Rahul Sharma",
    "Amit Kumar",
    "Pending",
    "Lead status was updated after the first customer interaction.",
  ],
  [
    "Lead Generation",
    "LEAD-1031",
    "Lead Source",
    "-",
    "Branch Referral",
    "Created",
    "Neha Singh",
    "-",
    "Active",
    "New lead created from a branch referral.",
  ],
  [
    "Customer Management",
    "CUS-2088",
    "Mobile Number",
    "+91 98765 11223",
    "+91 98765 11332",
    "Updated",
    "Neha Singh",
    "Neha Singh",
    "Verified",
    "Customer contact information updated after verification.",
  ],
  [
    "Customer Onboarding",
    "CUS-2094",
    "KYC Status",
    "Pending",
    "Verified",
    "Verified",
    "Priya Patel",
    "Priya Patel",
    "Verified",
    "Customer onboarding documents were verified.",
  ],
  [
    "Product Management",
    "PRD-0042",
    "Interest Rate",
    "10.50%",
    "10.25%",
    "Updated",
    "Amit Kumar",
    "Amit Kumar",
    "Pending",
    "Product interest rate changed for the upcoming effective date.",
  ],
  [
    "Loan Application",
    "APP-7814",
    "Application Status",
    "Draft",
    "Submitted",
    "Updated",
    "Rahul Sharma",
    "Amit Kumar",
    "Active",
    "Loan application submitted for eligibility review.",
  ],
  [
    "Loan Eligibility",
    "APP-7814",
    "Eligibility Result",
    "-",
    "Eligible",
    "Verified",
    "Priya Patel",
    "Priya Patel",
    "Verified",
    "Eligibility rules completed successfully.",
  ],
  [
    "Interest Rate Master",
    "IRM-0068",
    "Effective Date",
    "01 Oct 2026",
    "01 Nov 2026",
    "Updated",
    "Amit Kumar",
    "Amit Kumar",
    "Pending",
    "New interest rate tiers were configured.",
  ],
  [
    "Lookup Management",
    "LOOK-0019",
    "Option Status",
    "Inactive",
    "Active",
    "Updated",
    "Neha Singh",
    "Neha Singh",
    "Verified",
    "Lookup option activated for branch selection.",
  ],
  [
    "User Management",
    "USR-112",
    "Role",
    "-",
    "Credit Officer",
    "Created",
    "Rahul Sharma",
    "-",
    "Active",
    "New operations user created with branch-level access.",
  ],
  [
    "Bank Profile",
    "BANK-0001",
    "Branch Count",
    "42",
    "45",
    "Updated",
    "Amit Kumar",
    "Amit Kumar",
    "Verified",
    "Bank profile branch information was updated.",
  ],
  [
    "Gold Rate Master",
    "GOLD-1029",
    "22K Rate",
    "₹6,420",
    "₹6,455",
    "Updated",
    "Neha Singh",
    "Neha Singh",
    "Pending",
    "Daily gold rate was updated for loan valuation.",
  ],
  [
    "Role Access",
    "ROLE-0007",
    "Permission",
    "View",
    "View, Edit",
    "Updated",
    "Priya Patel",
    "Priya Patel",
    "Verified",
    "Product manager permissions were revised.",
  ],
  [
    "Reports",
    "RPT-4412",
    "Export Status",
    "-",
    "Generated",
    "Created",
    "Rahul Sharma",
    "-",
    "Active",
    "Monthly disbursement report was generated.",
  ],
  [
    "Audit Logs",
    "AUD-8921",
    "Verification",
    "Pending",
    "Verified",
    "Verified",
    "Priya Patel",
    "Priya Patel",
    "Verified",
    "Audit entry was reviewed and verified.",
  ],
];

const mockLogs = Array.from({ length: 50 }, (_, index) => {
  const [
    module,
    recordId,
    field,
    oldValue,
    newValue,
    action,
    createdBy,
    modifiedBy,
    status,
    description,
  ] = activitySeeds[index % activitySeeds.length];
  const day = String(29 - Math.floor(index / 3)).padStart(2, "0");
  const hour = String(9 + (index % 9)).padStart(2, "0");
  const minute = String((index * 15) % 60).padStart(2, "0");
  const createdById =
    createdBy === "Rahul Sharma"
      ? "USR-101"
      : createdBy === "Neha Singh"
        ? "USR-108"
        : createdBy === "Amit Kumar"
          ? "USR-104"
          : "USR-103";
  const modifiedById =
    modifiedBy === "-"
      ? "-"
      : modifiedBy === "Neha Singh"
        ? "USR-108"
        : modifiedBy === "Amit Kumar"
          ? "USR-104"
          : "USR-103";
  const verified = status === "Verified" ? "Priya Patel" : "-";
  return {
    id: String(index + 1),
    date: `${day} Oct 2026`,
    time: `${hour}:${minute} ${index % 2 ? "AM" : "PM"}`,
    module,
    recordId: `${recordId}-${String(index + 1).padStart(2, "0")}`,
    action,
    field,
    oldValue,
    newValue,
    createdBy,
    createdById,
    modifiedBy,
    modifiedById,
    verifiedBy: verified,
    verifiedById: verified === "-" ? "-" : "USR-103",
    status,
    description,
    ip: `192.168.1.${10 + (index % 18)}`,
  };
});

const initialFilters = {
  date: "01 Oct 2026 - 31 Oct 2026",
  module: "All Modules",
  action: "All Actions",
  verification: "All Status",
  createdBy: "",
  modifiedBy: "",
  verifiedBy: "",
  recordId: "",
  field: "",
  oldValue: "",
  newValue: "",
};

function SelectField({ icon: Icon, label, value, onChange, children }) {
  return (
    <label className="activity-filter-field">
      <span>{label}</span>
      <div className="activity-input activity-select">
        <Icon size={15} />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <ChevronDown size={14} />
      </div>
    </label>
  );
}

function SearchField({ icon: Icon, label, placeholder, value, onChange }) {
  return (
    <label className="activity-filter-field">
      <span>{label}</span>
      <div className="activity-input">
        <Icon size={15} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

export default function ActivityLogPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [expanded, setExpanded] = useState("3");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const setFilter = (field, value) =>
    setFilters((current) => ({ ...current, [field]: value }));
  const filteredLogs = useMemo(
    () =>
      mockLogs.filter((log) => {
        const matches = (value, filter) =>
          !filter || value.toLowerCase().includes(filter.toLowerCase());
        return (
          (applied.module === "All Modules" || log.module === applied.module) &&
          (applied.action === "All Actions" || log.action === applied.action) &&
          (applied.verification === "All Status" ||
            log.status === applied.verification) &&
          matches(log.createdBy, applied.createdBy) &&
          matches(log.modifiedBy, applied.modifiedBy) &&
          matches(log.verifiedBy, applied.verifiedBy) &&
          matches(log.recordId, applied.recordId) &&
          matches(log.field, applied.field) &&
          matches(log.oldValue, applied.oldValue) &&
          matches(log.newValue, applied.newValue)
        );
      }),
    [applied],
  );
  const pageSize = Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const visibleLogs = filteredLogs.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const activeFilters = Object.entries(applied).filter(
    ([key, value]) =>
      (value && !["date", "module", "action", "verification"].includes(key)) ||
      (["module", "action", "verification"].includes(key) &&
        value !== initialFilters[key]),
  );
  function resetFilters() {
    setFilters(initialFilters);
    setApplied(initialFilters);
    setPage(1);
  }
  function changeRowsPerPage(value) {
    setRowsPerPage(value);
    setPage(1);
  }

  return (
    <AppShell title="Activity Logs">
      <style>{`
      .activity-page{max-width:1450px;margin:0 auto;color:var(--ink)}.activity-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:0 0 17px}.activity-heading-main{display:flex;align-items:flex-start;gap:12px}.activity-heading-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:8px;background:#eaf3ff;color:#2969df}.activity-heading h1{margin:0;color:#1b3650;font:800 21px Manrope,sans-serif}.activity-heading p{margin:3px 0 0;color:#79909d;font-size:11px}.activity-notification{display:grid;place-items:center;position:relative;width:34px;height:34px;color:#527084}.activity-notification b{position:absolute;top:0;right:0;display:grid;place-items:center;width:15px;height:15px;border-radius:50%;background:#df3861;color:#fff;font-size:9px}.activity-panel{border:1px solid #dfe8f0;border-radius:7px;background:#fff;box-shadow:0 4px 18px rgba(34,75,111,.05)}.activity-filter-head{display:flex;align-items:center;gap:9px;padding:13px 15px;border-bottom:1px solid #e8eef3;color:#19395c;font-size:12px;font-weight:800}.activity-filter-head svg{color:#315d9e}.activity-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px 18px;padding:14px 15px 13px}.activity-filter-field{display:grid;gap:7px;min-width:0}.activity-filter-field>span{color:#264261;font-size:10px;font-weight:800}.activity-input{display:flex;align-items:center;gap:8px;height:29px;min-width:0;padding:0 9px;border:1px solid #d8e3ed;border-radius:5px;background:#fff;color:#6b8495}.activity-input:focus-within{border-color:#5d8ddd;box-shadow:0 0 0 3px #4f83db12}.activity-input input,.activity-input select{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#36536e;font-size:10px}.activity-input input::placeholder{color:#91a5b1}.activity-input select{appearance:none;cursor:pointer}.activity-select>svg:last-child{flex:none;color:#71889b}.activity-filter-actions{display:flex;justify-content:flex-end;gap:9px;padding:0 15px 14px}.activity-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:30px;padding:0 14px;border:1px solid #d7e2ec;border-radius:5px;background:#fff;color:#42617d;font-size:10px;font-weight:800}.activity-button:hover{background:#f5f8fb}.activity-button.primary{border-color:#286cf2;background:#286cf2;color:#fff;box-shadow:0 4px 10px #286cf226}.activity-button.primary:hover{background:#1c5bd6}.activity-active{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:13px 0 12px;color:#5d7790;font-size:10px}.activity-active strong{color:#375673}.activity-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid #d6e5fa;border-radius:13px;background:#f4f8ff;color:#4173bf;font-size:10px}.activity-chip button{display:grid;place-items:center;color:#7090bd}.activity-clear{color:#286cf2;font-weight:800;cursor:pointer}.activity-table-panel{overflow:hidden}.activity-table-wrap{overflow:auto}.activity-table{width:100%;min-width:1050px;border-collapse:collapse}.activity-table th,.activity-table td{padding:10px 12px;border-bottom:1px solid #e9eff4;text-align:left;vertical-align:middle;color:#38536c;font-size:10px}.activity-table th{height:39px;background:#f8fafc;color:#48647d;font-size:9px;font-weight:800;white-space:nowrap}.activity-table tbody tr:not(.activity-detail):hover{background:#fbfdff}.activity-table tbody tr:last-child td{border-bottom:0}.activity-check{width:34px;text-align:center!important}.activity-check input{width:12px;height:12px;accent-color:#286cf2}.activity-date{color:#264968!important;font-weight:700;line-height:1.35}.activity-date small{display:block;color:#71889b;font-size:9px;font-weight:500}.activity-module{display:flex;align-items:center;gap:6px;color:#365771;font-weight:700}.activity-module i{display:grid;place-items:center;width:16px;height:16px;border-radius:5px;background:#eeeaff;color:#7966ec;font-style:normal}.activity-record{color:#3f6da9!important;font-weight:700}.activity-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:12px;font-size:9px;font-weight:800}.activity-badge.verified{background:#dff7e9;color:#278b5a}.activity-badge.updated{background:#e2eeff;color:#2d6cdb}.activity-badge.created{background:#eee8ff;color:#7862df}.activity-status{display:inline-flex;padding:4px 9px;border-radius:12px;font-size:9px;font-weight:800}.activity-status.verified{background:#dff7e9;color:#278b5a}.activity-status.pending{background:#fff0d9;color:#d7861b}.activity-status.active{background:#e1efff;color:#3679df}.activity-user{line-height:1.3;color:#39536d}.activity-user strong{display:block;font-size:9px}.activity-user small{display:block;color:#8499aa;font-size:8px}.activity-expand{display:grid;place-items:center;width:25px;height:25px;color:#52738c}.activity-detail td{padding:0 10px 10px;background:#fbfdff}.activity-detail-card{display:grid;grid-template-columns:1fr 1.05fr 1.15fr;border:1px solid #e5edf5;border-radius:5px;background:linear-gradient(100deg,#f8fbff,#f4f8fd)}.activity-detail-section{min-height:120px;padding:13px 16px;border-right:1px solid #dce8f2}.activity-detail-section:last-child{border-right:0}.activity-detail-section h4{display:flex;align-items:center;gap:6px;margin:0 0 10px;color:#26476a;font-size:10px}.activity-detail-section h4 svg{color:#547ea5}.activity-detail-grid{display:grid;grid-template-columns:105px 1fr;gap:7px;color:#7890a3;font-size:9px}.activity-detail-grid strong{color:#48647e;font-weight:700}.activity-change-box{padding:11px;border:1px solid #deebf5;border-radius:5px;background:#f9fbfe}.activity-change-box div{display:grid;grid-template-columns:72px 1fr;gap:8px;margin:0 0 8px;color:#7a92a5;font-size:9px}.activity-change-box div:last-child{margin:0}.activity-change-box strong{color:#52708b;font-weight:700}.activity-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:13px 14px;color:#71889b;font-size:9px}.activity-pagination{display:flex;align-items:center;gap:13px}.activity-page-button{display:grid;place-items:center;width:23px;height:23px;border:1px solid #dce6ef;border-radius:5px;color:#58738a}.activity-page-button:disabled{opacity:.35}.activity-page-number{display:grid;place-items:center;width:22px;height:22px;border-radius:5px;color:#53708b;font-weight:700}.activity-page-number.active{background:#286cf2;color:#fff}.activity-rows{height:26px;padding:0 7px;border:1px solid #d8e3ed;border-radius:4px;background:#fff;color:#547189;font-size:9px}@media(max-width:900px){.activity-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.activity-detail-card{grid-template-columns:1fr}.activity-detail-section{border-right:0;border-bottom:1px solid #dce8f2}.activity-detail-section:last-child{border-bottom:0}}@media(max-width:560px){.activity-heading{align-items:flex-start}.activity-heading p{max-width:250px}.activity-filters{grid-template-columns:1fr}.activity-filter-actions{justify-content:stretch}.activity-button{flex:1}.activity-footer{align-items:flex-start;flex-direction:column}.activity-pagination{width:100%;justify-content:space-between}}
    `}</style>
      <main className="activity-page">
        <header className="activity-heading">
          <div className="activity-heading-main">
            <span className="activity-heading-icon">
              <FileText size={20} />
            </span>
            <div>
              <h1>Activity Logs</h1>
              <p>
                Track and monitor user activities and changes across your
                application.
              </p>
            </div>
          </div>
          <button className="activity-notification" aria-label="Notifications">
            {/* <Bell size={17} /> */}
            {/* <b>3</b> */}
          </button>
        </header>
        <section className="activity-panel">
          <div className="activity-filter-head">
            <Filter size={15} /> Filters{" "}
            <span style={{ marginLeft: "auto", color: "#4d79b5", fontSize: 9 }}>
              Saved Filters{" "}
              <ChevronDown size={12} style={{ verticalAlign: "middle" }} />
            </span>
          </div>
          <div className="activity-filters">
            <SearchField
              icon={CalendarDays}
              label="Date Range"
              placeholder="01 Oct 2026 - 31 Oct 2026"
              value={filters.date}
              onChange={(value) => setFilter("date", value)}
            />
            <SelectField
              icon={ShieldCheck}
              label="Module"
              value={filters.module}
              onChange={(value) => setFilter("module", value)}
            >
              <option>All Modules</option>
              <option>Lead Management</option>
              <option>Lead Generation</option>
              <option>Customer Management</option>
              <option>Customer Onboarding</option>
              <option>Product Management</option>
              <option>Loan Application</option>
              <option>Loan Eligibility</option>
              <option>Interest Rate Master</option>
              <option>Lookup Management</option>
              <option>User Management</option>
              <option>Bank Profile</option>
              <option>Gold Rate Master</option>
              <option>Role Access</option>
              <option>Reports</option>
              <option>Audit Logs</option>
            </SelectField>
            <SelectField
              icon={Zap}
              label="Action Type"
              value={filters.action}
              onChange={(value) => setFilter("action", value)}
            >
              <option>All Actions</option>
              <option>Created</option>
              <option>Updated</option>
              <option>Verified</option>
            </SelectField>
            <SelectField
              icon={ShieldCheck}
              label="Verification Status"
              value={filters.verification}
              onChange={(value) => setFilter("verification", value)}
            >
              <option>All Status</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Active</option>
            </SelectField>
            <SearchField
              icon={UserRound}
              label="Created By"
              placeholder="Search user..."
              value={filters.createdBy}
              onChange={(value) => setFilter("createdBy", value)}
            />
            <SearchField
              icon={UserRound}
              label="Modified By"
              placeholder="Search user..."
              value={filters.modifiedBy}
              onChange={(value) => setFilter("modifiedBy", value)}
            />
            <SearchField
              icon={UserRound}
              label="Verified By"
              placeholder="Search user..."
              value={filters.verifiedBy}
              onChange={(value) => setFilter("verifiedBy", value)}
            />
            <SearchField
              icon={Hash}
              label="Record ID"
              placeholder="Enter record ID..."
              value={filters.recordId}
              onChange={(value) => setFilter("recordId", value)}
            />
            <SearchField
              icon={SlidersHorizontal}
              label="Field Name"
              placeholder="Select field..."
              value={filters.field}
              onChange={(value) => setFilter("field", value)}
            />
            <SearchField
              icon={Search}
              label="Old Value"
              placeholder="Enter old value..."
              value={filters.oldValue}
              onChange={(value) => setFilter("oldValue", value)}
            />
            <SearchField
              icon={Search}
              label="New Value"
              placeholder="Enter new value..."
              value={filters.newValue}
              onChange={(value) => setFilter("newValue", value)}
            />
          </div>
          <div className="activity-filter-actions">
            <button
              className="activity-button"
              type="button"
              onClick={resetFilters}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
            <button
              className="activity-button"
              type="button"
              onClick={() => setFilters(applied)}
              style={{ marginLeft: "auto" }}
            >
              Cancel
            </button>
            <button
              className="activity-button primary"
              type="button"
              onClick={() => {
                setApplied(filters);
                setPage(1);
              }}
            >
              <Filter size={13} /> Apply Filters
            </button>
          </div>
        </section>
        <div className="activity-active">
          <strong>Active Filters:</strong>
          {activeFilters.length === 0 ? (
            <span>None</span>
          ) : (
            activeFilters.map(([key, value]) => (
              <span className="activity-chip" key={key}>
                {key === "date" ? "Date" : key}: {value}
                <button
                  type="button"
                  aria-label={`Remove ${key} filter`}
                  onClick={() => {
                    const next = {
                      ...applied,
                      [key]: initialFilters[key] || "",
                    };
                    setApplied(next);
                    setFilters(next);
                  }}
                >
                  <X size={11} />
                </button>
              </span>
            ))
          )}
          {activeFilters.length > 0 && (
            <button
              className="activity-clear"
              type="button"
              onClick={resetFilters}
            >
              Clear All
            </button>
          )}
        </div>
        <section className="activity-panel activity-table-panel">
          <div className="activity-table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th className="activity-check">
                    <input type="checkbox" aria-label="Select all logs" />
                  </th>
                  <th>Date & Time</th>
                  <th>Module</th>
                  <th>Record ID</th>
                  <th>Action</th>
                  <th>Field Changed</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Created By</th>
                  <th>Modified By</th>
                  <th>Verified By</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <Fragment key={log.id}>
                    <tr>
                      <td className="activity-check">
                        <input
                          type="checkbox"
                          aria-label={`Select ${log.recordId}`}
                        />
                      </td>
                      <td className="activity-date">
                        {log.date}
                        <small>{log.time}</small>
                      </td>
                      <td>
                        <span className="activity-module">
                          <i>
                            <CircleCheck size={10} />
                          </i>
                          {log.module}
                        </span>
                      </td>
                      <td className="activity-record">{log.recordId}</td>
                      <td>
                        <span
                          className={`activity-badge ${log.action.toLowerCase()}`}
                        >
                          {log.action === "Verified" && (
                            <CircleCheck size={10} />
                          )}
                          {log.action}
                        </span>
                      </td>
                      <td>{log.field}</td>
                      <td>{log.oldValue}</td>
                      <td>{log.newValue}</td>
                      <td>
                        <span className="activity-user">
                          <strong>{log.createdBy}</strong>
                          <small>({log.createdById})</small>
                        </span>
                      </td>
                      <td>
                        <span className="activity-user">
                          <strong>{log.modifiedBy}</strong>
                          <small>
                            {log.modifiedById === "-"
                              ? "-"
                              : `(${log.modifiedById})`}
                          </small>
                        </span>
                      </td>
                      <td>
                        <span className="activity-user">
                          <strong>{log.verifiedBy}</strong>
                          <small>
                            {log.verifiedById === "-"
                              ? "-"
                              : `(${log.verifiedById})`}
                          </small>
                        </span>
                      </td>
                      <td>
                        <span
                          className={`activity-status ${log.status.toLowerCase()}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="activity-expand"
                          type="button"
                          aria-label={`Toggle details for ${log.recordId}`}
                          onClick={() =>
                            setExpanded((current) =>
                              current === log.id ? "" : log.id,
                            )
                          }
                        >
                          <ChevronDown
                            size={14}
                            style={{
                              transform:
                                expanded === log.id ? "rotate(180deg)" : "none",
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                    {expanded === log.id && (
                      <tr className="activity-detail">
                        <td colSpan="13">
                          <div className="activity-detail-card">
                            <div className="activity-detail-section">
                              <h4>
                                <FileText size={12} /> Record Details
                              </h4>
                              <div className="activity-detail-grid">
                                <span>Module</span>
                                <strong>{log.module}</strong>
                                <span>Record ID</span>
                                <strong>{log.recordId}</strong>
                                <span>Description</span>
                                <strong>{log.description}</strong>
                                <span>IP Address</span>
                                <strong>{log.ip}</strong>
                              </div>
                            </div>
                            <div className="activity-detail-section">
                              <h4>
                                <UserRound size={12} /> Audit Information
                              </h4>
                              <div className="activity-detail-grid">
                                <span>Created On</span>
                                <strong>
                                  {log.date}, {log.time}
                                </strong>
                                <span>Created By</span>
                                <strong>
                                  {log.createdBy} ({log.createdById})
                                </strong>
                                <span>Modified On</span>
                                <strong>
                                  {log.modifiedBy === "-"
                                    ? "-"
                                    : `${log.date}, ${log.time}`}
                                </strong>
                                <span>Modified By</span>
                                <strong>{log.modifiedBy}</strong>
                                <span>Verified By</span>
                                <strong>{log.verifiedBy}</strong>
                              </div>
                            </div>
                            <div className="activity-detail-section">
                              <h4>
                                <SlidersHorizontal size={12} /> Change Details
                              </h4>
                              <div className="activity-change-box">
                                <div>
                                  <span>Field Changed</span>
                                  <strong>{log.field}</strong>
                                </div>
                                <div>
                                  <span>Old Value</span>
                                  <strong>{log.oldValue}</strong>
                                </div>
                                <div>
                                  <span>New Value</span>
                                  <strong>{log.newValue}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {visibleLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan="13"
                      style={{
                        padding: 45,
                        textAlign: "center",
                        color: "#7890a3",
                      }}
                    >
                      No activity logs match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="activity-footer">
            <span>
              Showing {filteredLogs.length ? (page - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(page * pageSize, filteredLogs.length)} of{" "}
              {filteredLogs.length} logs
            </span>
            <div className="activity-pagination">
              <button
                className="activity-page-button"
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    className={`activity-page-number${pageNumber === page ? " active" : ""}`}
                    type="button"
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                className="activity-page-button"
                type="button"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ChevronRight size={13} />
              </button>
              <span>Rows per page</span>
              <select
                className="activity-rows"
                value={rowsPerPage}
                onChange={(event) => changeRowsPerPage(event.target.value)}
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </footer>
        </section>
      </main>
    </AppShell>
  );
}
