'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getLoanProducts } from '../services/loanProducts';

const verhoeffMultiplication = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const verhoeffPermutation = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const hasValidAadhaarChecksum = (value) => {
  let checksum = 0;
  const digits = value.split('').reverse().map(Number);

  digits.forEach((digit, index) => {
    checksum = verhoeffMultiplication[checksum][verhoeffPermutation[index % 8][digit]];
  });

  return checksum === 0;
};

const normalizePan = (value) => {
  let pan = '';

  for (const character of value.toUpperCase().replace(/[^A-Z0-9]/g, '')) {
    const position = pan.length;
    const expectedPattern = position < 5 || position === 9 ? /^[A-Z]$/ : /^[0-9]$/;

    if (expectedPattern.test(character)) pan += character;
    if (pan.length === 10) break;
  }

  return pan;
};

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
  passportExpiryDate: '',
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
  interestRate: '',
  loanPurpose: '',
  securityAmount: '',
  tenure: '',
  tenureUnit: 'month',
  instalments: '',
  collateral: '',
  employmentType: '',
  annualIncome: '',
  designation: '',
  employerName: '',
  location: '',
  state: '',
  takeHomePay: '',
  deductions: '',
  bankName: '',
  primaryBankAccount: '',
  acquisitionChannel: '',
  referralDate: '',
  partnerId: '',
  partnerName: '',
  employeeId: '',
  employeeName: '',
};

const steps = [
  { title: 'Personal Details', fields: [
    { name: 'customerName', label: 'Name of the Customer', required: true, wide: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'otpNumber', label: 'OTP Number', inputMode: 'numeric', maxLength: 6 },
    { name: 'panCard', label: 'PAN Card', pattern: '[A-Z]{5}[0-9]{4}[A-Z]', maxLength: 10 },
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
    { name: 'employmentType', label: 'Employment Type', type: 'select', options: ['Salaried', 'Self-Employed', 'Corporate Employee', 'Business Owner', 'Other'], required: true },
    { name: 'annualIncome', label: 'Annual Income', type: 'number', min: 1, step: 1, required: true },
    { name: 'designation', label: 'Designation' },
    { name: 'employerName', label: 'Employer / Business Name', wide: true },
    { name: 'bankName', label: 'Bank Name' },
    { name: 'primaryBankAccount', label: 'Primary Bank Account', inputMode: 'numeric', pattern: '[0-9]{9,18}', maxLength: 18 },
  ] },
  { title: 'Referral Details', fields: [
    { name: 'acquisitionChannel', label: 'Lead Acquisition Channel', type: 'select', options: ['Bank Generated', 'Branch', 'Website', 'Mobile App', 'Customer Referral', 'Direct Sales', 'Partner / Agent', 'Other'], required: true },
    { name: 'referralDate', label: 'Date', type: 'date' },
    { name: 'partnerId', label: 'Sourcing Agent / Partner ID' },
    { name: 'partnerName', label: 'Agent / Partner Name', wide: true },
    { name: 'employeeId', label: 'Emp ID' },
    { name: 'employeeName', label: 'Emp Name' },
  ] },
];

