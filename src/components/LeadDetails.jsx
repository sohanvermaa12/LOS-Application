'use client';

import { useState } from 'react';
import { Pencil, X } from 'lucide-react';

export default function LeadDetails({ lead, open, onClose, onEdit }) {
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
        ['Email ID', lead.email],
        ['Residential Status', lead.residentialStatus],
        ['Gender', lead.gender],
        ['Marital Status', lead.maritalStatus],
        ['Dependents', lead.dependents],
        ['PAN Card', lead.panCard],
        ['Aadhaar Card', lead.aadhaarCard],
        ['Passport Number', lead.passportNo],
        ['Passport Expiry Date', lead.passportExpiryDate],
      ],
    },
    {
      title: 'Loan Details',
      fields: [
        ['Loan Product Type', lead.loanProductType || lead.product],
        ['Loan Amount', lead.loanAmount || lead.amount],
        ['Purpose of Loan', lead.loanPurpose],
        ['Down Payment / Collateral', lead.collateral],
        ['Tenure', lead.tenure ? `${lead.tenure} ${lead.tenureUnit || 'month'}${Number(lead.tenure) === 1 ? '' : 's'}` : ''],
        ['Number of Instalments', lead.instalments],
        ['Interest Rate (% p.a.)', lead.interestRate ? `${lead.interestRate}%` : ''],
        ['Monthly EMI', lead.monthlyEmi],
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
        ['Deductions', lead.deductions],
        ['Bank Name', lead.bankName],
        ['Primary Bank Account', lead.primaryBankAccount],
      ],
    },
    {
      title: 'Referral and Assignment',
      fields: [
        ['Lead Acquisition Channel', lead.acquisitionChannel || lead.source],
        ['Referral Date', lead.referralDate],
        ['Sourcing Agent / Partner ID', lead.partnerId],
        ['Agent / Partner Name', lead.partnerName],
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
              <button type="button" className="lead-detail-edit" onClick={() => onEdit(lead)}>
                <Pencil size={15} /> Edit Lead
              </button>
            )}
            <button type="button" className="lead-detail-back" aria-label="Close lead details" onClick={onClose}>
              <X size={18} /> Close
            </button>
          </div>
        </div>

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
