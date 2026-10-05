'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const getAgeFromDob = (dateString) => {
  if (!dateString) return '';
  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
};

const getCustomerTypeFromAge = (age) => {
  if (age === '' || age === null || Number.isNaN(Number(age))) return '';
  if (Number(age) < 18) return 'Minor';
  if (Number(age) >= 60) return 'Senior Citizen';
  return 'Adult';
};

const initialForm = {
  customerName: '',
  dateOfBirth: '',
  age: '',
  customerType: '',
  mobileNumber: '',
  otpNumber: '',
  otpSent: false,
  panCard: '',
  aadhaarCard: '',
  residentialStatus: '',
  gender: '',
  maritalStatus: '',
  passportNo: '',
  dependents: '',
  loanProductType: '',
  loanAmount: '',
  loanPurpose: '',
  tenure: '',
  tenureUnit: 'month',
  instalments: '',
  collateral: '',
  employmentType: '',
  annualIncome: '',
  designation: '',
  employerName: '',
  bankName: '',
  primaryBankAccount: '',
  acquisitionChannel: '',
  partnerId: '',
  partnerName: '',
};

const steps = [
  { title: 'Personal Details', fields: [
    { name: 'customerName', label: 'Name of the Customer', required: true, wide: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, pattern: '[6-9][0-9]{9}', maxLength: 10, inputMode: 'numeric' },
    { name: 'otpNumber', label: 'OTP Number', inputMode: 'numeric', maxLength: 6 },
    { name: 'panCard', label: 'PAN Card', pattern: '[A-Za-z]{5}[0-9]{4}[A-Za-z]', maxLength: 10 },
    { name: 'aadhaarCard', label: 'Aadhar Card', inputMode: 'numeric', pattern: '[0-9]{12}', maxLength: 12 },
    { name: 'residentialStatus', label: 'Residential Status', type: 'select', options: ['Resident', 'Non-Resident'] },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Other', 'Prefer not to say'] },
    { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'other'] },
    { name: 'dependents', label: 'No. of Dependents', type: 'number', min: 0, step: 1 },
  ] },
  { title: 'Loan Details', fields: [
    { name: 'loanProductType', label: 'Loan Product Type', type: 'select', options: ['Personal Loan', 'Home Loan', 'Business Loan', 'Vehicle Loan', 'Education Loan'], required: true },
    { name: 'loanAmount', label: 'Loan Amount', type: 'number', min: 1, step: 1, required: true },
    { name: 'loanPurpose', label: 'Purpose of Loan', type: 'select', options: ['Home purchase', 'Home renovation', 'Medical expenses', 'Education', 'Business expansion', 'Debt consolidation', 'Vehicle purchase', 'Other'] },
    { name: 'tenure', label: 'Tenure', type: 'number', min: 1, step: 1, required: true },
    { name: 'instalments', label: 'No. of Instalments', type: 'number', min: 1, step: 1 },
    { name: 'collateral', label: 'Down Payment / Collateral', type: 'number', min: 0, step: 1 },
  ] },
  { title: 'Income Profile', fields: [
    { name: 'employmentType', label: 'Employment Type', type: 'select', options: ['Salaried', 'Self-employed', 'Business owner', 'Other'], required: true },
    { name: 'annualIncome', label: 'Annual Income', type: 'number', min: 1, step: 1, required: true },
    { name: 'designation', label: 'Designation' },
    { name: 'employerName', label: 'Employer / Business Name', wide: true },
    { name: 'bankName', label: 'Bank Name' },
    { name: 'primaryBankAccount', label: 'Primary Bank Account', inputMode: 'numeric', pattern: '[0-9]{9,18}', maxLength: 18 },
    { name: 'collateral', label: 'Down Payment / Collateral', type: 'number', min: 0, step: 1 },
  ] },
  { title: 'Referral Details', fields: [
    { name: 'acquisitionChannel', label: 'Lead Acquisition Channel', type: 'select', options: ['Branch', 'Website', 'Mobile App', 'Customer Referral', 'Direct Sales', 'Partner / Agent', 'Other'], required: true },
    { name: 'partnerId', label: 'Sourcing Agent / Partner ID' },
    { name: 'partnerName', label: 'Agent / Partner Name', wide: true },
  ] },
];

