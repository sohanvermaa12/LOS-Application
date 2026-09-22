'use client';

import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import AppShell from '../../components/AppShell';
import NewLead from '../../components/NewLead';
import LeadDetails from '../../components/LeadDetails';

const leads = [
  { id: 'LD000123', name: 'Neha Patil', mobile: '9876543210', email: 'neha.patil@gmail.com', source: 'Website', date: '26-09-2026', status: 'New', statusKey: 'new', branch: 'Pune - FC Road', product: 'Home Loan', amount: '25,00,000', remarks: 'Interested in home loan, please contact me.' },
  { id: 'LD000122', name: 'Rohit Sharma', mobile: '8765432109', email: 'rohit.sharma@gmail.com', source: 'Mobile App', date: '25-09-2026', status: 'In Progress', statusKey: 'progress', branch: 'Koramangala', product: 'Personal Loan', amount: '12,00,000', remarks: 'Looking for quick processing.' },
  { id: 'LD000121', name: 'Pooja Deshmukh', mobile: '9123456780', email: 'pooja.deshmukh@gmail.com', source: 'Branch Office', date: '25-09-2026', status: 'Contacted', statusKey: 'contacted', branch: 'Andheri West', product: 'Business Loan', amount: '18,50,000', remarks: 'Waiting for discussion callback.' },
  { id: 'LD000120', name: 'Amit Joshi', mobile: '9988776655', email: 'amit.joshi@gmail.com', source: 'Partner Network', date: '24-09-2026', status: 'New', statusKey: 'new', branch: 'Pimpri', product: 'Home Loan', amount: '30,00,000', remarks: 'Family property loan inquiry.' },
  { id: 'LD000119', name: 'Sneha Kulkarni', mobile: '9098765432', email: 'sneha.kulkarni@gmail.com', source: 'Sales Team', date: '24-09-2026', status: 'Qualified', statusKey: 'qualified', branch: 'Salt Lake', product: 'Personal Loan', amount: '9,50,000', remarks: 'Documents uploaded and pending review.' },
];

export default function ApplicationsPage() {
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  return (
    <>
      <AppShell title="Lead Generation">
        <div className="lead-page">
          <div className="lead-toolbar">
          <div className="lead-filter">
            <label>Source</label>
            <div className="select-wrap">
              <select defaultValue="All">
                <option>All</option>
                <option>Website</option>
                <option>Mobile App</option>
                <option>Branch Office</option>
              </select>
            </div>
          </div>

          <div className="lead-filter">
            <label>From Date</label>
            <div className="date-field">
              <input type="date" defaultValue="2026-09-26" />
              <CalendarDays size={15} />
            </div>
          </div>

          <div className="lead-filter">
            <label>To Date</label>
            <div className="date-field">
              <input type="date" defaultValue="2026-09-26" />
              <CalendarDays size={15} />
            </div>
          </div>

          <div className="lead-filter status-filter">
            <label>Status</label>
            <div className="select-wrap">
              <select defaultValue="All">
                <option>All</option>
                <option>New</option>
                <option>In Progress</option>
                <option>Contacted</option>
                <option>Qualified</option>
              </select>
            </div>
          </div>

          <button className="primary-button search-button">
            <Search size={15} />
            Search
          </button>
        </div>

        <div className="lead-header-row">
          <button className="new-lead-button" onClick={() => setShowNewLead(true)}>
            <Plus size={16} />
            New Lead
          </button>
        </div>

        <div className="lead-table-panel">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Source</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.id}</td>
                  <td>{lead.name}</td>
                  <td>{lead.mobile}</td>
                  <td>{lead.source}</td>
                  <td>{lead.date}</td>
                  <td>
                    <span className={`lead-status status-${lead.statusKey}`}>{lead.status}</span>
                  </td>
                  <td className="actions-cell">
                    <button className="link-btn" onClick={() => setSelectedLead(lead)}>[View]</button>
                    <button className="link-btn">[Edit]</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          <div className="lead-pagination">
            <span>Showing 1 to 5 of 5 records</span>
            <div className="pagination-controls">
              <button className="pager-button" aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              <span className="page-number">1</span>
              <button className="pager-button" aria-label="Next page">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </AppShell>

      <NewLead open={showNewLead} onClose={() => setShowNewLead(false)} />
      <LeadDetails lead={selectedLead} open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} />
    </>
  );
}