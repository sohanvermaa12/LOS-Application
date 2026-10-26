'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Eye, FilePlus2, Mail, Pencil, Search, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { api } from '../../services/api.js';

const getInitials = (name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const CUSTOMER_STORAGE_KEY = 'los_customer_management_records';

function readCustomers() {
  try {
    const stored = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : api.customers;
  } catch {
    return api.customers;
  }
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState(api.customers);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [corporateUnavailable, setCorporateUnavailable] = useState(false);
  const [formError, setFormError] = useState('');
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', type: 'Individual', kyc: 'Pending' });

  useEffect(() => setCustomers(readCustomers()), []);

  useEffect(() => {
    if (!categorySelectorOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCategorySelectorOpen(false);
        setCorporateUnavailable(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [categorySelectorOpen]);

  const openCategorySelector = () => {
    setCorporateUnavailable(false);
    setCategorySelectorOpen(true);
  };

  const closeCategorySelector = () => {
    setCorporateUnavailable(false);
    setCategorySelectorOpen(false);
  };

  const storeCustomers = (nextCustomers) => {
    setCustomers(nextCustomers);
    try {
      window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(nextCustomers));
    } catch {
      setFormError('Changes could not be saved in this browser.');
    }
  };

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch = !query || `${customer.id} ${customer.name} ${customer.phone} ${customer.email || ''}`.toLowerCase().includes(query);
      const matchesKyc = kycFilter === 'All' || customer.kyc === kycFilter;
      return matchesSearch && matchesKyc;
    });
  }, [customers, search, kycFilter]);

  const openEditor = (customer) => {
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      type: customer.type || 'Individual',
      kyc: customer.kyc || 'Pending'
    });
    setFormError('');
    setEditingCustomer(customer);
  };

  const updateCustomer = (event) => {
    event.preventDefault();
    const name = editForm.name.trim();
    const phone = editForm.phone.trim();
    const email = editForm.email.trim();
    if (name.length < 2) {
      setFormError('Enter a customer name with at least 2 characters.');
      return;
    }
    if (!phone) {
      setFormError('Phone number is required.');
      return;
    }
    if (customers.some((customer) => customer.id !== editingCustomer.id && customer.phone === phone)) {
      setFormError('A customer with this phone number already exists.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a valid email address.');
      return;
    }

    storeCustomers(customers.map((customer) => customer.id === editingCustomer.id
      ? { ...customer, ...editForm, name, phone, email, initials: getInitials(name) }
      : customer));
    setFormError('');
    setEditingCustomer(null);
  };

  const closeEditor = () => {
    setEditingCustomer(null);
    setFormError('');
  };

  const confirmDelete = () => {
    storeCustomers(customers.filter((customer) => customer.id !== deleteCustomer.id));
    if (selectedCustomer?.id === deleteCustomer.id) setSelectedCustomer(null);
    setDeleteCustomer(null);
  };

  const verifiedCount = customers.filter((customer) => customer.kyc === 'Verified').length;
  const pendingCount = customers.filter((customer) => customer.kyc === 'Pending').length;
  const loanCount = customers.reduce((total, customer) => total + customer.activeLoans, 0);

  return (
    <AppShell title="Customer Management">
      <div style={{ marginTop: '-15px', marginBottom: '26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#23474C', font: '700 23px Manrope' }}>Customer Management</h1>
        <button className="primary-button customer-add-button" type="button" onClick={openCategorySelector}><FilePlus2 size={16} /> Add Customer</button>
      </div>

      <div className="metric-grid">
        <div className="metric-card"><div className="metric-icon teal"><UsersRound size={17} /></div><div className="metric-label">Total customers</div><div className="metric-value">{customers.length}</div></div>
        <div className="metric-card"><div className="metric-icon green"><UserRound size={17} /></div><div className="metric-label">KYC verified</div><div className="metric-value">{verifiedCount}</div></div>
        <div className="metric-card"><div className="metric-icon amber"><Eye size={17} /></div><div className="metric-label">KYC pending</div><div className="metric-value">{pendingCount}</div></div>
        <div className="metric-card"><div className="metric-icon blue"><Mail size={17} /></div><div className="metric-label">Active loans</div><div className="metric-value">{loanCount}</div></div>
      </div>

      <Card className="table-panel">
        <div className="panel-heading">
          <div><h2>Customer directory</h2><p>{filteredCustomers.length} of {customers.length} customers</p></div>
          <div className="workspace-toolbar customer-management-toolbar">
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
                  <td><div className="customer-row-actions">
                    <button className="icon-button" type="button" onClick={() => setSelectedCustomer(customer)} aria-label={`View ${customer.name}`} title="View customer"><Eye size={16} /></button>
                    <button className="icon-button" type="button" onClick={() => openEditor(customer)} aria-label={`Edit ${customer.name}`} title="Edit customer"><Pencil size={15} /></button>
                    <button className="icon-button customer-delete" type="button" onClick={() => setDeleteCustomer(customer)} aria-label={`Delete ${customer.name}`} title="Delete customer"><Trash2 size={15} /></button>
                  </div></td>
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

      {editingCustomer && (
        <Modal onClose={closeEditor}>
          <form onSubmit={updateCustomer}>
            <div className="modal-header">
              <div><div className="eyebrow">CUSTOMER PROFILE</div><h2>Edit customer</h2></div>
              <button className="icon-button" type="button" onClick={closeEditor} aria-label="Close edit customer form"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <label>Full name<input value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={100} /></label>
                <label>Customer type<select value={editForm.type} onChange={(event) => setEditForm((current) => ({ ...current, type: event.target.value }))}><option>Individual</option><option>Proprietorship</option><option>Partnership</option><option>Company</option></select></label>
                <label>Phone number<input type="tel" value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} required /></label>
                <label>Email address<input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} /></label>
                <label>KYC status<select value={editForm.kyc} onChange={(event) => setEditForm((current) => ({ ...current, kyc: event.target.value }))}><option>Pending</option><option>Verified</option><option>Rejected</option></select></label>
              </div>
              {formError && <p role="alert" className="form-error">{formError}</p>}
            </div>
            <div className="modal-footer"><button className="secondary-button" type="button" onClick={closeEditor}>Cancel</button><button className="primary-button" type="submit">Save changes</button></div>
          </form>
        </Modal>
      )}

      {deleteCustomer && (
        <Modal onClose={() => setDeleteCustomer(null)}>
          <div className="modal-header">
            <div><div className="eyebrow">CUSTOMER DIRECTORY</div><h2>Delete customer?</h2></div>
            <button className="icon-button" type="button" onClick={() => setDeleteCustomer(null)} aria-label="Cancel customer deletion"><X size={18} /></button>
          </div>
          <div className="modal-body"><p className="modal-copy">Delete {deleteCustomer.name} ({deleteCustomer.id}) from the customer directory? This action cannot be undone.</p></div>
          <div className="modal-footer"><button className="secondary-button" type="button" onClick={() => setDeleteCustomer(null)}>Cancel</button><button className="primary-button customer-delete-confirm" type="button" onClick={confirmDelete}><Trash2 size={15} /> Delete customer</button></div>
        </Modal>
      )}

      {categorySelectorOpen && (
        <div
          className="category-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCategorySelector();
          }}
        >
          <section
            className="category-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-dialog-title"
          >
            <button
              className="category-close"
              type="button"
              onClick={closeCategorySelector}
              autoFocus
              aria-label="Close customer category selection"
            >
              <X size={19} />
            </button>
            <div className="category-dialog-icon">
              <FilePlus2 size={21} aria-hidden="true" />
            </div>
            <h2 id="category-dialog-title">Select Customer Category</h2>
            <p className="category-dialog-description">
              Choose the type of customer to onboard.
            </p>

            <div className="category-options">
              <Link
                className="category-option"
                href="/customer_management/customer_onboarding"
                onClick={closeCategorySelector}
              >
                <span className="category-option-icon retail">
                  <UserRound size={19} aria-hidden="true" />
                </span>
                <span className="category-option-copy">
                  <strong>Individual Customer Onboarding</strong>
                  <span>Apply for an individual customer.</span>
                </span>
                <span className="category-option-arrow" aria-hidden="true">→</span>
              </Link>
              <button
                className={`category-option ${corporateUnavailable ? 'selected' : ''}`}
                type="button"
                onClick={() => setCorporateUnavailable(true)}
              >
                <span className="category-option-icon corporate">
                  <Building2 size={19} aria-hidden="true" />
                </span>
                <span className="category-option-copy">
                  <strong>Corporate Customer Onboarding</strong>
                  <span>Onboard a business or corporate customer.</span>
                </span>
                <span className="category-option-arrow" aria-hidden="true">→</span>
              </button>
            </div>

            {corporateUnavailable && (
              <div className="corporate-notice" role="status">
                <Building2 size={18} aria-hidden="true" />
                <div>
                  <strong>Corporate Customer Onboarding is not yet available</strong>
                  <span>
                    Only Individual Customer Onboarding is configured in this project.
                  </span>
                </div>
              </div>
            )}

            <button
              className="category-back"
              type="button"
              onClick={closeCategorySelector}
            >
              Return to Customer Management
            </button>
          </section>
        </div>
      )}

      <style>{`
        .customer-add-button{border:0;background:#368262;box-shadow:0 4px 12px #36826225}.customer-add-button:hover{background:#2c6d52}.customer-add-button:focus-visible{outline:2px solid #368262;outline-offset:2px}
        .customer-management-toolbar{align-items:center;margin-bottom:0}.customer-management-toolbar .input-wrap{height:34px;margin-top:0}
        .customer-row-actions{display:flex;align-items:center;justify-content:flex-end;gap:4px}.customer-row-actions .icon-button{width:34px;height:34px;border:1px solid transparent}.customer-row-actions .icon-button:hover{border-color:var(--line);background:#f2f8f6;color:var(--teal)}.customer-row-actions .customer-delete:hover,.customer-delete-confirm{border-color:#b83b3b;background:#b83b3b;color:#fff}.customer-row-actions .customer-delete:hover,.customer-delete-confirm:hover{background:#992d2d;color:#fff}
        .category-overlay{position:fixed;z-index:100;inset:0;display:grid;place-items:center;padding:20px;background:rgb(18 39 43 / 45%)}
        .category-dialog{position:relative;width:min(100%,490px);padding:30px;border:1px solid #e5ecec;border-radius:12px;background:#fff;box-shadow:0 20px 60px rgb(23 63 73 / 20%)}
        .category-close{position:absolute;top:14px;right:14px;width:34px;height:34px;display:grid;place-items:center;border-radius:6px;color:#718185}.category-close:hover{color:#173e46;background:#f1f6f5}
        .category-dialog-icon{width:42px;height:42px;display:grid;place-items:center;margin-bottom:17px;border-radius:9px;color:#177e7a;background:#e5f2f0}
        .category-dialog h2{margin:0;color:#173e46;font:700 20px Manrope,sans-serif;letter-spacing:-.4px}
        .category-dialog-description{margin:8px 0 21px;color:#718185;font-size:12px;line-height:1.5}
        .category-options{display:grid;gap:10px}
        .category-option{width:100%;min-height:76px;display:flex;align-items:center;gap:13px;padding:13px;border:1px solid #e2eaea;border-radius:8px;background:#fff;text-align:left;text-decoration:none;transition:border-color .16s ease,background-color .16s ease}
        .category-option:hover,.category-option.selected{border-color:#8bbab4;background:#fbfefd}
        .category-option-icon{width:38px;height:38px;display:grid;flex:0 0 auto;place-items:center;border-radius:8px}
        .category-option-icon.retail{color:#177e7a;background:#e5f2f0}.category-option-icon.corporate{color:#4e7da2;background:#e8f0f7}
        .category-option-copy{display:grid;gap:5px}.category-option-copy strong{color:#34565b;font-size:12px}.category-option-copy span{color:#849497;font-size:11px}
        .category-option-arrow{margin-left:auto;color:#819396;font-size:18px}
        .corporate-notice{display:flex;align-items:flex-start;gap:10px;margin-top:14px;padding:12px;border:1px solid #f0dfc5;border-radius:7px;color:#a16f35;background:#fffaf2}
        .corporate-notice svg{flex:0 0 auto;margin-top:1px}.corporate-notice div{display:grid;gap:5px}.corporate-notice strong{font-size:11px}.corporate-notice span{color:#8d795f;font-size:10px;line-height:1.5}
        .category-back{margin-top:19px;padding:7px 0;color:#177e7a;font-size:11px;font-weight:700}.category-back:hover{color:#0c5d5d;text-decoration:underline}
        .category-option:focus-visible,.category-close:focus-visible,.category-back:focus-visible{outline:3px solid #177e7a55;outline-offset:2px}
        @media(max-width:640px){.category-dialog{padding:24px 20px}.category-option-copy strong{font-size:11px}}
      `}</style>
    </AppShell>
  );
}