export default function NewLead({ open, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [activeStep, setActiveStep] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');
  const [aadhaarMessage, setAadhaarMessage] = useState('');
  const [aadhaarValidated, setAadhaarValidated] = useState(false);
  const [loanProducts, setLoanProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();
    setProductsLoading(true);
    setProductsError('');
    let accessToken;
    try {
      accessToken = JSON.parse(window.localStorage.getItem('authData'))?.accessToken;
    } catch {
      accessToken = null;
    }

    getLoanProducts(controller.signal, accessToken)
      .then(setLoanProducts)
      .catch((error) => {
        if (error.name !== 'AbortError') setProductsError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductsLoading(false);
      });

    return () => controller.abort();
  }, [open]);

  if (!open) return null;

  const computedAge = form.dateOfBirth ? getAgeFromDob(form.dateOfBirth) : '';
  const computedCustomerType = form.dateOfBirth ? getCustomerTypeFromAge(computedAge) : '';
  const tenureMonths = Number(form.tenure) * ({ month: 1, quarter: 3, year: 12 }[form.tenureUnit] || 1);
  const computedInstalments = Number.isFinite(tenureMonths) && tenureMonths > 0 ? String(tenureMonths) : '';
  const principal = Number(form.loanAmount) - Number(form.collateral || 0);
  const annualInterestRate = form.interestRate === '' ? null : Number(form.interestRate);
  const monthlyRate = Number.isFinite(annualInterestRate) && annualInterestRate >= 0 ? annualInterestRate / 1200 : null;
  const calculatedEmi = principal > 0 && tenureMonths > 0 && monthlyRate !== null
    ? monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate) / (1 - ((1 + monthlyRate) ** -tenureMonths))
    : null;
  const computedMonthlyEmi = Number.isFinite(calculatedEmi) ? String(Math.round(calculatedEmi)) : '';
  const calculatedTotalInterest = calculatedEmi === null ? null : Math.max(0, (calculatedEmi * tenureMonths) - principal);
  const computedTotalInterest = Number.isFinite(calculatedTotalInterest) ? String(Math.round(calculatedTotalInterest)) : '';
  const computedTotalAmount = principal > 0 && computedTotalInterest !== ''
    ? String(Math.round(principal + Number(computedTotalInterest)))
    : '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = name === 'aadhaarCard' || name === 'otpNumber'
      ? value.replace(/\D/g, '').slice(0, name === 'aadhaarCard' ? 12 : 6)
      : name === 'panCard' ? normalizePan(value) : value;

    setForm((current) => ({
      ...current,
      [name]: normalizedValue,
      ...(name === 'loanProductType'
        ? { interestRate: String(loanProducts.find((product) => product.name === value)?.annualInterestRate ?? '') }
        : {}),
      ...(name === 'aadhaarCard' ? { otpSent: false, otpNumber: '' } : {}),
      ...(name === 'acquisitionChannel' && !['Bank Generated', 'Branch'].includes(value)
        ? { referralDate: '', partnerId: '', partnerName: '', employeeId: '', employeeName: '' }
        : {}),
    }));
    if (name === 'aadhaarCard') {
      setAadhaarValidated(false);
      setOtpMessage('');
      setAadhaarMessage('');
    }
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setActiveStep(0);
    setOtpMessage('');
    setAadhaarMessage('');
    setAadhaarValidated(false);
    onClose();
  };

  const validateStep = () => {
    if (activeStep === 1) {
      const amountField = document.querySelector('.lead-step-panel input[name="loanAmount"]');
      const collateralField = document.querySelector('.lead-step-panel input[name="collateral"]');
      const amount = Number(form.loanAmount);
      const downPayment = Number(form.collateral || 0);
      const invalidDownPayment = amount > 0 && downPayment >= amount;

      amountField?.setCustomValidity('');
      collateralField?.setCustomValidity(invalidDownPayment ? 'Down payment must be less than the loan amount.' : '');
    }

    const fields = Array.from(document.querySelectorAll('.lead-step-panel input, .lead-step-panel select'));
    const invalidField = fields.find((field) => field.willValidate && !field.checkValidity());

    if (invalidField) {
      invalidField.focus();
      invalidField.reportValidity();
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((current) => current + 1);
  };

  const handleValidateAndSendOtp = () => {
    if (!/^[0-9]{12}$/.test(form.aadhaarCard) || !hasValidAadhaarChecksum(form.aadhaarCard)) {
      setAadhaarValidated(false);
      setAadhaarMessage('Enter a valid 12-digit Aadhaar number.');
      setOtpMessage('Enter and validate a valid 12-digit Aadhaar number first.');
      return;
    }

    setAadhaarValidated(true);
    setAadhaarMessage('Aadhaar number format and checksum are valid.');
    setOtpMessage('OTP delivery to the Aadhaar-registered mobile will be connected through the backend.');
  };

  const handleVerifyOtp = () => {
    if (!aadhaarValidated) {
      setOtpMessage('Validate the Aadhaar number before entering the OTP.');
      return;
    }

    if (!/^[0-9]{6}$/.test(form.otpNumber)) {
      setOtpMessage('Enter the 6-digit OTP to check its format.');
      return;
    }

    setOtpMessage('Aadhaar OTP verification is not configured. Connect an authorized Aadhaar KYC provider to verify this code.');
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

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
    <div className="lead-personal-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '18px 20px' }}>
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
          <span>Aadhaar Card</span>
          <input name="aadhaarCard" value={form.aadhaarCard} onChange={handleChange} inputMode="numeric" autoComplete="off" pattern="[0-9]{12}" maxLength={12} title="Enter the 12-digit Aadhaar number without spaces." style={{ minHeight: '42px' }} />
        </label>
        <button type="button" onClick={handleValidateAndSendOtp} style={{ minWidth: '145px', minHeight: '42px', border: '1px solid #bfd4e8', background: '#e6edf6', color: '#223f5b', borderRadius: '6px', fontWeight: 700, padding: '0 14px' }}>
          Validate &amp; Send OTP
        </button>
        {aadhaarMessage ? <p role="status" style={{ gridColumn: '1 / -1', margin: 0, color: '#526b76', fontSize: '11px' }}>{aadhaarMessage}</p> : null}
      </div>

      <div className="lead-otp-field">
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>OTP Number</span>
          <input name="otpNumber" value={form.otpNumber} onChange={handleChange} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} title="Enter the 6-digit OTP." disabled={!aadhaarValidated} style={{ minHeight: '42px' }} />
        </label>
        <button type="button" className="lead-otp-verify" onClick={handleVerifyOtp} disabled={!aadhaarValidated}>Verify OTP</button>
        {otpMessage ? <p className="lead-otp-message" role="status">{otpMessage}</p> : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '12px' }}>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>PAN Card</span>
          <input name="panCard" value={form.panCard} onChange={handleChange} autoComplete="off" maxLength={10} pattern="[A-Z]{5}[0-9]{4}[A-Z]" title="Enter PAN in the format ABCDE1234F." style={{ minHeight: '42px' }} />
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

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Passport Expiry Date</span>
        <input type="date" name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} min={new Date().toISOString().slice(0, 10)} style={{ minHeight: '42px' }} />
      </label>

    </div>
  );

  const renderLoanDetails = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 20px' }}>
      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Loan Product Type <em>*</em></span>
        <select name="loanProductType" value={form.loanProductType} onChange={handleChange} required disabled={productsLoading || Boolean(productsError)} style={{ minHeight: '42px' }}>
          <option value="">{productsLoading ? 'Loading products...' : 'Select product'}</option>
          {loanProducts.map((product) => <option key={product.id} value={product.name}>{product.name}</option>)}
        </select>
        {productsError ? <span role="alert" style={{ color: '#b33b3b', fontSize: '11px' }}>{productsError}</span> : null}
        {!productsLoading && !productsError && loanProducts.length === 0 ? <span role="status" style={{ color: '#708087', fontSize: '11px' }}>No active loan products are available.</span> : null}
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

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Down Payment</span>
        <input name="collateral" type="number" min="0" value={form.collateral} onChange={handleChange} style={{ minHeight: '42px' }} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
        <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Tenure</span>
          <input name="tenure" type="number" min="1" value={form.tenure} onChange={handleChange} required style={{ minHeight: '42px' }} />
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
        <span>Interest Rate (% p.a.) <em>*</em></span>
        <input name="interestRate" type="number" min="0" max="100" step="0.01" value={form.interestRate} onChange={handleChange} required style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Monthly EMI</span>
        <input name="monthlyEmi" value={computedMonthlyEmi ? formatCurrency(Number(computedMonthlyEmi)) : ''} readOnly style={{ minHeight: '42px', background: '#f6f8fa' }} />
        {calculatedEmi !== null ? <span style={{ color: '#708087', fontSize: '11px', fontWeight: 400 }}>{`Calculated over ${computedInstalments} months at ${annualInterestRate}% annual interest on the loan amount after down payment.`}</span> : null}
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Total Interest</span>
        <input name="totalInterest" value={computedTotalInterest ? formatCurrency(Number(computedTotalInterest)) : ''} readOnly style={{ minHeight: '42px', background: '#f6f8fa' }} />
      </label>

      <label className="lead-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Total Amount</span>
        <input name="securityAmount" value={computedTotalAmount ? formatCurrency(Number(computedTotalAmount)) : ''} readOnly style={{ minHeight: '42px', background: '#f6f8fa' }} />
      </label>

    </div>
  );

  const renderIncomeProfile = () => (
    <div className="lead-income-content">
      <div className="lead-income-grid">
        <label className="lead-field">
          <span>Employment Type <em>*</em></span>
          <select name="employmentType" value={form.employmentType} onChange={handleChange} required>
            <option value="">Select type</option>
            <option value="Employee">Employee</option>
            <option value="Self-Employed">Self-Employed</option>
          </select>
        </label>

        <label className="lead-field">
          <span>Annual Income <em>*</em></span>
          <input name="annualIncome" type="number" min="1" value={form.annualIncome} onChange={handleChange} required />
        </label>

        <label className="lead-field">
          <span>Designation</span>
          <input name="designation" value={form.designation} onChange={handleChange} />
        </label>

        <label className="lead-field lead-income-employer">
          <span>Employer Name</span>
          <input name="employerName" value={form.employerName} onChange={handleChange} />
        </label>

        <label className="lead-field">
          <span>Location</span>
          <input name="location" value={form.location} onChange={handleChange} />
        </label>

        <label className="lead-field">
          <span>State</span>
          <input name="state" value={form.state} onChange={handleChange} />
        </label>

        <label className="lead-field">
          <span>Take Home Pay</span>
          <input name="takeHomePay" type="number" min="0" value={form.takeHomePay} onChange={handleChange} />
        </label>

        <label className="lead-field">
          <span>Deductions (EMI's payable)</span>
          <input name="deductions" type="number" min="0" value={form.deductions} onChange={handleChange} />
        </label>

        <label className="lead-field">
          <span>Bank Name</span>
          <input name="bankName" value={form.bankName} onChange={handleChange} />
        </label>

        <label className="lead-field">
          <span>Account Number</span>
          <input name="primaryBankAccount" value={form.primaryBankAccount} onChange={handleChange} inputMode="numeric" maxLength={18} />
        </label>

        <button type="button" className="lead-income-consent">A/c Stmt - Consent</button>
      </div>

      <div className="lead-income-actions" aria-label="Income and credit checks">
        <button type="button">CIBIL Liability Check</button>
        <button type="button">Debt-to-Income DTI</button>
        <button type="button">Loan-to-Value LTV</button>
        <button type="button">Debt Service Coverage Ratio DSCR</button>
        <button type="button">Net Disposable Income NDI</button>
      </div>
    </div>
  );

  const renderReferralDetails = () => (
    <div className="lead-referral-grid">
      {(() => {
        const referralEnabled = ['Bank Generated', 'Branch'].includes(form.acquisitionChannel);
        return <>
      <label className="lead-field lead-referral-channel">
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

      <label className="lead-field lead-referral-date">
        <span>Date</span>
        <input type="date" name="referralDate" value={form.referralDate} onChange={handleChange} disabled={!referralEnabled} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field lead-referral-partner-id">
        <span>Sourcing Agent / Partner ID</span>
        <input name="partnerId" value={form.partnerId} onChange={handleChange} disabled={!referralEnabled} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field lead-referral-partner-name">
        <span>Agent / Partner Name</span>
        <input name="partnerName" value={form.partnerName} onChange={handleChange} disabled={!referralEnabled} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field lead-referral-employee-id">
        <span>Emp ID</span>
        <input name="employeeId" value={form.employeeId} onChange={handleChange} disabled={!referralEnabled} style={{ minHeight: '42px' }} />
      </label>

      <label className="lead-field lead-referral-employee-name">
        <span>Emp Name</span>
        <input name="employeeName" value={form.employeeName} onChange={handleChange} disabled={!referralEnabled} style={{ minHeight: '42px' }} />
      </label>
        </>;
      })()}
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

    onCreate({ ...form, instalments: computedInstalments, monthlyEmi: computedMonthlyEmi, totalInterest: computedTotalInterest, securityAmount: computedTotalAmount });
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
              <div className={`lead-step-heading${activeStep === 2 || activeStep === steps.length - 1 ? ' lead-referral-heading' : ''}`}>
                {activeStep === 2 || activeStep === steps.length - 1 ? null : <span>Step {activeStep + 1} of {steps.length}</span>}
                <h3 id="lead-step-title">{activeStep === 2 || activeStep === steps.length - 1 ? 'Lead Management' : steps[activeStep].title}</h3>
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
