'use client';

import { useState } from 'react';

export default function LeadDetails({ lead, open, onClose }) {
  const [tab, setTab] = useState('lead');

  if (!open || !lead) return null;

  const tabs = [
    { id: 'lead', label: 'Lead Information' },
    { id: 'notes', label: 'Notes' },
    { id: 'activity', label: 'Activity Log' },
  ];

  return (
    <div className="lead-detail-backdrop" onMouseDown={onClose}>
      <div className="lead-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="lead-detail-header">
          <h2>Lead Details</h2>
          <button type="button" className="lead-detail-back" onClick={onClose}>
            <span>-</span> Back
          </button>
        </div>

        <div className="lead-detail-body">
          <div className="detail-panel">
            <h3>Basic Information</h3>

            <div className="detail-grid">
              <div className="detail-row"><span>Lead ID</span><strong>:</strong><em>{lead.id}</em></div>
              <div className="detail-row"><span>Name</span><strong>:</strong><em>{lead.name}</em></div>
              <div className="detail-row"><span>Mobile Number</span><strong>:</strong><em>{lead.mobile}</em></div>
              <div className="detail-row"><span>Email ID</span><strong>:</strong><em>{lead.email}</em></div>
              <div className="detail-row"><span>Source</span><strong>:</strong><em>{lead.source}</em></div>
              <div className="detail-row"><span>Date</span><strong>:</strong><em>{lead.date}</em></div>
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

            {tab === 'lead' && (
              <>
                <h3>Additional Details</h3>
                <div className="detail-grid detail-grid-secondary">
                  <div className="detail-row"><span>Preferred Branch</span><strong>:</strong><em>{lead.branch}</em></div>
                  <div className="detail-row"><span>Product Interest</span><strong>:</strong><em>{lead.product}</em></div>
                  <div className="detail-row"><span>Loan Amount</span><strong>:</strong><em>{lead.amount}</em></div>
                  <div className="detail-row multi-line"><span>Remarks</span><strong>:</strong><em>{lead.remarks}</em></div>
                </div>
              </>
            )}

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
