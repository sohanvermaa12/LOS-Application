'use client';

import { api } from '../services/api.js';

const statusStyles = { 'In review': 'status-blue', Approved: 'status-green', Returned: 'status-amber', Draft: 'status-grey', 'Awaiting KYC': 'status-violet' };

export default function ApplicationTable({ compact = false }) {
  const rows = api.applications.slice(0, compact ? 5 : 7);
  return <div className="table-scroll"><table><thead><tr><th>Application</th><th>Customer</th><th>Product</th><th>Amount</th><th>Last updated</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong className="id-text">{row.id}</strong><span className="sub-text">{row.branch}</span></td><td><strong>{row.customer}</strong><span className="sub-text">{row.customerId}</span></td><td>{row.product}</td><td className="amount">{row.amount}</td><td>{row.updated}</td><td><span className={`status ${statusStyles[row.status]}`}>{row.status}</span></td></tr>)}</tbody></table></div>;
}