export default function NewLead({ open, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [activeStep, setActiveStep] = useState(0);

  if (!open) return null;

  const computedAge = form.dateOfBirth ? getAgeFromDob(form.dateOfBirth) : '';
  const computedCustomerType = form.dateOfBirth ? getCustomerTypeFromAge(computedAge) : '';
  const computedInstalments = form.tenure
    ? (() => {
        const numericTenure = Number(form.tenure);
        if (Number.isNaN(numericTenure) || numericTenure <= 0) return '';
        const map = {
          month: numericTenure,
          quarter: numericTenure * 3,
          year: numericTenure * 12,
        };
        return String(map[form.tenureUnit] ?? numericTenure);
      })()
    : '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setActiveStep(0);
    onClose();
  };

  const validateStep = () => {
    const fields = Array.from(document.querySelectorAll('.lead-step-panel input[required], .lead-step-panel select[required]'));
    const invalidField = fields.find((field) => field.disabled || !field.value || !field.value.toString().trim());

    if (invalidField) {
      invalidField.focus();
      invalidField.reportValidity ? invalidField.reportValidity() : window.alert('Please complete all mandatory fields before continuing.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((current) => current + 1);
  };

  const handleSendOtp = () => {
    if (!form.mobileNumber || form.mobileNumber.length < 10) {
      window.alert('Please enter a valid 10-digit mobile number before sending OTP.');
      return;
    }

    setForm((current) => ({ ...current, otpSent: true }));
    window.alert('OTP sent to the registered mobile number.');
  };

  const renderField = (field) => (
    <label className={`lead-field${field.wide ? ' lead-field-wide' : ''}`} key={field.name}>
      <span>{field.label}{field.required && <em> *</em>}</span>
      {field.type === 'select' ? (
        <select name={field.name} value={form[field.name]} onChange={handleChange} required={field.required}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          type={field.type || 'text'}
          name={field.name}
          value={form[field.name]}
          onChange={handleChange}
          required={field.required}
          pattern={field.pattern}
          maxLength={field.maxLength}
          inputMode={field.inputMode}
          min={field.min}
          step={field.step}
          max={field.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
          autoComplete="off"
        />
      )}
    </label>
  );

  const renderPersonalDetails = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '18px 20px' }}>
      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'end' }}>
        <span>Name of the Customer <em>*</em></span>
        <input
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          required
          autoComplete="off"
          style={{ minHeight: '42px' }}
        />
      </label>

      <div style={{ gridColumn: '2 / span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'flex-end' }}>
        <button type="button" style={{ minWidth: '168px', minHeight: '42px', border: '1px solid #bfd4e8', background: '#edf3fb', color: '#20476d', borderRadius: '6px', fontWeight: 600, padding: '0 16px' }}>
          De-Duplicate Check
        </button>
        <button type="button" style={{ minWidth: '150px', minHeight: '42px', border: '1px solid #bfd4e8', background: '#edf3fb', color: '#20476d', borderRadius: '6px', fontWeight: 600, padding: '0 16px' }}>
          Blacklist Check
        </button>
      </div>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Date of Birth</span>
        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Age</span>
        <input name="age" value={computedAge} readOnly style={{ minHeight: '42px', background: '#f6f8fa' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Customer Type</span>
        <input name="customerType" value={computedCustomerType} readOnly style={{ minHeight: '42px', background: '#f6f8fa' }} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '12px' }}>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Mobile Number</span>
          <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} type="tel" inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" style={{ minHeight: '42px' }} />
        </label>
        <button
          type="button"
          onClick={handleSendOtp}
          style={{ minWidth: '110px', minHeight: '42px', border: '1px solid #bfd4e8', background: '#e7f4ee', color: '#1f5e4b', borderRadius: '6px', fontWeight: 700, padding: '0 14px' }}
        >
          Send OTP
        </button>
      </div>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>OTP Number</span>
        <input name="otpNumber" value={form.otpNumber} onChange={handleChange} inputMode="numeric" maxLength={6} style={{ minHeight: '42px' }} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '12px' }}>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>PAN Card</span>
          <input name="panCard" value={form.panCard} onChange={handleChange} maxLength={10} style={{ minHeight: '42px' }} />
        </label>
        <button type="button" style={{ minWidth: '90px', minHeight: '42px', border: '1px solid #bfd4e8', background: '#e6edf6', color: '#223f5b', borderRadius: '6px', fontWeight: 700, padding: '0 14px' }}>
          Validate
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '12px' }}>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Aadhaar Card</span>
          <input name="aadhaarCard" value={form.aadhaarCard} onChange={handleChange} inputMode="numeric" maxLength={12} style={{ minHeight: '42px' }} />
        </label>
        <button type="button" style={{ minWidth: '90px', minHeight: '42px', border: '1px solid #bfd4e8', background: '#e6edf6', color: '#223f5b', borderRadius: '6px', fontWeight: 700, padding: '0 14px' }}>
          Validate
        </button>
      </div>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Residential Status</span>
        <select name="residentialStatus" value={form.residentialStatus} onChange={handleChange} style={{ minHeight: '42px' }}>
          <option value="">Select</option>
          <option value="Resident">Resident</option>
          <option value="Non-Resident">Non-Resident</option>
        </select>
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Gender</span>
        <select name="gender" value={form.gender} onChange={handleChange} style={{ minHeight: '42px' }}>
          <option value="">Select</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Marital Status</span>
        <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} style={{ minHeight: '42px' }}>
          <option value="">Select</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Passport No.</span>
        <input name="passportNo" value={form.passportNo} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

    </div>
  );

  const renderLoanDetails = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 20px' }}>
      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Loan Product Type <em>*</em></span>
        <select name="loanProductType" value={form.loanProductType} onChange={handleChange} required style={{ minHeight: '42px' }}>
          <option value="">Select product</option>
          <option value="Personal Loan">Personal Loan</option>
          <option value="Home Loan">Home Loan</option>
          <option value="Business Loan">Business Loan</option>
          <option value="Vehicle Loan">Vehicle Loan</option>
          <option value="Education Loan">Education Loan</option>
        </select>
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Loan Amount <em>*</em></span>
        <input name="loanAmount" type="number" min="1" value={form.loanAmount} onChange={handleChange} required style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Purpose of Loan</span>
        <select name="loanPurpose" value={form.loanPurpose} onChange={handleChange} style={{ minHeight: '42px' }}>
          <option value="">Select purpose</option>
          <option value="Home purchase">Home purchase</option>
          <option value="Home renovation">Home renovation</option>
          <option value="Medical expenses">Medical expenses</option>
          <option value="Education">Education</option>
          <option value="Business expansion">Business expansion</option>
          <option value="Debt consolidation">Debt consolidation</option>
          <option value="Vehicle purchase">Vehicle purchase</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Tenure</span>
          <input name="tenure" type="number" min="1" value={form.tenure} onChange={handleChange} style={{ minHeight: '42px' }} />
        </label>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Unit</span>
          <select name="tenureUnit" value={form.tenureUnit} onChange={handleChange} style={{ minHeight: '42px' }}>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
        </label>
      </div>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>No. of Instalments</span>
        <input name="instalments" value={computedInstalments} readOnly style={{ minHeight: '42px', background: '#f6f8fa' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Down Payment / Collateral</span>
        <input name="collateral" type="number" min="0" value={form.collateral} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

    </div>
  );

  const renderIncomeProfile = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 20px' }}>
      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Employment Type <em>*</em></span>
        <select name="employmentType" value={form.employmentType} onChange={handleChange} required style={{ minHeight: '42px' }}>
          <option value="">Select type</option>
          <option value="Salaried">Salaried</option>
          <option value="Self-Employed">Self-Employed</option>
          <option value="Corporate Employee">Corporate Employee</option>
          <option value="Business Owner">Business Owner</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Annual Income <em>*</em></span>
        <input name="annualIncome" type="number" min="1" value={form.annualIncome} onChange={handleChange} required style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Designation</span>
        <input name="designation" value={form.designation} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Employer / Business Name</span>
        <input name="employerName" value={form.employerName} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Bank Name</span>
        <input name="bankName" value={form.bankName} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Primary Bank Account</span>
        <input name="primaryBankAccount" value={form.primaryBankAccount} onChange={handleChange} inputMode="numeric" maxLength={18} style={{ minHeight: '42px' }} />
      </label>

    </div>
  );

  const renderReferralDetails = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 20px' }}>
      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Lead Acquisition Channel <em>*</em></span>
        <select name="acquisitionChannel" value={form.acquisitionChannel} onChange={handleChange} required style={{ minHeight: '42px' }}>
          <option value="">Select channel</option>
          <option value="Bank Generated">Bank Generated</option>
          <option value="Branch">Branch</option>
          <option value="Website">Website</option>
          <option value="Mobile App">Mobile App</option>
          <option value="Customer Referral">Customer Referral</option>
          <option value="Direct Sales">Direct Sales</option>
          <option value="Partner / Agent">Partner / Agent</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Sourcing Agent / Partner ID</span>
        <input name="partnerId" value={form.partnerId} onChange={handleChange} disabled={form.acquisitionChannel !== 'Bank Generated'} style={{ minHeight: '42px', opacity: form.acquisitionChannel === 'Bank Generated' ? 1 : 0.5 }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
        <span>Agent / Partner Name</span>
        <input name="partnerName" value={form.partnerName} onChange={handleChange} disabled={form.acquisitionChannel !== 'Bank Generated'} style={{ minHeight: '42px', opacity: form.acquisitionChannel === 'Bank Generated' ? 1 : 0.5 }} />
      </label>

    </div>
  );

  const renderFooter = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px', paddingTop: '10px' }}>
      {activeStep > 0 && (
        <button type="button" className="lead-cancel-btn" onClick={() => setActiveStep((current) => current - 1)} style={{ minWidth: '120px' }}>
          <ChevronLeft size={16} /> Previous
        </button>
      )}

      {activeStep < steps.length - 1 ? (
        <button type="button" className="lead-save-btn" onClick={handleNext} style={{ minWidth: '120px' }}>
          Next <ChevronRight size={16} />
        </button>
      ) : (
        <button type="submit" className="lead-save-btn" style={{ minWidth: '120px' }}>
          Submit
        </button>
      )}

      <button type="button" className="lead-cancel-btn" onClick={resetAndClose} style={{ minWidth: '120px' }}>
        Cancel
      </button>
    </div>
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const requiredFields = Array.from(document.querySelectorAll('.lead-step-panel input[required], .lead-step-panel select[required]'));
    const missing = requiredFields.filter((field) => !field.disabled && (!field.value || !field.value.toString().trim()));

    if (missing.length > 0) {
      const firstMissing = missing[0];
      firstMissing.focus();
      window.alert('Please fill all mandatory fields before submitting the lead.');
      return;
    }

    onCreate(form);
    resetAndClose();
  };

  return (
    <div className="lead-modal-backdrop" onMouseDown={resetAndClose}>
      <div className="lead-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="lead-modal-header">
          <div>
            <h2>New Lead</h2>
            <p>Capture the applicant and loan requirements</p>
          </div>
          <button type="button" className="lead-modal-close" aria-label="Close form" onClick={resetAndClose}>
            <X size={18} />
          </button>
        </div>

        <form className="lead-form" onSubmit={handleSubmit}>
          <div className="lead-step-layout">
            <nav className="lead-step-nav" aria-label="Lead form steps">
              {steps.map((step, index) => (
                <button
                  type="button"
                  key={step.title}
                  className={`lead-step-item${index === activeStep ? ' active' : ''}${index < activeStep ? ' complete' : ''}`}
                  onClick={() => index < activeStep && setActiveStep(index)}
                  aria-current={index === activeStep ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  <span className="lead-step-number">{index < activeStep ? '✓' : index + 1}</span>
                  <span>{step.title}</span>
                </button>
              ))}
            </nav>

            <section className="lead-step-panel" aria-labelledby="lead-step-title">
              <div className="lead-step-heading">
                <span>Step {activeStep + 1} of {steps.length}</span>
                <h3 id="lead-step-title">{steps[activeStep].title}</h3>
              </div>
              {activeStep === 0 ? (
                renderPersonalDetails()
              ) : activeStep === 1 ? (
                renderLoanDetails()
              ) : activeStep === 2 ? (
                renderIncomeProfile()
              ) : activeStep === 3 ? (
                renderReferralDetails()
              ) : (
                <div className="lead-step-fields">
                  {steps[activeStep].fields.map(renderField)}
                </div>
              )}
              {renderFooter()}
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
