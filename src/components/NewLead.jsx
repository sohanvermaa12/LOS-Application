'use client';

import { useState } from 'react';

const initialForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  mobile: '',
  email: '',
  branch: '',
  source: '',
  product: '',
  amount: '',
  remarks: '',
};

export default function NewLead({ open, onClose }) {
  const [form, setForm] = useState(initialForm);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onClose();
    setForm(initialForm);
  };

  return (
    <div className="lead-modal-backdrop" onMouseDown={onClose}>
      <div className="lead-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="lead-modal-header">
          <h2>Add New Lead</h2>
        </div>

        <form className="lead-form" onSubmit={handleSubmit}>
          <div className="lead-form-grid">
            <div className="lead-form-column">
              <h3>Personal Details</h3>

              <label className="lead-field">
                <span>First Name <em>*</em></span>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </label>

              <label className="lead-field">
                <span>Middle Name</span>
                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                />
              </label>

              <label className="lead-field">
                <span>Last Name <em>*</em></span>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </label>

              <label className="lead-field">
                <span>Mobile Number <em>*</em></span>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                />
              </label>

              <label className="lead-field">
                <span>Email ID</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email ID"
                />
              </label>

              <label className="lead-field select-field">
                <span>Preferred Branch</span>
                <select name="branch" value={form.branch} onChange={handleChange}>
                  <option value="">Select branch</option>
                  <option value="Andheri West">Andheri West</option>
                  <option value="Koramangala">Koramangala</option>
                  <option value="Pimpri">Pimpri</option>
                  <option value="Salt Lake">Salt Lake</option>
                </select>
              </label>
            </div>

            <div className="lead-form-column">
              <h3>Lead Source &amp; Product Interest</h3>

              <label className="lead-field select-field">
                <span>Lead Source <em>*</em></span>
                <select name="source" value={form.source} onChange={handleChange} required>
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Branch Office">Branch Office</option>
                  <option value="Partner Network">Partner Network</option>
                  <option value="Sales Team">Sales Team</option>
                </select>
              </label>

              <label className="lead-field select-field">
                <span>Product Interest <em>*</em></span>
                <select name="product" value={form.product} onChange={handleChange} required>
                  <option value="">Select product type</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Used Car Loan">Used Car Loan</option>
                </select>
              </label>

              <label className="lead-field">
                <span>Loan Amount (if available)</span>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </label>

              <label className="lead-field">
                <span>Remarks</span>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Enter remarks (optional)"
                  rows="4"
                />
              </label>
            </div>
          </div>

          <div className="lead-modal-footer">
            <button type="button" className="lead-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="lead-save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
