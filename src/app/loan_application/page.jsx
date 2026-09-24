'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
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

export default function LoanApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);

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

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
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
                  <input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="Enter First Name" />
                </label>
                <label className="field-block">
                  <span>Middle Name</span>
                  <input value={form.middleName} onChange={(e) => updateField('middleName', e.target.value)} placeholder="Enter Middle Name" />
                </label>
                <label className="field-block">
                  <span>Last Name *</span>
                  <input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Enter Last Name" />
                </label>
                <label className="field-block">
                  <span>Date of Birth *</span>
                  <input type="date" value={form.dob} onChange={(e) => updateField('dob', e.target.value)} />
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
                </label>
              </div>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Phone *</span>
                  <div className="input-prefix">
                    <span>+91</span>
                    <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Enter Mobile Number" />
                  </div>
                </label>
                <label className="field-block">
                  <span>Email *</span>
                  <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Enter Email Address" />
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
                  </label>
                </div>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Current Address *</span>
                    <input value={form.currentAddress} onChange={(e) => updateField('currentAddress', e.target.value)} placeholder="Enter Address" />
                  </label>
                  <label className="field-block">
                    <span>Permanent Address</span>
                    <input value={form.permanentAddress} onChange={(e) => updateField('permanentAddress', e.target.value)} placeholder="Enter Address" />
                  </label>
                </div>

                <div className="field-grid three-col">
                  <label className="field-block">
                    <span>City *</span>
                    <input value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Enter City" />
                  </label>
                  <label className="field-block">
                    <span>State *</span>
                    <select value={form.state} onChange={(e) => updateField('state', e.target.value)}>
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                    </select>
                  </label>
                  <label className="field-block">
                    <span>Pincode *</span>
                    <input value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)} placeholder="Enter Pincode" />
                  </label>
                </div>
              </div>

              <div className="loan-form-section-inner">
                <h3>Parent Information (Required)</h3>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Father's Full Name *</span>
                    <input value={form.fatherName} onChange={(e) => updateField('fatherName', e.target.value)} placeholder="Enter Father's Name" />
                  </label>
                  <label className="field-block">
                    <span>Mother's Full Name *</span>
                    <input value={form.motherName} onChange={(e) => updateField('motherName', e.target.value)} placeholder="Enter Mother's Name" />
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
                  <input value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} placeholder="Enter Company Name" />
                </label>
                <label className="field-block">
                  <span>Employment Type *</span>
                  <select value={form.employmentType} onChange={(e) => updateField('employmentType', e.target.value)}>
                    <option value="">Select Employment Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </label>
                <label className="field-block">
                  <span>Designation *</span>
                  <input value={form.designation} onChange={(e) => updateField('designation', e.target.value)} placeholder="Enter Designation" />
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
                </label>
                <label className="field-block">
                  <span>Current Employer Experience *</span>
                  <select value={form.currentEmployerExperience} onChange={(e) => updateField('currentEmployerExperience', e.target.value)}>
                    <option value="">Select Experience</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </label>
                <label className="field-block">
                  <span>Date of Joining *</span>
                  <input type="date" value={form.dateOfJoining} onChange={(e) => updateField('dateOfJoining', e.target.value)} />
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
                </label>
                <label className="field-block">
                  <span>Salary Credit Frequency *</span>
                  <select value={form.salaryCreditFrequency} onChange={(e) => updateField('salaryCreditFrequency', e.target.value)}>
                    <option value="">Select Frequency</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-monthly">Bi-monthly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </label>
              </div>

              <div className="field-grid two-col">
                <label className="field-block">
                  <span>Salary Account / Bank Name *</span>
                  <input value={form.salaryBankName} onChange={(e) => updateField('salaryBankName', e.target.value)} placeholder="Enter Bank Name" />
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
                  <input value={form.monthlyIncome} onChange={(e) => updateField('monthlyIncome', e.target.value)} placeholder="Enter Monthly Income" />
                </label>
                <label className="field-block">
                  <span>Annual Income *</span>
                  <input value={form.annualIncome} onChange={(e) => updateField('annualIncome', e.target.value)} placeholder="Enter Annual Income" />
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
                </label>
              </div>

              <div className="loan-form-section-inner">
                <h3>Business Details</h3>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Business Name *</span>
                    <input value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} placeholder="Enter Business Name" />
                  </label>
                  <label className="field-block">
                    <span>Business Type *</span>
                    <select value={form.businessTypeValue} onChange={(e) => updateField('businessTypeValue', e.target.value)}>
                      <option value="">Select Business Type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited">Private Limited</option>
                    </select>
                  </label>
                </div>

                <div className="field-grid three-col">
                  <label className="field-block">
                    <span>Business Registration No. *</span>
                    <input value={form.businessRegistrationNo} onChange={(e) => updateField('businessRegistrationNo', e.target.value)} placeholder="Enter Registration No." />
                  </label>
                  <label className="field-block">
                    <span>CIBIL Score *</span>
                    <input value={form.cibilScore} onChange={(e) => updateField('cibilScore', e.target.value)} placeholder="Enter CIBIL Score" />
                  </label>
                  <label className="field-block">
                    <span>Business Vintage *</span>
                    <select value={form.businessVintage} onChange={(e) => updateField('businessVintage', e.target.value)}>
                      <option value="">Select Vintage</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </label>
                </div>

                <div className="field-grid two-col">
                  <label className="field-block">
                    <span>Business Turnover *</span>
                    <input value={form.businessTurnover} onChange={(e) => updateField('businessTurnover', e.target.value)} placeholder="Enter Turnover Amount" />
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
