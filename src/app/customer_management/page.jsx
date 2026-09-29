'use client';

import { useMemo, useState } from 'react';
import { Eye, Mail, Plus, Search, UserRound, UsersRound, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { api } from '../../services/api.js';

const getInitials = (name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState(api.customers);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'Individual' });

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch = !query || `${customer.id} ${customer.name} ${customer.phone} ${customer.email || ''}`.toLowerCase().includes(query);
      const matchesKyc = kycFilter === 'All' || customer.kyc === kycFilter;
      return matchesSearch && matchesKyc;
    });
  }, [customers, search, kycFilter]);

  const createCustomer = (event) => {
    event.preventDefault();
    const normalizedPhone = form.phone.trim();
    if (customers.some((customer) => customer.phone === normalizedPhone)) {
      setFormError('A customer with this phone number already exists.');
      return;
    }

    const customerName = form.name.trim();
    const customer = {
      id: `CUS-2026-${String(customers.length + 1).padStart(5, '0')}`,
      name: customerName,
      initials: getInitials(customerName),
      type: form.type,
      phone: normalizedPhone,
      email: form.email.trim(),
      kyc: 'Pending',
      activeLoans: 0
    };

    setCustomers((current) => [customer, ...current]);
    setSearch('');
    setKycFilter('All');
    setForm({ name: '', phone: '', email: '', type: 'Individual' });
    setFormError('');
    setShowCreateModal(false);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormError('');
  };

  const verifiedCount = customers.filter((customer) => customer.kyc === 'Verified').length;
  const pendingCount = customers.filter((customer) => customer.kyc === 'Pending').length;
  const loanCount = customers.reduce((total, customer) => total + customer.activeLoans, 0);

  return (
    <AppShell title="Customer Management">
      <PageHeader
        eyebrow="CUSTOMERS"
        title="Customer Management"
        description="Review customer profiles, KYC status, and active lending relationships."
        action={<button className="primary-button" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Add customer</button>}
      />

      <div className="metric-grid">
        <div className="metric-card"><div className="metric-icon teal"><UsersRound size={17} /></div><div className="metric-label">Total customers</div><div className="metric-value">{customers.length}</div></div>
        <div className="metric-card"><div className="metric-icon green"><UserRound size={17} /></div><div className="metric-label">KYC verified</div><div className="metric-value">{verifiedCount}</div></div>
        <div className="metric-card"><div className="metric-icon amber"><Eye size={17} /></div><div className="metric-label">KYC pending</div><div className="metric-value">{pendingCount}</div></div>
        <div className="metric-card"><div className="metric-icon blue"><Mail size={17} /></div><div className="metric-label">Active loans</div><div className="metric-value">{loanCount}</div></div>
      </div>

      <Card className="table-panel">
        <div className="panel-heading">
          <div><h2>Customer directory</h2><p>{filteredCustomers.length} of {customers.length} customers</p></div>
          <div className="workspace-toolbar">
            <label className="input-wrap" aria-label="Search customers"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, ID, or phone" /></label>
            <select className="filter-select" value={kycFilter} onChange={(event) => setKycFilter(event.target.value)} aria-label="Filter by KYC status">
              <option>All</option><option>Verified</option><option>Pending</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead><tr><th>Customer</th><th>Type</th><th>Phone</th><th>KYC status</th><th>Active loans</th><th>Action</th></tr></thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong><span className="sub-text">{customer.id}</span></td>
                  <td>{customer.type}</td>
                  <td>{customer.phone}</td>
                  <td><span className={`status ${customer.kyc === 'Verified' ? 'status-green' : 'status-amber'}`}>{customer.kyc}</span></td>
                  <td>{customer.activeLoans}</td>
                  <td><button className="secondary-button" type="button" onClick={() => setSelectedCustomer(customer)}><Eye size={15} /> View</button></td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && <tr><td colSpan="6">No customers match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedCustomer && (
        <Modal onClose={() => setSelectedCustomer(null)}>
          <div className="modal-header">
            <div><div className="eyebrow">CUSTOMER PROFILE</div><h2>{selectedCustomer.name}</h2></div>
            <button className="icon-button" type="button" onClick={() => setSelectedCustomer(null)} aria-label="Close customer profile"><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="review-summary">
              <span>Customer ID<strong>{selectedCustomer.id}</strong></span>
              <span>Customer type<strong>{selectedCustomer.type}</strong></span>
              <span>KYC status<strong>{selectedCustomer.kyc}</strong></span>
              <span>Active loans<strong>{selectedCustomer.activeLoans}</strong></span>
              <span>Phone<strong>{selectedCustomer.phone}</strong></span>
              <span>Email<strong>{selectedCustomer.email || 'Not provided'}</strong></span>
            </div>
          </div>
          <div className="modal-footer"><button className="secondary-button" type="button" onClick={() => setSelectedCustomer(null)}>Close</button></div>
        </Modal>
      )}

      {showCreateModal && (
        <Modal onClose={closeCreateModal}>
          <form onSubmit={createCustomer}>
            <div className="modal-header">
              <div><div className="eyebrow">CUSTOMERS</div><h2>Add customer</h2></div>
              <button className="icon-button" type="button" onClick={closeCreateModal} aria-label="Close add customer form"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="modal-copy">Create a customer profile. KYC will start as pending.</p>
              <div className="form-grid">
                <label>Full name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label>Customer type<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}><option>Individual</option><option>Proprietorship</option><option>Partnership</option><option>Company</option></select></label>
                <label>Phone number<input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required /></label>
                <label>Email address<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              </div>
              {formError && <p role="alert" className="form-error">{formError}</p>}
            </div>
            <div className="modal-footer"><button className="secondary-button" type="button" onClick={closeCreateModal}>Cancel</button><button className="primary-button" type="submit"><Plus size={15} /> Create customer</button></div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}