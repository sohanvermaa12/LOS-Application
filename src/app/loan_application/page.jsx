'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Search } from 'lucide-react';
import { State } from 'country-state-city';
import AppShell from '../../components/AppShell';

const stepLabels = [
  'Personal Details',
  'Employment info',
  'Income Detail'
];

const loanProductOptions = [
  { value: 'gold', label: 'Gold Loan', code: 'GL-1001', description: 'Secured loan against gold assets with flexible eligibility.' },
  { value: 'business', label: 'Business Loan', code: 'BL-2002', description: 'Working capital and expansion support for business growth.' },
  { value: 'vehicle', label: 'Vehicle Loan', code: 'VL-3003', description: 'Financing for car, two-wheeler and commercial vehicles.' },
  { value: 'personal', label: 'Personal Loan', code: 'PL-4004', description: 'Unsecured borrowing for personal requirements and emergencies.' },
  { value: 'professional', label: 'Professional Loan', code: 'PR-5005', description: 'Loan designed for self-employed professionals and consultants.' }
];

const indianStates = State.getStatesOfCountry('IN');

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialForm = {
  loanType: 'personal',
  vehicleLoanType: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  gender: 'Male',
  phone: '',
  email: '',
  addressSame: 'Yes',
  addressType: 'Current & Aadhaar',
  currentAddress: '',
  permanentAddress: '',
  city: '',
  state: '',
  pincode: '',
  fatherName: '',
  motherName: '',
  maritalStatus: 'Married',
  companyName: '',
  employmentType: '',
  designation: '',
  totalWorkExperience: '',
  currentEmployerExperience: '',
  dateOfJoining: '',
  employmentVerificationStatus: '',
  salaryBankName: '',
  salaryCreditFrequency: '',
  monthlyIncome: '',
  annualIncome: '',
  businessType: 'Self Employed / Business',
  businessName: '',
  businessTypeValue: '',
  businessRegistrationNo: '',
  cibilScore: '',
  businessTurnover: '',
  businessVintage: ''
};

