import { ArrowUpRight, BriefcaseBusiness, Filter, Plus, Search, UserRound } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import { api } from '../../services/api.js';

export default function CustomersPage() {
  return <AppShell title="Customers"><PageHeader eyebrow="CUSTOMER DIRECTORY" title="Customers" description="Search customer profiles and review KYC readiness." action={<button className="primary-button"><Plus size={17} /> Add customer</button>} /><div className="workspace-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search name, PAN, mobile or customer ID" /></div><button className="filter-select"><Filter size={15} /> KYC status</button></div><section className="customer-grid">{api.customers.map((customer) => <Card className="customer-card" key={customer.id}><div className="customer-card-top"><div className="customer-avatar">{customer.initials}</div><span className={`status ${customer.kyc === 'Verified' ? 'status-green' : 'status-amber'}`}>{customer.kyc}</span></div><h3>{customer.name}</h3><p>{customer.id} · {customer.type}</p><div className="customer-details"><span><UserRound size={14} /> {customer.phone}</span><span><BriefcaseBusiness size={14} /> {customer.activeLoans} active loan{customer.activeLoans === 1 ? '' : 's'}</span></div><button className="outline-button">View profile <ArrowUpRight size={14} /></button></Card>)}</section></AppShell>;
}