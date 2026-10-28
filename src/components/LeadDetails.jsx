'use client';

import { useState } from 'react';
import { Pencil, X } from 'lucide-react';

export default function LeadDetails({ lead, open, onClose, onEdit, loading = false, error = '', onRetry }) {
  const [tab, setTab] = useState('lead');

  if (!open || !lead) return null;

  const tabs = [
    { id: 'lead', label: 'Lead Information' },
    { id: 'notes', label: 'Notes' },
    { id: 'activity', label: 'Activity Log' },
  ];

  const detailSections = [
    {
      title: 'Customer Information',
      fields: [
        ['Customer Name', lead.customerName || lead.name],
        ['First Name', lead.firstName],
        ['Middle Name', lead.middleName],
        ['Last Name', lead.lastName],
        ['Date of Birth', lead.dateOfBirth],
        ['Age', lead.age],
        ['Customer Type', lead.customerType],
        ['Mobile Number', lead.mobileNumber || lead.mobile],
        ['Email ID', lead.email || lead.emailAddress],
        ['Residential Status', lead.residentialStatus],
        ['Gender', lead.gender],
        ['Marital Status', lead.maritalStatus],
        ['Dependents', lead.dependents ?? lead.numberOfDependents],
        ['PAN Card', lead.panCard || lead.panNumber],
        ['Aadhaar Card', lead.aadhaarCard || lead.aadhaarNumber],
        ['Passport Number', lead.passportNo || lead.passportNumber],
        ['Passport Expiry Date', lead.passportExpiryDate],
      ],
    },
    {
      title: 'Loan Details',
      fields: [
        ['Loan Product Type', lead.loanProductType || lead.product],
        ['Loan Amount', lead.loanAmount || lead.amount],
        ['Purpose of Loan', lead.loanPurpose || lead.purposeOfLoan],
        ['Down Payment / Collateral', lead.collateral ?? lead.downPaymentCollateral],
        ['Tenure', lead.tenure ? `${lead.tenure} ${lead.tenureUnit || 'month'}${Number(lead.tenure) === 1 ? '' : 's'}` : ''],
        ['Number of Instalments', lead.instalments ?? lead.numberOfInstalments],
        ['Interest Rate (% p.a.)', lead.interestRate ? `${lead.interestRate}%` : ''],
        ['Monthly EMI', lead.monthlyEmi ?? lead.emi],
        ['Total Interest', lead.totalInterest],
        ['Total Amount', lead.securityAmount],
      ],
    },
    {
      title: 'Income and Employment',
      fields: [
        ['Employment Type', lead.employmentType],
        ['Annual Income', lead.annualIncome],
        ['Designation', lead.designation],
        ['Employer / Business Name', lead.employerName],
        ['Location', lead.location],
        ['State', lead.state],
        ['Take Home Pay', lead.takeHomePay],
        ['Deductions', lead.deductions ?? lead.deductionsOrEmisPayable],
        ['Bank Name', lead.bankName],
        ['Primary Bank Account', lead.primaryBankAccount || lead.accountNumber],
      ],
    },
    {
      title: 'Referral and Assignment',
      fields: [
        ['Lead Acquisition Channel', lead.acquisitionChannel || lead.leadAcquisitionChannel || lead.source],
        ['Referral Date', lead.referralDate],
        ['Sourcing Agent / Partner ID', lead.partnerId || lead.sourcingAgentPartnerId],
        ['Agent / Partner Name', lead.partnerName || lead.agentPartnerName],
        ['Employee ID', lead.employeeId],
        ['Employee Name', lead.employeeName],
        ['Assigned Checker', lead.assignedCheckerName],
        ['Assigned Viewer', lead.assignedViewerName],
      ],
    },
    {
      title: 'Lead Tracking',
      fields: [
        ['Lead ID', lead.id],
        ['Lead Date', lead.date],
        ['Status', lead.status],
        ['Preferred Branch', lead.branch],
        ['Remarks', lead.remarks],
      ],
    },
  ];

  const renderDetailValue = (value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <div className="lead-detail-backdrop" onMouseDown={onClose}>
      <div className="lead-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="lead-detail-header">
          <div>
            <span className="lead-detail-eyebrow">LEAD RECORD</span>
            <h2>Lead Details <span>{lead.id}</span></h2>
          </div>
          <div className="lead-detail-actions">
            {onEdit && (
              <button type="button" className="lead-detail-edit" onClick={() => onEdit(lead)} disabled={loading}>
                <Pencil size={15} /> Edit Lead
              </button>
            )}
            <button type="button" className="lead-detail-back" aria-label="Close lead details" onClick={onClose}>
              <X size={18} /> Close
            </button>
          </div>
        </div>

        {loading || error ? (
          <div role={error ? 'alert' : 'status'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #e4ece9', color: error ? '#9d3030' : '#52696b', fontSize: '12px' }}>
            <span>{error || 'Loading full lead details...'}</span>
            {error && onRetry ? <button type="button" className="lead-detail-edit" onClick={onRetry}>Retry</button> : null}
          </div>
        ) : null}

        <div className="lead-detail-body">
          <div className="detail-panel">
            <h3>Basic Information</h3>

            <div className="detail-grid">
              <div className="detail-row"><span>Lead ID</span><strong>:</strong><em>{lead.id}</em></div>
              <div className="detail-row"><span>Customer Name</span><strong>:</strong><em>{lead.customerName || lead.name || '—'}</em></div>
              <div className="detail-row"><span>Mobile Number</span><strong>:</strong><em>{lead.mobileNumber || lead.mobile || '—'}</em></div>
              <div className="detail-row"><span>Acquisition Channel</span><strong>:</strong><em>{lead.acquisitionChannel || lead.source || '—'}</em></div>
              <div className="detail-row"><span>Lead Date</span><strong>:</strong><em>{lead.date || '—'}</em></div>
              <div className="detail-row"><span>Status</span><strong>:</strong><em><span className={`lead-status status-${lead.statusKey}`}>{lead.status}</span></em></div>
            </div>
          </div>

          <div className="detail-panel detail-panel-secondary">
            <div className="detail-tabs">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? 'detail-tab active' : 'detail-tab'}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'lead' && detailSections.map((section) => {
              const populatedFields = section.fields.filter(([, value]) => value !== null && value !== undefined && value !== '');
              if (!populatedFields.length) return null;
              return (
                <section className="lead-detail-section" key={section.title}>
                  <h3>{section.title}</h3>
                  <div className="detail-grid detail-grid-secondary">
                    {populatedFields.map(([label, value]) => (
                      <div className="detail-row" key={label}>
                        <span>{label}</span><strong>:</strong><em>{renderDetailValue(value)}</em>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {tab === 'notes' && (
              <div className="detail-empty-state">No notes added yet.</div>
            )}

            {tab === 'activity' && (
              <div className="detail-empty-state">No activity recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