const validateStep = (form, step) => {
  const errors = [];
  const addError = (field, message) => errors.push({ field, message });
  const requireValue = (field, label) => {
    if (!String(form[field] || '').trim()) {
      addError(field, `${label} is required.`);
      return false;
    }

    return true;
  };
  const isValidDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const namePattern = /^[A-Za-z ]+$/;
  const validateName = (field, label, maxLength = 60) => {
    if (requireValue(field, label) && (!namePattern.test(form[field].trim()) || form[field].trim().length > maxLength)) {
      addError(field, `${label} must contain only letters and spaces and be at most ${maxLength} characters.`);
    }
  };
  const validateOptionalName = (field, label, maxLength = 30) => {
    const value = form[field].trim();
    if (value && (!namePattern.test(value) || value.length > maxLength)) {
      addError(field, `${label} must contain only letters and spaces and be at most ${maxLength} characters.`);
    }
  };
  const validatePositiveAmount = (field, label) => {
    if (requireValue(field, label) && (!/^\d+(\.\d{1,2})?$/.test(form[field]) || Number(form[field]) <= 0)) {
      addError(field, `${label} must be a positive amount.`);
    }
  };
  const validateLettersOnly = (field, label, maxLength = 100) => {
    if (requireValue(field, label) && (!/^[A-Za-z ]+$/.test(form[field].trim()) || form[field].trim().length > maxLength)) {
      addError(field, `${label} must contain only letters and spaces and be at most ${maxLength} characters.`);
    }
  };

  if (step === 0) {
    validateName('firstName', 'First name', 30);
    validateOptionalName('middleName', 'Middle name');
    validateName('lastName', 'Last name', 30);

    if (requireValue('dob', 'Date of birth') && (!isValidDate(form.dob) || form.dob > todayString)) {
      addError('dob', 'Date of birth must be a valid date that is not in the future.');
    }

    if (!['Male', 'Female', 'Other'].includes(form.gender)) {
      addError('gender', 'Select a gender.');
    }

    if (requireValue('phone', 'Phone number') && !/^[6-9]\d{9}$/.test(form.phone)) {
      addError('phone', 'Enter a valid 10-digit Indian mobile number.');
    }

    if (requireValue('email', 'Email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      addError('email', 'Enter a valid email address.');
    }

    if (!['Yes', 'No'].includes(form.addressSame)) {
      addError('addressSame', 'Select whether your address matches Aadhaar.');
    }

    if (!['Current & Aadhaar', 'Permanent - Aadhaar', 'All same'].includes(form.addressType)) {
      addError('addressType', 'Select an address type.');
    }

    requireValue('currentAddress', 'Current address');
    if (form.addressSame === 'No') {
      requireValue('permanentAddress', 'Permanent address');
    }
    if (requireValue('city', 'City') && !/^[A-Za-z ]+$/.test(form.city.trim())) {
      addError('city', 'City must contain only letters and spaces.');
    }

    if (!indianStates.some((state) => state.name === form.state)) {
      addError('state', 'Select a state.');
    }

    if (requireValue('pincode', 'Pincode') && !/^\d{6}$/.test(form.pincode)) {
      addError('pincode', 'Pincode must contain exactly 6 digits.');
    }

    validateName('fatherName', "Father's full name");
    validateName('motherName', "Mother's full name");

    if (!['Married', 'Unmarried'].includes(form.maritalStatus)) {
      addError('maritalStatus', 'Select a marital status.');
    }
  }

  if (step === 1) {
    validateLettersOnly('companyName', 'Company name');
    if (!['Full Time', 'Contract', 'Temporary'].includes(form.employmentType)) {
      addError('employmentType', 'Select an employment type.');
    }
    validateLettersOnly('designation', 'Designation');

    if (!['1-2 years', '3-5 years', '5+ years'].includes(form.totalWorkExperience)) {
      addError('totalWorkExperience', 'Select your total work experience.');
    }
    if (!['1-2 years', '3-5 years', '5+ years'].includes(form.currentEmployerExperience)) {
      addError('currentEmployerExperience', 'Select your current employer experience.');
    }

    if (requireValue('dateOfJoining', 'Date of joining') && (!isValidDate(form.dateOfJoining) || form.dateOfJoining > todayString)) {
      addError('dateOfJoining', 'Date of joining must be a valid date that is not in the future.');
    }

    if (!['Verified', 'Pending'].includes(form.employmentVerificationStatus)) {
      addError('employmentVerificationStatus', 'Select an employment verification status.');
    }
    if (!['Monthly', 'Bi-monthly', 'Weekly'].includes(form.salaryCreditFrequency)) {
      addError('salaryCreditFrequency', 'Select a salary credit frequency.');
    }
    requireValue('salaryBankName', 'Salary account / bank name');
  }

  if (step === 2) {
    validatePositiveAmount('monthlyIncome', 'Monthly income');
    validatePositiveAmount('annualIncome', 'Annual income');

    if (!['Salaried', 'Self Employed / Business'].includes(form.businessType)) {
      addError('businessType', 'Select a business type.');
    }

    validateLettersOnly('businessName', 'Business name');
    if (!['Sole Proprietorship', 'Partnership', 'Private Limited'].includes(form.businessTypeValue)) {
      addError('businessTypeValue', 'Select a business registration type.');
    }
    if (requireValue('businessRegistrationNo', 'Business registration number') && !/^\d{1,20}$/.test(form.businessRegistrationNo)) {
      addError('businessRegistrationNo', 'Business registration number must contain only digits and be at most 20 digits.');
    }

    if (requireValue('cibilScore', 'CIBIL score') && (!/^\d{3}$/.test(form.cibilScore) || Number(form.cibilScore) < 300 || Number(form.cibilScore) > 900)) {
      addError('cibilScore', 'CIBIL score must be a whole number from 300 to 900.');
    }

    if (!['1-2 years', '3-5 years', '5+ years'].includes(form.businessVintage)) {
      addError('businessVintage', 'Select a business vintage.');
    }
    validatePositiveAmount('businessTurnover', 'Business turnover');
  }

  return errors;
};

export default function LoanApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateDropdownRef = useRef(null);
  const [isDobCalendarOpen, setIsDobCalendarOpen] = useState(false);
  const dobCalendarRef = useRef(null);
  const [isJoiningCalendarOpen, setIsJoiningCalendarOpen] = useState(false);
  const joiningCalendarRef = useRef(null);

  const wizardSteps = useMemo(
    () => [
      { key: 'personal', title: 'Loan Application - Personal Details' },
      { key: 'employment', title: 'Loan Application - Employment Information' },
      { key: 'income', title: 'Loan Application - Income Information' }
    ],
    []
  );

  const selectedLoan = loanProductOptions.find((item) => item.value === form.loanType) || loanProductOptions[0];
  const currentTitle = wizardSteps[currentStep]?.title || 'Loan Application';
  const isLastStep = currentStep === wizardSteps.length - 1;
  const filteredStates = indianStates.filter((state) =>
    state.name.toLowerCase().includes(stateSearch.trim().toLowerCase())
  );

  useEffect(() => {
    const closeDropdownOnOutsideClick = (event) => {
      if (!stateDropdownRef.current?.contains(event.target)) {
        setIsStateDropdownOpen(false);
        setStateSearch('');
      }
      if (!dobCalendarRef.current?.contains(event.target)) {
        setIsDobCalendarOpen(false);
      }
      if (!joiningCalendarRef.current?.contains(event.target)) {
        setIsJoiningCalendarOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeDropdownOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeDropdownOnOutsideClick);
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => prev.filter((error) => error.field !== field));
  };

  const updateFieldIfValid = (field, value, pattern, maxLength) => {
    if (value.length <= maxLength && pattern.test(value)) {
      updateField(field, value);
    }
  };

  const selectState = (stateName) => {
    updateField('state', stateName);
    setIsStateDropdownOpen(false);
    setStateSearch('');
  };

  const selectedDob = form.dob ? new Date(`${form.dob}T00:00:00`) : null;
  const selectedJoiningDate = form.dateOfJoining ? new Date(`${form.dateOfJoining}T00:00:00`) : null;

  const renderFieldError = (field) => {
    const error = validationErrors.find((item) => item.field === field);
    return error ? <span className="field-error" role="alert">{error.message}</span> : null;
  };

  const goNext = () => {
    const errors = validateStep(form, currentStep);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    alert('Application submitted successfully.');
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <AppShell title="Loan Application">
      <div className="loan-application-shell">
        <div className="loan-application-card">
          <div className="loan-application-header">
            <h1>{currentTitle}</h1>
          </div>

          <div className="loan-stepper" aria-label="Application progress">
            {stepLabels.map((label, index) => {
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <div key={label} className={`loan-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <span className="loan-step-bubble">
                    {isDone ? <Check size={12} /> : index + 1}
                  </span>
                  <span className="loan-step-text">{label}</span>
                </div>
              );
            })}
          </div>

          {currentStep === 0 && (
            <div className="loan-form-section">
              <h2>Applicant Details</h2>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>First Name *</span>
                  <input
                    value={form.firstName}
                    onChange={(e) => updateFieldIfValid('firstName', e.target.value, /^[A-Za-z ]*$/, 30)}
                    placeholder="Enter First Name"
                    maxLength={30}
                  />
                  {renderFieldError('firstName')}
                </label>
                <label className="field-block">
                  <span>Middle Name</span>
                  <input
                    value={form.middleName}
                    onChange={(e) => updateFieldIfValid('middleName', e.target.value, /^[A-Za-z ]*$/, 30)}
                    placeholder="Enter Middle Name"
                    maxLength={30}
                  />
                  {renderFieldError('middleName')}
                </label>
                <label className="field-block">
                  <span>Last Name *</span>
                  <input
                    value={form.lastName}
                    onChange={(e) => updateFieldIfValid('lastName', e.target.value, /^[A-Za-z ]*$/, 30)}
                    placeholder="Enter Last Name"
                    maxLength={30}
                  />
                  {renderFieldError('lastName')}
                </label>
                <label className="field-block">
                  <span>Date of Birth *</span>
                  <div className="dob-picker" ref={dobCalendarRef}>
                    <button
                      type="button"
                      className="dob-picker-trigger"
                      aria-haspopup="dialog"
                      aria-expanded={isDobCalendarOpen}
                      onClick={() => setIsDobCalendarOpen((open) => !open)}
                    >
                      <span className={selectedDob ? '' : 'dob-picker-placeholder'}>
                        {selectedDob
                          ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selectedDob)
                          : 'Select date of birth'}
                      </span>
                      <CalendarDays size={18} aria-hidden="true" />
                    </button>
                    {isDobCalendarOpen && (
                      <div className="dob-calendar-popover" role="dialog" aria-label="Choose date of birth">
                        <Calendar
                          className="loan-birth-calendar"
                          value={selectedDob}
                          onChange={(value) => {
                            const date = Array.isArray(value) ? value[0] : value;
                            if (date instanceof Date) {
                              updateField('dob', formatDateValue(date));
                              setIsDobCalendarOpen(false);
                            }
                          }}
                          maxDate={new Date()}
                          defaultActiveStartDate={selectedDob || new Date()}
                          minDetail="decade"
                          maxDetail="month"
                          calendarType="gregory"
                          locale="en-IN"
                          showNeighboringMonth={false}
                        />
                      </div>
                    )}
                  </div>
                  {renderFieldError('dob')}
                </label>
              </div>

              <div className="field-grid gender-row">
                <label className="field-block compact">
                  <span>Gender *</span>
                  <div className="radio-group">
                    {['Male', 'Female', 'Other'].map((option) => (
                      <label key={option} className="radio-option">
                        <input type="radio" name="gender" checked={form.gender === option} onChange={(e) => updateField('gender', e.target.value)} value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {renderFieldError('gender')}
                </label>
              </div>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Phone *</span>
                  <div className="input-prefix">
                    <span>+91</span>
                    <input
                      value={form.phone}
                      onChange={(e) => updateFieldIfValid('phone', e.target.value, /^\d*$/, 10)}
                      placeholder="Enter Mobile Number"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                  {renderFieldError('phone')}
                </label>
                <label className="field-block">
                  <span>Email *</span>
                  <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Enter Email Address" maxLength={254} />
                  {renderFieldError('email')}
                </label>
              </div>

              <div className="loan-form-section-inner">
                <h3>Address Details</h3>

                <div className="field-grid inline-choice">
                  <label className="field-block compact">
                    <span>Address as per Aadhaar *</span>
                    <div className="radio-group">
                      {['Yes', 'No'].map((option) => (
                        <label key={option} className="radio-option">
                          <input type="radio" name="addressSame" checked={form.addressSame === option} onChange={(e) => updateField('addressSame', e.target.value)} value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    {renderFieldError('addressSame')}
                  </label>
                </div>

                <div className="field-grid inline-choice">
                  <label className="field-block compact">
                    <span>Address Type *</span>
                    <div className="radio-group">
                      {['Current & Aadhaar', 'Permanent - Aadhaar', 'All same'].map((option) => (
                        <label key={option} className="radio-option">
                          <input type="radio" name="addressType" checked={form.addressType === option} onChange={(e) => updateField('addressType', e.target.value)} value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    {renderFieldError('addressType')}
                  </label>
                </div>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Current Address *</span>
                    <input value={form.currentAddress} onChange={(e) => updateField('currentAddress', e.target.value)} placeholder="Enter Address" />
                    {renderFieldError('currentAddress')}
                  </label>
                  <label className="field-block">
                    <span>Permanent Address</span>
                    <input value={form.permanentAddress} onChange={(e) => updateField('permanentAddress', e.target.value)} placeholder="Enter Address" />
                    {renderFieldError('permanentAddress')}
                  </label>
                </div>

                <div className="field-grid three-col">
                  <label className="field-block">
                    <span>City *</span>
                    <input
                      value={form.city}
                      onChange={(e) => updateFieldIfValid('city', e.target.value, /^[A-Za-z ]*$/, 60)}
                      placeholder="Enter City"
                      maxLength={60}
                    />
                    {renderFieldError('city')}
                  </label>
                  <label className="field-block">
                    <span>State *</span>
                    <div className="state-select" ref={stateDropdownRef}>
                      <button
                        type="button"
                        className="state-select-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={isStateDropdownOpen}
                        onClick={() => {
                          setIsStateDropdownOpen((open) => !open);
                          setStateSearch('');
                        }}
                      >
                        <span className={form.state ? '' : 'state-select-placeholder'}>
                          {form.state || 'Select State'}
                        </span>
                        <ChevronDown size={18} aria-hidden="true" />
                      </button>
                      {isStateDropdownOpen && (
                        <div className="state-select-menu">
                          <div className="state-search">
                            <Search size={16} aria-hidden="true" />
                            <input
                              type="search"
                              value={stateSearch}
                              onChange={(event) => setStateSearch(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                  setIsStateDropdownOpen(false);
                                  setStateSearch('');
                                }
                              }}
                              placeholder="Search state"
                              aria-label="Search states"
                              autoFocus
                            />
                          </div>
                          <ul role="listbox" aria-label="Indian states">
                            {filteredStates.length > 0 ? (
                              filteredStates.map((state) => (
                                <li key={state.isoCode} role="presentation">
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={form.state === state.name}
                                    onClick={() => selectState(state.name)}
                                  >
                                    {state.name}
                                  </button>
                                </li>
                              ))
                            ) : (
                              <li className="state-no-results">No states found.</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    {renderFieldError('state')}
                  </label>
                  <label className="field-block">
                    <span>Pincode *</span>
                    <input
                      value={form.pincode}
                      onChange={(e) => updateFieldIfValid('pincode', e.target.value, /^\d*$/, 6)}
                      placeholder="Enter Pincode"
                      maxLength={6}
                      inputMode="numeric"
                    />
                    {renderFieldError('pincode')}
                  </label>
                </div>
              </div>

              <div className="loan-form-section-inner">
                <h3>Parent Information (Required)</h3>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Father's Full Name *</span>
                    <input
                      value={form.fatherName}
                      onChange={(e) => updateFieldIfValid('fatherName', e.target.value, /^[A-Za-z ]*$/, 60)}
                      placeholder="Enter Father's Name"
                      maxLength={60}
                    />
                    {renderFieldError('fatherName')}
                  </label>
                  <label className="field-block">
                    <span>Mother's Full Name *</span>
                    <input
                      value={form.motherName}
                      onChange={(e) => updateFieldIfValid('motherName', e.target.value, /^[A-Za-z ]*$/, 60)}
                      placeholder="Enter Mother's Name"
                      maxLength={60}
                    />
                    {renderFieldError('motherName')}
                  </label>
                </div>
                <div className="field-grid marital-row">
                  <label className="field-block compact">
                    <span>Marital Status *</span>
                    <div className="radio-group">
                      {['Married', 'Unmarried'].map((option) => (
                        <label key={option} className="radio-option">
                          <input type="radio" name="maritalStatus" checked={form.maritalStatus === option} onChange={(e) => updateField('maritalStatus', e.target.value)} value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                      <label className="radio-option">
                        <input type="checkbox" checked={false} readOnly />
                        <span>Add Co-Applicant (Optional)</span>
                      </label>
                    </div>
                    {renderFieldError('maritalStatus')}
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="loan-form-section">
              <h2>Employment Information</h2>

              <div className="field-grid three-col">
                <label className="field-block">
                  <span>Company Name *</span>
                  <input
                    value={form.companyName}
                    onChange={(e) => updateFieldIfValid('companyName', e.target.value, /^[A-Za-z ]*$/, 100)}
                    placeholder="Enter Company Name"
                    maxLength={100}
                  />
                  {renderFieldError('companyName')}
                </label>
                <label className="field-block">
                  <span>Employment Type *</span>
                  <select value={form.employmentType} onChange={(e) => updateField('employmentType', e.target.value)}>
                    <option value="">Select Employment Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                  {renderFieldError('employmentType')}
                </label>
                <label className="field-block">
                  <span>Designation *</span>
                  <input
                    value={form.designation}
                    onChange={(e) => updateFieldIfValid('designation', e.target.value, /^[A-Za-z ]*$/, 100)}
                    placeholder="Enter Designation"
                    maxLength={100}
                  />
                  {renderFieldError('designation')}
                </label>
              </div>

              <div className="field-grid three-col">
                <label className="field-block">
                  <span>Total Work Experience *</span>
                  <select value={form.totalWorkExperience} onChange={(e) => updateField('totalWorkExperience', e.target.value)}>
                    <option value="">Select Experience</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                  {renderFieldError('totalWorkExperience')}
                </label>
                <label className="field-block">
                  <span>Current Employer Experience *</span>
                  <select value={form.currentEmployerExperience} onChange={(e) => updateField('currentEmployerExperience', e.target.value)}>
                    <option value="">Select Experience</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                  {renderFieldError('currentEmployerExperience')}
                </label>
                <label className="field-block">
                  <span>Date of Joining *</span>
                  <div className="dob-picker" ref={joiningCalendarRef}>
                    <button
                      type="button"
                      className="dob-picker-trigger"
                      aria-haspopup="dialog"
                      aria-expanded={isJoiningCalendarOpen}
                      onClick={() => setIsJoiningCalendarOpen((open) => !open)}
                    >
                      <span className={selectedJoiningDate ? '' : 'dob-picker-placeholder'}>
                        {selectedJoiningDate
                          ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selectedJoiningDate)
                          : 'Select date of joining'}
                      </span>
                      <CalendarDays size={18} aria-hidden="true" />
                    </button>
                    {isJoiningCalendarOpen && (
                      <div className="dob-calendar-popover" role="dialog" aria-label="Choose date of joining">
                        <Calendar
                          className="loan-birth-calendar"
                          value={selectedJoiningDate}
                          onChange={(value) => {
                            const date = Array.isArray(value) ? value[0] : value;
                            if (date instanceof Date) {
                              updateField('dateOfJoining', formatDateValue(date));
                              setIsJoiningCalendarOpen(false);
                            }
                          }}
                          maxDate={new Date()}
                          defaultActiveStartDate={selectedJoiningDate || new Date()}
                          minDetail="decade"
                          maxDetail="month"
                          calendarType="gregory"
                          locale="en-IN"
                          showNeighboringMonth={false}
                        />
                      </div>
                    )}
                  </div>
                  {renderFieldError('dateOfJoining')}
                </label>
              </div>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Employment Verification Status *</span>
                  <select value={form.employmentVerificationStatus} onChange={(e) => updateField('employmentVerificationStatus', e.target.value)}>
                    <option value="">Select Verification Status</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                  </select>
                  {renderFieldError('employmentVerificationStatus')}
                </label>
                <label className="field-block">
                  <span>Salary Credit Frequency *</span>
                  <select value={form.salaryCreditFrequency} onChange={(e) => updateField('salaryCreditFrequency', e.target.value)}>
                    <option value="">Select Frequency</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-monthly">Bi-monthly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                  {renderFieldError('salaryCreditFrequency')}
                </label>
              </div>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Salary Account / Bank Name *</span>
                  <input value={form.salaryBankName} onChange={(e) => updateField('salaryBankName', e.target.value)} placeholder="Enter Bank Name" />
                  {renderFieldError('salaryBankName')}
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="loan-form-section">
              <h2>Income Detail</h2>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Monthly Income *</span>
                  <input
                    value={form.monthlyIncome}
                    onChange={(e) => updateFieldIfValid('monthlyIncome', e.target.value, /^\d*(\.\d{0,2})?$/, 15)}
                    placeholder="Enter Monthly Income"
                    inputMode="decimal"
                    maxLength={15}
                  />
                  {renderFieldError('monthlyIncome')}
                </label>
                <label className="field-block">
                  <span>Annual Income *</span>
                  <input
                    value={form.annualIncome}
                    onChange={(e) => updateFieldIfValid('annualIncome', e.target.value, /^\d*(\.\d{0,2})?$/, 15)}
                    placeholder="Enter Annual Income"
                    inputMode="decimal"
                    maxLength={15}
                  />
                  {renderFieldError('annualIncome')}
                </label>
              </div>

              <div className="field-grid inline-choice">
                <label className="field-block compact">
                  <span>Business Type *</span>
                  <div className="radio-group">
                    {['Salaried', 'Self Employed / Business'].map((option) => (
                      <label key={option} className="radio-option">
                        <input type="radio" name="businessType" checked={form.businessType === option} onChange={(e) => updateField('businessType', e.target.value)} value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {renderFieldError('businessType')}
                </label>
              </div>

              <div className="loan-form-section-inner">
                <h3>Business Details</h3>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Business Name *</span>
                    <input
                      value={form.businessName}
                      onChange={(e) => updateFieldIfValid('businessName', e.target.value, /^[A-Za-z ]*$/, 100)}
                      placeholder="Enter Business Name"
                      maxLength={100}
                    />
                    {renderFieldError('businessName')}
                  </label>
                  <label className="field-block">
                    <span>Business Type *</span>
                    <select value={form.businessTypeValue} onChange={(e) => updateField('businessTypeValue', e.target.value)}>
                      <option value="">Select Business Type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited">Private Limited</option>
                    </select>
                    {renderFieldError('businessTypeValue')}
                  </label>
                </div>

                <div className="field-grid three-col">
                  <label className="field-block">
                    <span>Business Registration No. *</span>
                    <input
                      value={form.businessRegistrationNo}
                      onChange={(e) => updateFieldIfValid('businessRegistrationNo', e.target.value, /^\d*$/, 20)}
                      placeholder="Enter Registration No."
                      inputMode="numeric"
                      maxLength={20}
                    />
                    {renderFieldError('businessRegistrationNo')}
                  </label>
                  <label className="field-block">
                    <span>CIBIL Score *</span>
                    <input
                      value={form.cibilScore}
                      onChange={(e) => updateFieldIfValid('cibilScore', e.target.value, /^\d*$/, 3)}
                      placeholder="Enter CIBIL Score"
                      inputMode="numeric"
                      maxLength={3}
                    />
                    {renderFieldError('cibilScore')}
                  </label>
                  <label className="field-block">
                    <span>Business Vintage *</span>
                    <select value={form.businessVintage} onChange={(e) => updateField('businessVintage', e.target.value)}>
                      <option value="">Select Vintage</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                    {renderFieldError('businessVintage')}
                  </label>
                </div>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Business Turnover *</span>
                    <input
                      value={form.businessTurnover}
                      onChange={(e) => updateFieldIfValid('businessTurnover', e.target.value, /^\d*(\.\d{0,2})?$/, 15)}
                      placeholder="Enter Turnover Amount"
                      inputMode="decimal"
                      maxLength={15}
                    />
                    {renderFieldError('businessTurnover')}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="loan-form-actions">
            <button type="button" className="loan-back-button" onClick={goBack} disabled={currentStep === 0}>
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" className="loan-continue-button" onClick={goNext}>
              {isLastStep ? 'Submit' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
