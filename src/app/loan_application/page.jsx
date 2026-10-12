'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Home,
  Landmark,
  UploadCloud,
  Wallet
} from 'lucide-react';
import AppShell from '../../components/AppShell';

const wizardSteps = [
  { id: 'personal', label: 'Personal Details', title: 'Loan Application - Personal Details', icon: UserIcon },
  { id: 'address', label: 'Address Details', title: 'Loan Application - Personal Details', icon: Home },
  { id: 'employment', label: 'Employment info', title: 'Loan Application - Employment Information', icon: Briefcase },
  { id: 'income', label: 'Income Detail', title: 'Loan Application - Income Information', icon: Wallet },
  { id: 'documents', label: 'Documents', title: 'Loan Application - Document Details', icon: FileText },
  { id: 'loan', label: 'Loan Details', title: 'Loan Application - Loan Details', icon: Landmark }
];

const initialForm = {
  customerNumber: '',
  panCard: '',
  fullName: '',
  middleName: '',
  lastName: '',
  dob: '',
  fatherName: '',
  age: '',
  motherName: '',
  email: '',
  customerType: '',
  aadhaarCard: '',
  aadhaarNumber: '',
  gender: '',
  kycRegn: '',
  maritalStatus: '',
  mobileNo: '',
  occupation: '',
  alternateContact: '',
  residentialStatus: '',
  residentialType: '',
  flatBuildingName: '',
  streetRoad: '',
  landMark: '',
  city: '',
  state: '',
  pinCode: '',
  employmentType: '',
  qualification: '',
  designation: '',
  empEmailId: '',
  employerName: '',
  location: '',
  dateOfJoining: '',
  dateOfRetirement: '',
  appointmentLetter: '',
  annualIncome: '',
  incomeTaxFile: '',
  riskCategory: '',
  bankName: '',
  bankAccountNo: '',
  formNo16: '',
  salaryCertificate: '',
  loanType: '',
  totalOutstanding: '',
  emi: '',
  loanExpiryDate: '',
  documentPan: '',
  documentAadhaar: '',
  documentSalary: '',
  documentBank: ''
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PIN_REGEX = /^\d{6}$/;

const normalizePan = (value) => {
  const characters = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let pan = '';

  for (const character of characters) {
    const position = pan.length;
    const isValid = position < 5
      ? /[A-Z]/.test(character)
      : position < 9
        ? /\d/.test(character)
        : /[A-Z]/.test(character);

    if (isValid) pan += character;
    if (pan.length === 10) break;
  }

  return pan;
};

const validateStep = (stepIndex, values) => {
  const errors = {};

  if (stepIndex === 0) {
    if (!values.fullName?.trim()) errors.fullName = 'First name is required.';
    if (!values.lastName?.trim()) errors.lastName = 'Last name is required.';
    if (!values.mobileNo || !MOBILE_REGEX.test(values.mobileNo)) errors.mobileNo = 'Enter a valid 10-digit mobile number.';
    if (!values.email || !EMAIL_REGEX.test(values.email)) errors.email = 'Enter a valid email address.';
    if (!values.panCard || !PAN_REGEX.test(values.panCard.toUpperCase())) errors.panCard = 'Enter a valid PAN number in format ABCDE1234F.';
    if (values.aadhaarCard === 'Yes' && (!values.aadhaarNumber || !AADHAAR_REGEX.test(values.aadhaarNumber))) {
      errors.aadhaarNumber = 'Aadhaar number must be a valid 12-digit number.';
    }
    if (!values.dob) errors.dob = 'Date of birth is required.';
    if (!values.fatherName?.trim()) errors.fatherName = 'Father name is required.';
    if (!values.motherName?.trim()) errors.motherName = 'Mother name is required.';
    if (!values.city?.trim()) errors.city = 'City is required.';
    if (!values.state) errors.state = 'State is required.';
    if (!values.pinCode || !PIN_REGEX.test(values.pinCode)) errors.pinCode = 'Pincode must be 6 digits.';
  }

  if (stepIndex === 1) {
    if (!values.flatBuildingName?.trim()) errors.flatBuildingName = 'Current address is required.';
    if (!values.city?.trim()) errors.city = 'City is required.';
    if (!values.state) errors.state = 'State is required.';
    if (!values.pinCode || !PIN_REGEX.test(values.pinCode)) errors.pinCode = 'Pincode must be 6 digits.';
    if (!values.residentialType) errors.residentialType = 'Select address type.';
    if (!values.aadhaarCard) errors.aadhaarCard = 'Choose Aadhaar match option.';
  }

  if (stepIndex === 2) {
    if (!values.employerName?.trim()) errors.employerName = 'Company name is required.';
    if (!values.employmentType) errors.employmentType = 'Employment type is required.';
    if (!values.designation?.trim()) errors.designation = 'Designation is required.';
    if (!values.occupation) errors.occupation = 'Work experience is required.';
    if (!values.qualification) errors.qualification = 'Current employer experience is required.';
    if (!values.dateOfJoining) errors.dateOfJoining = 'Date of joining is required.';
    if (!values.bankName?.trim()) errors.bankName = 'Salary account or bank name is required.';
  }

  if (stepIndex === 3) {
    if (!values.annualIncome || Number(values.annualIncome) <= 0) errors.annualIncome = 'Monthly or annual income must be greater than zero.';
    if (!values.loanType) errors.loanType = 'Business type is required.';
    if (!values.employerName?.trim()) errors.employerName = 'Business name is required.';
    if (!values.bankAccountNo?.trim()) errors.bankAccountNo = 'Bank account details are required.';
  }

  if (stepIndex === 4) {
    const documents = [values.documentPan, values.documentAadhaar, values.documentSalary, values.documentBank];
    if (documents.every((item) => !item || !item.trim())) {
      errors.documents = 'Upload at least one supporting document before continuing.';
    }
  }

  if (stepIndex === 5) {
    if (!values.bankName?.trim()) errors.bankName = 'Bank name is required.';
    if (!values.bankAccountNo?.trim()) errors.bankAccountNo = 'Account number is required.';
    if (!values.loanType) errors.loanType = 'Loan type is required.';
    if (!values.totalOutstanding || Number(values.totalOutstanding) <= 0) errors.totalOutstanding = 'Outstanding amount must be greater than zero.';
    if (!values.emi || Number(values.emi) <= 0) errors.emi = 'EMI amount must be greater than zero.';
    if (!values.loanExpiryDate) errors.loanExpiryDate = 'Expiry date is required.';
  }

  return errors;
};

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 19v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', inputMode, maxLength, children }) {
  return (
    <label className="loan-field">
      <span>{label}</span>
      {children || (
        <input
          type={type}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode || undefined}
          maxLength={maxLength}
        />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder = 'Select' }) {
  return (
    <label className="loan-field">
      <span>{label}</span>
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default function LoanApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [validationErrors, setValidationErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const stepErrors = { ...(prev[currentStep] || {}) };
      delete stepErrors[field];
      return { ...prev, [currentStep]: stepErrors };
    });
  };

  const activeStep = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;

  const goNext = () => {
    const errors = validateStep(currentStep, form);

    if (Object.keys(errors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, [currentStep]: errors }));
      return;
    }

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    alert('Application drafted successfully.');
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderTableRow = (rowValues, index) => (
    <tr key={index}>
      {rowValues.map((cell, cellIndex) => (
        <td key={`${index}-${cellIndex}`}>{cell || ' '}</td>
      ))}
    </tr>
  );

  const documentRows = [
    { label: 'PAN Card', field: 'documentPan' },
    { label: 'Aadhaar Card', field: 'documentAadhaar' },
    { label: 'Salary Slip', field: 'documentSalary' },
    { label: 'Bank Statement', field: 'documentBank' }
  ];

  const currentStepErrors = validationErrors[currentStep] || {};
  const hasStepErrors = Object.keys(currentStepErrors).length > 0;

  return (
    <AppShell title="Loan Application">
      <div className="loan-application-shell">
        <div className="loan-application-card">
          <div className="loan-application-header">
            <h1>{activeStep.title}</h1>
          </div>

          <div className="loan-stepper" aria-label="Application progress">
            {wizardSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <div key={step.id} className={`loan-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <span className="loan-step-bubble">{isDone ? '✓' : index + 1}</span>
                  <span className="loan-step-text">{step.label}</span>
                  <Icon size={14} className="loan-step-icon" />
                </div>
              );
            })}
          </div>

          {hasStepErrors && (
            <div className="loan-form-warning" role="alert">
              <strong>Please correct the following:</strong>
              <ul>
                {Object.values(currentStepErrors).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 0 && (
            <div className="loan-form-section">
              <h2>Applicant Details</h2>

              <div className="field-grid two-col">
                <Field label="First Name *" value={form.fullName} onChange={(value) => updateField('fullName', value)} placeholder="Enter First Name" />
                <Field label="Middle Name" value={form.middleName} onChange={(value) => updateField('middleName', value)} placeholder="Enter Middle Name" />
                <Field label="Last Name *" value={form.lastName} onChange={(value) => updateField('lastName', value)} placeholder="Enter Last Name" />
                <Field label="Date of Birth *" type="date" value={form.dob} onChange={(value) => updateField('dob', value)} />
              </div>

              <div className="field-grid gender-row">
                <label className="field-block compact">
                  <span>Gender *</span>
                  <div className="radio-group">
                    {['Male', 'Female', 'Other'].map((option) => (
                      <label key={option} className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === option}
                          onChange={(event) => updateField('gender', event.target.value)}
                          value={option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </label>
              </div>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Phone *</span>
                  <div className="input-prefix">
                    <span>+91</span>
                    <input
                      type="tel"
                      value={form.mobileNo}
                      onChange={(event) => updateField('mobileNo', event.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter Mobile Number"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </label>
                <Field label="Email *" type="email" value={form.email} onChange={(value) => updateField('email', value)} placeholder="Enter Email Address" />
              </div>

              <div className="field-grid two-col">
                <Field label="PAN Card *" value={form.panCard} onChange={(value) => updateField('panCard', normalizePan(value))} placeholder="ABCDE1234F" maxLength={10} />
                <Field label="Aadhaar Number *" value={form.aadhaarNumber} onChange={(value) => updateField('aadhaarNumber', value.replace(/\D/g, '').slice(0, 12))} placeholder="Enter Aadhaar Number" inputMode="numeric" maxLength={12} />
              </div>

              <div className="loan-form-section-inner">
                <h3>Address Details</h3>

                <div className="field-grid inline-choice">
                  <label className="field-block compact">
                    <span>Address as per Aadhaar *</span>
                    <div className="radio-group">
                      {['Yes', 'No'].map((option) => (
                        <label key={option} className="radio-option">
                          <input type="radio" name="aadhaarAddress" checked={form.aadhaarCard === option} onChange={(event) => updateField('aadhaarCard', event.target.value)} value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </label>
                </div>

                <div className="field-grid inline-choice">
                  <label className="field-block compact">
                    <span>Address Type *</span>
                    <div className="radio-group">
                      {['Current & Aadhaar', 'Permanent - Aadhaar', 'All same'].map((option) => (
                        <label key={option} className="radio-option">
                          <input type="radio" name="addressType" checked={form.residentialType === option} onChange={(event) => updateField('residentialType', event.target.value)} value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </label>
                </div>

                <div className="field-grid two-col">
                  <Field label="Current Address *" value={form.flatBuildingName} onChange={(value) => updateField('flatBuildingName', value)} placeholder="Enter Address" />
                  <Field label="Permanent Address" value={form.streetRoad} onChange={(value) => updateField('streetRoad', value)} placeholder="Enter Address" />
                </div>

                <div className="field-grid three-col">
                  <Field label="City *" value={form.city} onChange={(value) => updateField('city', value)} placeholder="Enter City" />
                  <SelectField label="State *" value={form.state} onChange={(value) => updateField('state', value)} options={['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat']} />
                  <Field label="Pincode *" value={form.pinCode} onChange={(value) => updateField('pinCode', value)} placeholder="Enter Pincode" inputMode="numeric" />
                </div>
              </div>

              <div className="loan-form-section-inner">
                <h3>Parent Information (Required)</h3>

                <div className="field-grid two-col">
                  <Field label="Father's Full Name *" value={form.fatherName} onChange={(value) => updateField('fatherName', value)} placeholder="Enter Father's Name" />
                  <Field label="Mother's Full Name *" value={form.motherName} onChange={(value) => updateField('motherName', value)} placeholder="Enter Mother's Name" />
                </div>

                <div className="field-grid marital-row">
                  <label className="field-block compact">
                    <span>Marital Status *</span>
                    <div className="radio-group">
                      {['Married', 'Unmarried'].map((option) => (
                        <label key={option} className="radio-option">
                          <input type="radio" name="maritalStatus" checked={form.maritalStatus === option} onChange={(event) => updateField('maritalStatus', event.target.value)} value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                      <label className="radio-option">
                        <input type="checkbox" readOnly />
                        <span>Add Co-Applicant (Optional)</span>
                      </label>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="loan-form-section">
              <h2>Address Details</h2>

              <div className="field-grid inline-choice">
                <label className="field-block compact">
                  <span>Address as per Aadhaar *</span>
                  <div className="radio-group">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="radio-option">
                        <input type="radio" name="aadhaarAddress" checked={form.aadhaarCard === option} onChange={(event) => updateField('aadhaarCard', event.target.value)} value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </label>
              </div>

              <div className="field-grid inline-choice">
                <label className="field-block compact">
                  <span>Address Type *</span>
                  <div className="radio-group">
                    {['Current & Aadhaar', 'Permanent - Aadhaar', 'All same'].map((option) => (
                      <label key={option} className="radio-option">
                        <input type="radio" name="addressType" checked={form.residentialType === option} onChange={(event) => updateField('residentialType', event.target.value)} value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </label>
              </div>

              <div className="field-grid two-col">
                <Field label="Current Address *" value={form.flatBuildingName} onChange={(value) => updateField('flatBuildingName', value)} placeholder="Enter Address" />
                <Field label="Permanent Address" value={form.streetRoad} onChange={(value) => updateField('streetRoad', value)} placeholder="Enter Address" />
              </div>

              <div className="field-grid three-col">
                <Field label="City *" value={form.city} onChange={(value) => updateField('city', value)} placeholder="Enter City" />
                <SelectField label="State *" value={form.state} onChange={(value) => updateField('state', value)} options={['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat']} />
                <Field label="Pincode *" value={form.pinCode} onChange={(value) => updateField('pinCode', value)} placeholder="Enter Pincode" inputMode="numeric" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="loan-form-section">
              <h2>Employment Information</h2>

              <div className="field-grid three-col">
                <Field label="Company Name *" value={form.employerName} onChange={(value) => updateField('employerName', value)} placeholder="Enter Company Name" />
                <SelectField label="Employment Type *" value={form.employmentType} onChange={(value) => updateField('employmentType', value)} options={['Full Time', 'Contract', 'Temporary']} />
                <Field label="Designation *" value={form.designation} onChange={(value) => updateField('designation', value)} placeholder="Enter Designation" />
              </div>

              <div className="field-grid three-col">
                <SelectField label="Total Work Experience *" value={form.occupation} onChange={(value) => updateField('occupation', value)} options={['1-2 years', '3-5 years', '5+ years']} />
                <SelectField label="Current Employer Experience *" value={form.qualification} onChange={(value) => updateField('qualification', value)} options={['1-2 years', '3-5 years', '5+ years']} />
                <Field label="Date of Joining *" type="date" value={form.dateOfJoining} onChange={(value) => updateField('dateOfJoining', value)} />
              </div>

              <div className="field-grid two-col">
                <SelectField label="Employment Verification Status *" value={form.customerType} onChange={(value) => updateField('customerType', value)} options={['Verified', 'Pending']} />
                <SelectField label="Salary Credit Frequency *" value={form.residentialStatus} onChange={(value) => updateField('residentialStatus', value)} options={['Monthly', 'Bi-monthly', 'Weekly']} />
              </div>

              <div className="field-grid two-col">
                <Field label="Salary Account / Bank Name *" value={form.bankName} onChange={(value) => updateField('bankName', value)} placeholder="Enter Bank Name" />
                <Field label="Bank Account Number *" value={form.bankAccountNo} onChange={(value) => updateField('bankAccountNo', value)} placeholder="Enter Account Number" inputMode="numeric" />
              </div>

              <div className="field-grid two-col">
                <Field label="Annual Income *" value={form.annualIncome} onChange={(value) => updateField('annualIncome', value)} placeholder="Enter Annual Income" inputMode="decimal" />
                <SelectField label="Risk Category *" value={form.riskCategory} onChange={(value) => updateField('riskCategory', value)} options={['Low', 'Medium', 'High']} />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="loan-form-section">
              <h2>Income Detail</h2>

              <div className="field-grid two-col">
                <Field label="Monthly Income *" value={form.annualIncome} onChange={(value) => updateField('annualIncome', value)} placeholder="Enter Monthly Income" inputMode="decimal" />
                <Field label="Annual Income *" value={form.annualIncome} onChange={(value) => updateField('annualIncome', value)} placeholder="Enter Annual Income" inputMode="decimal" />
              </div>

              <div className="field-grid inline-choice">
                <label className="field-block compact">
                  <span>Business Type *</span>
                  <div className="radio-group">
                    {['Salaried', 'Self Employed / Business'].map((option) => (
                      <label key={option} className="radio-option">
                        <input type="radio" name="businessType" checked={form.loanType === option} onChange={(event) => updateField('loanType', event.target.value)} value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </label>
              </div>

              <div className="loan-form-section-inner">
                <h3>Business Details</h3>
                <div className="field-grid two-col">
                  <Field label="Business Name *" value={form.employerName} onChange={(value) => updateField('employerName', value)} placeholder="Enter Business Name" />
                  <SelectField label="Business Type *" value={form.loanType} onChange={(value) => updateField('loanType', value)} options={['Sole Proprietorship', 'Partnership', 'Private Limited']} />
                </div>

                <div className="field-grid three-col">
                  <Field label="Business Registration No. *" value={form.bankAccountNo} onChange={(value) => updateField('bankAccountNo', value)} placeholder="Enter Registration No." inputMode="numeric" />
                  <Field label="CIBIL Score *" value={form.customerNumber} onChange={(value) => updateField('customerNumber', value)} placeholder="Enter CIBIL Score" inputMode="numeric" />
                  <SelectField label="Business Vintage *" value={form.residentialType} onChange={(value) => updateField('residentialType', value)} options={['1-2 years', '3-5 years', '5+ years']} />
                </div>

                <div className="field-grid two-col">
                  <Field label="Business Turnover *" value={form.totalOutstanding} onChange={(value) => updateField('totalOutstanding', value)} placeholder="Enter Turnover Amount" inputMode="decimal" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="loan-form-section">
              <h2>Document Details</h2>

              <div className="loan-data-table-wrap">
                <table className="loan-data-table">
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Document Name</th>
                      <th>Document Upload</th>
                      <th>Expiry Date</th>
                      <th>Remarks</th>
                      <th>View / Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentRows.map((row, index) => (
                      <tr key={row.field}>
                        <td>{index + 1}</td>
                        <td>{row.label}</td>
                        <td>
                          <label className="loan-file-input">
                            <UploadCloud size={15} />
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                updateField(row.field, file ? file.name : '');
                              }}
                            />
                            <span>{form[row.field] ? form[row.field] : 'Upload'}</span>
                          </label>
                        </td>
                        <td><input type="date" value={form.loanExpiryDate || ''} onChange={(event) => updateField('loanExpiryDate', event.target.value)} /></td>
                        <td><input type="text" value={form.riskCategory || ''} onChange={(event) => updateField('riskCategory', event.target.value)} placeholder="Add remark" /></td>
                        <td>
                          <div className="loan-table-actions">
                            <button type="button" className="loan-inline-button">View</button>
                            <button type="button" className="loan-inline-button danger">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="loan-form-section">
              <h2>Loan Details</h2>

              <div className="loan-data-table-wrap">
                <table className="loan-data-table">
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Bank Name</th>
                      <th>Account Number</th>
                      <th>Type of Loan</th>
                      <th>Total Outstanding</th>
                      <th>EMI</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((row) => renderTableRow([row, '', '', '', '', '', ''], row))}
                  </tbody>
                </table>
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
