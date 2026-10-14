'use client';

import { useRef, useState } from 'react';
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
  { id: 'personal', label: 'Personal Details', title: 'Personal Details', icon: UserIcon },
  { id: 'address', label: 'Address Details', title: 'Address Details', icon: Home },
  { id: 'employment', label: 'Employment', title: 'Employment', icon: Briefcase },
  { id: 'income', label: 'Income Details', title: 'Income Details', icon: Wallet },
  { id: 'documents', label: 'Documents', title: 'Documents', icon: FileText },
  { id: 'loan', label: 'Loan Details', title: 'Loan Details', icon: Landmark }
];

const documentRows = [
  { label: 'PAN Card', field: 'documentPan' },
  { label: 'Aadhaar Card', field: 'documentAadhaar' },
  { label: 'Salary Slip', field: 'documentSalary' },
  { label: 'Bank Statement', field: 'documentBank' }
];

const initialForm = {
  leadId: '',
  customerNumber: '',
  customerType: '',
  panCard: '',
  title: '',
  applicantOccupation: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  fatherHusbandName: '',
  age: '',
  motherName: '',
  email: '',
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
  previousEmployment: [],
  incomeTaxFiler: '',
  annualIncome: '',
  incomeTaxYears: [],
  documentDetails: {
    documentPan: { expiryDate: '', remarks: '' },
    documentAadhaar: { expiryDate: '', remarks: '' },
    documentSalary: { expiryDate: '', remarks: '' },
    documentBank: { expiryDate: '', remarks: '' }
  },
  incomeTaxFile: '',
  riskCategory: '',
  bankName: '',
  bankAccountNo: '',
  formNo16: '',
  salaryCertificate: '',
  loanHistory: [],
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
const NAME_REGEX = /^[\p{L}\s'-]+$/u;
const PIN_REGEX = /^\d{6}$/;
const MONEY_REGEX = /^\d+(?:\.\d{1,2})?$/;
const ACCOUNT_REGEX = /^\d{9,18}$/;
const ADDRESS_REGEX = /^[\p{L}\p{N}\s.,#/'()-]+$/u;
const CITY_REGEX = /^[\p{L}\s.'-]+$/u;
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const getIncomeTaxYears = () => {
  const today = new Date();
  const financialYearStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return [1, 2, 3].map((offset) => {
    const start = financialYearStart - offset;
    return { year: `${start}-${String(start + 1).slice(-2)}`, grossIncome: '', tdsPaid: '' };
  });
};

const createLoanHistoryRow = () => ({
  bankName: '',
  accountNumber: '',
  loanType: '',
  totalOutstanding: '',
  emi: '',
  expiryDate: ''
});
const previousEmploymentFields = [
  { id: 'employmentType', label: 'Employment Type' },
  { id: 'employerName', label: 'Employer Name' },
  { id: 'designation', label: 'Designation' },
  { id: 'location', label: 'Location' },
  { id: 'dateOfJoining', label: 'Date of Joining' },
  { id: 'dateOfRelieving', label: 'Date of Relieving' }
];

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

const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) return '';
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return Number.isNaN(age) || age < 0 ? '' : String(age);
};

const validateApplicantField = (field, values) => {
  const value = values[field] ?? '';
  const trimmed = value.trim();
  const nameFields = {
    firstName: 'First name',
    middleName: 'Middle name',
    lastName: 'Last name',
    fatherHusbandName: 'Father / Husband name',
    motherName: "Mother's name"
  };

  if (field === 'customerType' && !value) return 'Select a customer type.';
  if (field === 'panCard' && !PAN_REGEX.test(value)) return 'Enter a valid PAN in the format ABCDE1234F.';
  if (field === 'aadhaarNumber' && value && !AADHAAR_REGEX.test(value)) return 'Aadhaar number must contain 12 digits.';
  if (field === 'title' && !value) return 'Select a title.';
  if (nameFields[field]) {
    if (['firstName', 'lastName'].includes(field) && !trimmed) {
      return `${nameFields[field]} is required.`;
    }
    if (trimmed && !NAME_REGEX.test(trimmed)) return `${nameFields[field]} may contain letters, spaces, hyphens, and apostrophes only.`;
  }
  if (field === 'email' && !trimmed) return 'Email address is required.';
  if (field === 'email' && !EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
  if (field === 'dob') {
    if (!value) return 'Date of birth is required.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter a valid date of birth.';
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return 'Enter a valid date of birth.';
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (value > localToday) return 'Date of birth cannot be in the future.';
  }
  if (field === 'mobileNo' && !MOBILE_REGEX.test(value)) return 'Enter a valid 10-digit Indian mobile number.';
  if (field === 'alternateContact' && value && !MOBILE_REGEX.test(value)) return 'Enter a valid 10-digit Indian mobile number.';
  if (field === 'alternateContact' && value && value === values.mobileNo) return 'Alternate contact must differ from the primary mobile number.';
  if (field === 'gender' && !value) return 'Select a gender.';
  return '';
};

const validateAddressField = (field, values) => {
  if (field === 'residentialType' && !values.residentialType) return 'Select a residential type.';
  if (field === 'flatBuildingName' && !values.flatBuildingName.trim()) return 'Flat / Building Name is required.';
  if (field === 'flatBuildingName' && !ADDRESS_REGEX.test(values.flatBuildingName.trim())) return 'Enter a valid building name.';
  if (field === 'streetRoad' && values.streetRoad && !ADDRESS_REGEX.test(values.streetRoad.trim())) return 'Enter a valid street or road.';
  if (field === 'landMark' && values.landMark && !ADDRESS_REGEX.test(values.landMark.trim())) return 'Enter a valid landmark.';
  if (field === 'city' && !values.city.trim()) return 'City is required.';
  if (field === 'city' && !CITY_REGEX.test(values.city.trim())) return 'Enter a valid city name.';
  if (field === 'state' && !values.state) return 'Select a state.';
  if (field === 'pinCode' && !PIN_REGEX.test(values.pinCode)) return 'PIN Code must contain six digits.';
  return '';
};

const isValidDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const validateEmploymentField = (field, values) => {
  const value = values[field] ?? '';
  if (field === 'employerName' && value && !ADDRESS_REGEX.test(value.trim())) return 'Enter a valid employer name.';
  if (field === 'designation' && value && !ADDRESS_REGEX.test(value.trim())) return 'Enter a valid designation.';
  if ((field === 'dateOfJoining' || field === 'dateOfRetirement') && value && !isValidDate(value)) return 'Enter a valid date.';
  if ((field === 'dateOfJoining' || field === 'dateOfRetirement') && values.dateOfJoining && values.dateOfRetirement && isValidDate(values.dateOfJoining) && isValidDate(values.dateOfRetirement) && values.dateOfJoining > values.dateOfRetirement) {
    return 'Date of joining cannot be later than date of retirement.';
  }
  if (field === 'empEmailId' && value && !EMAIL_REGEX.test(value.trim())) return 'Enter a valid employee email address.';
  if (field === 'location' && value && !ADDRESS_REGEX.test(value.trim())) return 'Enter a valid location.';
  if (field === 'appointmentLetter' && value instanceof File) {
    const extension = value.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) return 'Upload a PDF, DOC, DOCX, JPG, or PNG file.';
    if (value.size > FILE_SIZE_LIMIT) return 'Appointment Letter must be 5 MB or smaller.';
  }
  return '';
};

const validateIncomeField = (field, values) => {
  const value = values[field] ?? '';
  if (field === 'incomeTaxFiler' && value && !['Yes', 'No'].includes(value)) return 'Select a valid option.';
  if (field === 'annualIncome' && value.trim() && !MONEY_REGEX.test(value.trim())) return 'Annual Income must be a valid non-negative amount.';
  if (field === 'bankName' && value.trim() && !ADDRESS_REGEX.test(value.trim())) return 'Enter a valid bank name.';
  if (field === 'bankAccountNo' && value.trim() && !ACCOUNT_REGEX.test(value)) return 'Enter a valid bank account number (9-18 digits).';
  if (['salaryCertificate', 'formNo16'].includes(field) && value instanceof File) {
    const extension = value.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) return 'Upload a PDF, DOC, DOCX, JPG, or PNG file.';
    if (value.size > FILE_SIZE_LIMIT) return 'File must be 5 MB or smaller.';
  }
  return '';
};

const validateDocumentFile = (file) => {
  if (!(file instanceof File)) return '';
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) return 'Upload a PDF, DOC, DOCX, JPG, or PNG file.';
  if (file.size > FILE_SIZE_LIMIT) return 'File must be 5 MB or smaller.';
  return '';
};

const validateLoanHistoryField = (field, value) => {
  if (!value) return '';
  if (field === 'bankName' && !ADDRESS_REGEX.test(value.trim())) return 'Enter a valid bank name.';
  if (field === 'accountNumber' && !ACCOUNT_REGEX.test(value)) return 'Enter 9-18 digits.';
  if (field === 'loanType' && !['Personal Loan', 'Home Loan', 'Business Loan', 'Vehicle Loan', 'Education Loan', 'Other'].includes(value)) return 'Select a valid loan type.';
  if (['totalOutstanding', 'emi'].includes(field) && !MONEY_REGEX.test(value)) return 'Enter a valid non-negative amount.';
  if (field === 'expiryDate' && !isValidDate(value)) return 'Enter a valid date.';
  return '';
};

const validateField = (stepIndex, field, values) => {
  if (stepIndex === 0) return validateApplicantField(field, values);
  if (stepIndex === 1) return validateAddressField(field, values);
  if (stepIndex === 2) return validateEmploymentField(field, values);
  if (stepIndex === 3) return validateIncomeField(field, values);
  return '';
};

const validateStep = (stepIndex, values) => {
  const errors = {};

  if (stepIndex === 0) {
    ['customerType', 'panCard', 'title', 'firstName', 'middleName', 'lastName', 'email', 'dob', 'aadhaarNumber', 'mobileNo', 'alternateContact', 'gender', 'fatherHusbandName', 'motherName'].forEach((field) => {
      const error = validateApplicantField(field, values);
      if (error) errors[field] = error;
    });
  }

  if (stepIndex === 1) {
    ['residentialType', 'flatBuildingName', 'streetRoad', 'landMark', 'city', 'state', 'pinCode'].forEach((field) => {
      const error = validateAddressField(field, values);
      if (error) errors[field] = error;
    });
  }

  if (stepIndex === 2) {
    ['employmentType', 'employerName', 'designation', 'dateOfJoining', 'dateOfRetirement', 'location', 'empEmailId', 'qualification', 'appointmentLetter'].forEach((field) => {
      const error = validateEmploymentField(field, values);
      if (error) errors[field] = error;
    });
    values.previousEmployment.forEach((employment, index) => {
      const populated = Object.values(employment).some(Boolean);
      if (!populated) return;
      if (employment.employmentType && !['Full Time', 'Contract', 'Temporary'].includes(employment.employmentType)) {
        errors[`previousEmployment-${index}-employmentType`] = 'Select a valid employment type.';
      }
      ['employerName', 'designation', 'location'].forEach((field) => {
        if (employment[field] && !ADDRESS_REGEX.test(employment[field].trim())) {
          errors[`previousEmployment-${index}-${field}`] = 'Enter valid text.';
        }
      });
      ['dateOfJoining', 'dateOfRelieving'].forEach((field) => {
        if (employment[field] && !isValidDate(employment[field])) {
          errors[`previousEmployment-${index}-${field}`] = 'Enter a valid date.';
        }
      });
      if (employment.dateOfJoining && employment.dateOfRelieving && isValidDate(employment.dateOfJoining) && isValidDate(employment.dateOfRelieving) && employment.dateOfJoining > employment.dateOfRelieving) {
        errors[`previousEmployment-${index}-dateOfRelieving`] = 'Relieving date cannot be earlier than joining date.';
      }
    });
  }

  if (stepIndex === 3) {
    ['incomeTaxFiler', 'annualIncome', 'riskCategory', 'bankName', 'bankAccountNo', 'salaryCertificate', 'formNo16'].forEach((field) => {
      const error = validateIncomeField(field, values);
      if (error) errors[field] = error;
    });
    values.incomeTaxYears.forEach((row, index) => {
      if (row.year && !/^\d{4}-\d{2}$/.test(row.year)) errors[`incomeTaxYear-${index}`] = 'Use YYYY-YY financial-year format.';
      ['grossIncome', 'tdsPaid'].forEach((field) => {
        if (row[field] && !MONEY_REGEX.test(row[field])) errors[`incomeTax-${index}-${field}`] = 'Enter a valid non-negative amount.';
      });
    });
  }

  if (stepIndex === 4) {
    documentRows.forEach((row) => {
      const fileError = validateDocumentFile(values[row.field]);
      if (fileError) errors[row.field] = fileError;
      const expiry = values.documentDetails[row.field]?.expiryDate || '';
      if (expiry && !isValidDate(expiry)) errors[`${row.field}-expiryDate`] = 'Enter a valid expiry date.';
      const remarks = values.documentDetails[row.field]?.remarks || '';
      if (remarks.length > 250) errors[`${row.field}-remarks`] = 'Remarks must be 250 characters or fewer.';
    });
  }

  if (stepIndex === 5) {
    values.loanHistory.forEach((row, index) => {
      Object.entries(row).forEach(([field, value]) => {
        const error = validateLoanHistoryField(field, value);
        if (error) errors[`loanHistory-${index}-${field}`] = error;
      });
    });
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

function Field({ label, value, onChange, placeholder, type = 'text', inputMode, maxLength, children, error, onBlur, disabled, required = false, readOnly = false, autoComplete, id }) {
  return (
    <label className={`loan-field${error ? ' has-error' : ''}`}>
      <span>{label}{required && <em className="loan-required"> *</em>}</span>
      {children || (
        <input
          type={type}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode || undefined}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          id={id}
          aria-describedby={error ? `${id || label.replace(/\W/g, '-')}-error` : undefined}
        />
      )}
      {error && <span id={`${id || label.replace(/\W/g, '-')}-error`} className="loan-field-error" role="alert">{error}</span>}
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder = 'Select', error, onBlur, required = false }) {
  const errorId = `${label.replace(/\W/g, '-')}-error`;
  return (
    <label className={`loan-field${error ? ' has-error' : ''}`}>
      <span>{label}{required && <em className="loan-required"> *</em>}</span>
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <span id={errorId} className="loan-field-error" role="alert">{error}</span>}
    </label>
  );
}

export default function LoanApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    incomeTaxYears: getIncomeTaxYears(),
    loanHistory: Array.from({ length: 4 }, createLoanHistoryRow)
  }));
  const [validationErrors, setValidationErrors] = useState({});
  const [verificationMessages, setVerificationMessages] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);

  const updateField = (field, value) => {
    const nextForm = { ...form, [field]: value };
    if (field === 'dob') nextForm.age = getAge(value);
    setForm(nextForm);
    // Validate while typing only when an error has already been shown.
    // This prevents red errors from appearing before the user leaves a field
    // or clicks Next, while still clearing/fixing errors immediately.
    setValidationErrors((prev) => {
      const existingErrors = prev[currentStep] || {};
      const stepErrors = { ...existingErrors };

      if (Object.prototype.hasOwnProperty.call(existingErrors, field)) {
        const error = validateField(currentStep, field, nextForm);
        if (error) stepErrors[field] = error;
        else delete stepErrors[field];
      }

      if (
        field === 'mobileNo' &&
        Object.prototype.hasOwnProperty.call(existingErrors, 'alternateContact')
      ) {
        const alternateError = validateApplicantField('alternateContact', nextForm);
        if (alternateError) stepErrors.alternateContact = alternateError;
        else delete stepErrors.alternateContact;
      }

      if (
        currentStep === 2 &&
        (field === 'dateOfJoining' || field === 'dateOfRetirement')
      ) {
        ['dateOfJoining', 'dateOfRetirement'].forEach((dateField) => {
          if (!Object.prototype.hasOwnProperty.call(existingErrors, dateField)) return;
          const dateError = validateEmploymentField(dateField, nextForm);
          if (dateError) stepErrors[dateField] = dateError;
          else delete stepErrors[dateField];
        });
      }

      return { ...prev, [currentStep]: stepErrors };
    });
    if (field === 'panCard' || field === 'aadhaarNumber') {
      setVerificationMessages((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'appointmentLetter' || field === 'salaryCertificate' || field === 'formNo16') {
      if (value instanceof File) {
        const error = currentStep === 2 ? validateEmploymentField(field, nextForm) : validateIncomeField(field, nextForm);
        setValidationErrors((prev) => ({
          ...prev,
          [currentStep]: { ...(prev[currentStep] || {}), ...(error ? { [field]: error } : {}) }
        }));
        if (!error) {
          setValidationErrors((prev) => {
            const errors = { ...(prev[currentStep] || {}) };
            delete errors[field];
            return { ...prev, [currentStep]: errors };
          });
        }
      }
    }
  };

  const handleFieldBlur = (field) => {
    const error = validateField(currentStep, field, form);
    const alternateError = currentStep === 0 && field === 'mobileNo' ? validateApplicantField('alternateContact', form) : undefined;
    const retirementError = currentStep === 2 && (field === 'dateOfJoining' || field === 'dateOfRetirement')
      ? validateEmploymentField(field === 'dateOfJoining' ? 'dateOfRetirement' : 'dateOfJoining', form)
      : undefined;
    setValidationErrors((prev) => ({
      ...prev,
      [currentStep]: (() => {
        const stepErrors = { ...(prev[currentStep] || {}) };
        if (error) stepErrors[field] = error;
        else delete stepErrors[field];
        if (alternateError) stepErrors.alternateContact = alternateError;
        else if (currentStep === 0 && field === 'mobileNo') delete stepErrors.alternateContact;
        const otherDateField = field === 'dateOfJoining' ? 'dateOfRetirement' : 'dateOfJoining';
        if (retirementError) stepErrors[otherDateField] = retirementError;
        else if (currentStep === 2 && (field === 'dateOfJoining' || field === 'dateOfRetirement')) delete stepErrors[otherDateField];
        return stepErrors;
      })()
    }));
  };

  const verifyDocument = (field, label) => {
    if (field === 'aadhaarNumber' && !form.aadhaarNumber) {
      setVerificationMessages((prev) => ({ ...prev, [field]: 'Enter an Aadhaar number before requesting verification.' }));
      return;
    }
    const error = validateApplicantField(field, form);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, 0: { ...(prev[0] || {}), [field]: error } }));
      setVerificationMessages((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    setVerificationMessages((prev) => ({
      ...prev,
      [field]: `${label} format is valid. Backend verification is not configured; connect an authorized verification provider to verify this document.`
    }));
  };

  const updateIncomeYear = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      incomeTaxYears: previous.incomeTaxYears.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row)
    }));
    const errorKey = `incomeTax-${index}-${field}`;
    const error = value && !MONEY_REGEX.test(value) ? 'Enter a valid non-negative amount.' : '';
    setValidationErrors((previous) => {
      const errors = { ...(previous[3] || {}) };
      if (error) errors[errorKey] = error;
      else delete errors[errorKey];
      return { ...previous, 3: errors };
    });
  };

  const updateDocumentDetail = (rowField, field, value) => {
    const errorKey = `${rowField}-${field}`;
    const error = field === 'expiryDate' && value && !isValidDate(value)
      ? 'Enter a valid expiry date.'
      : field === 'remarks' && value.length > 250
        ? 'Remarks must be 250 characters or fewer.'
        : '';
    setForm((previous) => ({
      ...previous,
      documentDetails: {
        ...previous.documentDetails,
        [rowField]: { ...previous.documentDetails[rowField], [field]: value }
      }
    }));
    setValidationErrors((previous) => {
      const errors = { ...(previous[4] || {}) };
      if (error) errors[errorKey] = error;
      else delete errors[errorKey];
      return { ...previous, 4: errors };
    });
  };

  const updateDocumentFile = (rowField, file) => {
    updateField(rowField, file || '');
    const error = file ? validateDocumentFile(file) : '';
    setValidationErrors((previous) => {
      const errors = { ...(previous[4] || {}) };
      if (error) errors[rowField] = error;
      else delete errors[rowField];
      return { ...previous, 4: errors };
    });
  };

  const updateLoanHistory = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      loanHistory: previous.loanHistory.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row)
    }));
    const errorKey = `loanHistory-${index}-${field}`;
    const error = validateLoanHistoryField(field, value);
    setValidationErrors((previous) => {
      const errors = { ...(previous[5] || {}) };
      if (error) errors[errorKey] = error;
      else delete errors[errorKey];
      return { ...previous, 5: errors };
    });
  };

  const activeStep = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;

  const goNext = () => {
    if (isSubmitting) return;
    const errors = validateStep(currentStep, form);

    if (Object.keys(errors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, [currentStep]: errors }));
      return;
    }

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (submitLock.current) return;
    const allErrors = wizardSteps.map((_, index) => validateStep(index, form));
    const firstInvalidStep = allErrors.findIndex((stepErrors) => Object.keys(stepErrors).length > 0);
    if (firstInvalidStep >= 0) {
      setValidationErrors((prev) => ({
        ...prev,
        ...Object.fromEntries(allErrors.map((stepErrors, index) => [index, stepErrors]))
      }));
      setCurrentStep(firstInvalidStep);
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    try {
      setSubmissionMessage('No application submission service is configured. Your information has not been submitted.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const cancelOnboarding = () => {
    if (window.confirm('Cancel this onboarding and return to the dashboard?')) {
      window.location.assign('/dashboard');
    }
  };

  const currentStepErrors = validationErrors[currentStep] || {};

  return (
    <AppShell title="Loan Application">
      <div className="loan-application-shell">
        <div className="loan-application-card">
          <div className="loan-application-header">
            <h1>{activeStep.title}</h1>
            <p className="loan-form-guidance">Complete the fields for this step. Required fields are marked with <span>*</span>.</p>
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

          {currentStep === 0 && (
            <div className="loan-form-section">
              <h2>Applicant Details</h2>

              {/* Row 1: Lead ID, Customer Number, Customer Type */}
              <div className="field-grid three-col loan-personal-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <Field label="Lead ID" value={form.leadId} onChange={(value) => updateField('leadId', value)} placeholder="Enter Lead ID" />
                <Field label="Customer Number" value={form.customerNumber} onChange={(value) => updateField('customerNumber', value)} placeholder="Enter Customer Number" />
                <SelectField label="Customer Type" value={form.customerType} onChange={(value) => updateField('customerType', value)} onBlur={() => handleFieldBlur('customerType')} error={currentStepErrors.customerType} options={['Individual', 'Non-Individual']} required />
              </div>

              {/* Row 2: Title and name fields */}
              <div className="field-grid four-col loan-name-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                <SelectField label="Title" value={form.title} onChange={(value) => updateField('title', value)} onBlur={() => handleFieldBlur('title')} error={currentStepErrors.title} options={['Mr.', 'Mrs.', 'Ms.', 'Dr.']} required />
                <Field label="First Name" value={form.firstName} onChange={(value) => updateField('firstName', value)} onBlur={() => handleFieldBlur('firstName')} error={currentStepErrors.firstName} placeholder="Enter First Name" required autoComplete="given-name" />
                <Field label="Middle Name" value={form.middleName} onChange={(value) => updateField('middleName', value)} onBlur={() => handleFieldBlur('middleName')} error={currentStepErrors.middleName} placeholder="Enter Middle Name" autoComplete="additional-name" />
                <Field label="Last Name" value={form.lastName} onChange={(value) => updateField('lastName', value)} onBlur={() => handleFieldBlur('lastName')} error={currentStepErrors.lastName} placeholder="Enter Last Name" required autoComplete="family-name" />
              </div>

              {/* Row 3: PAN Card and Aadhaar Card Number */}
              <div className="field-grid two-col loan-personal-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div className={`loan-field${currentStepErrors.panCard ? ' has-error' : ''}`}>
                  <label htmlFor="applicant-pan">PAN Card<em className="loan-required"> *</em></label>
                  <div className="loan-verify-control">
                    <input id="applicant-pan" type="text" value={form.panCard} onChange={(event) => updateField('panCard', normalizePan(event.target.value))} onBlur={() => handleFieldBlur('panCard')} placeholder="ABCDE1234F" maxLength={10} autoComplete="off" aria-invalid={Boolean(currentStepErrors.panCard)} aria-describedby={currentStepErrors.panCard ? 'applicant-pan-error' : verificationMessages.panCard ? 'applicant-pan-status' : undefined} />
                    <button type="button" className="loan-verify-button" onClick={() => verifyDocument('panCard', 'PAN')}>Verify</button>
                  </div>
                  {currentStepErrors.panCard && <span id="applicant-pan-error" className="loan-field-error" role="alert">{currentStepErrors.panCard}</span>}
                  {verificationMessages.panCard && <span id="applicant-pan-status" className="loan-verification-message" role="status">{verificationMessages.panCard}</span>}
                </div>
                <div className={`loan-field${currentStepErrors.aadhaarNumber ? ' has-error' : ''}`}>
                  <label htmlFor="applicant-aadhaar">Aadhaar Card Number</label>
                  <div className="loan-verify-control">
                    <input id="applicant-aadhaar" type="text" value={form.aadhaarNumber} onChange={(event) => updateField('aadhaarNumber', event.target.value.replace(/\D/g, '').slice(0, 12))} onBlur={() => handleFieldBlur('aadhaarNumber')} placeholder="Enter 12-digit Aadhaar Number" inputMode="numeric" maxLength={12} autoComplete="off" aria-invalid={Boolean(currentStepErrors.aadhaarNumber)} aria-describedby={currentStepErrors.aadhaarNumber ? 'applicant-aadhaar-error' : verificationMessages.aadhaarNumber ? 'applicant-aadhaar-status' : undefined} />
                    <button type="button" className="loan-verify-button" onClick={() => verifyDocument('aadhaarNumber', 'Aadhaar')}>Verify</button>
                  </div>
                  {currentStepErrors.aadhaarNumber && <span id="applicant-aadhaar-error" className="loan-field-error" role="alert">{currentStepErrors.aadhaarNumber}</span>}
                  {verificationMessages.aadhaarNumber && <span id="applicant-aadhaar-status" className="loan-verification-message" role="status">{verificationMessages.aadhaarNumber}</span>}
                </div>
              </div>

              {/* Row 4: Email ID, Date of Birth, Age */}
              <div className="field-grid three-col loan-personal-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <Field label="Email ID" type="email" value={form.email} onChange={(value) => updateField('email', value)} onBlur={() => handleFieldBlur('email')} error={currentStepErrors.email} placeholder="name@example.com" required autoComplete="email" />
                <Field label="Date of Birth" type="date" value={form.dob} onChange={(value) => updateField('dob', value)} onBlur={() => handleFieldBlur('dob')} error={currentStepErrors.dob} required autoComplete="bday" />
                <Field label="Age" value={form.age} placeholder="Calculated from date of birth" readOnly />
              </div>

              {/* Row 5: CKYC, Mobile Number, Alternate Contact Number */}
              <div className="field-grid three-col loan-personal-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <Field label="CKYC Registration Number" value={form.kycRegn} onChange={(value) => updateField('kycRegn', value)} placeholder="Enter CKYC Registration Number" />
                <Field label="Mobile Number" value={form.mobileNo} onChange={(value) => updateField('mobileNo', value.replace(/\D/g, '').slice(0, 10))} onBlur={() => handleFieldBlur('mobileNo')} error={currentStepErrors.mobileNo} placeholder="10-digit mobile number" type="tel" inputMode="numeric" maxLength={10} required autoComplete="tel-national" />
                <Field label="Alternate Contact Number" value={form.alternateContact} onChange={(value) => updateField('alternateContact', value.replace(/\D/g, '').slice(0, 10))} onBlur={() => handleFieldBlur('alternateContact')} error={currentStepErrors.alternateContact} placeholder="Optional 10-digit number" type="tel" inputMode="numeric" maxLength={10} />
              </div>

              {/* Row 6: Occupation, Gender, Marital Status */}
              <div className="field-grid three-col loan-personal-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <Field label="Occupation" value={form.applicantOccupation} onChange={(value) => updateField('applicantOccupation', value)} placeholder="Enter Occupation" />
                <SelectField label="Gender" value={form.gender} onChange={(value) => updateField('gender', value)} onBlur={() => handleFieldBlur('gender')} error={currentStepErrors.gender} options={['Male', 'Female', 'Other']} required />
                <SelectField label="Marital Status" value={form.maritalStatus} onChange={(value) => updateField('maritalStatus', value)} options={['Single', 'Married', 'Divorced', 'Widowed']} />
              </div>

              {/* Row 7: Father / Husband Name and Mother's Name */}
              <div className="field-grid two-col loan-personal-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <Field label="Father / Husband Name" value={form.fatherHusbandName} onChange={(value) => updateField('fatherHusbandName', value)} onBlur={() => handleFieldBlur('fatherHusbandName')} error={currentStepErrors.fatherHusbandName} placeholder="Enter Father / Husband Name" />
                <Field label="Mother's Name" value={form.motherName} onChange={(value) => updateField('motherName', value)} onBlur={() => handleFieldBlur('motherName')} error={currentStepErrors.motherName} placeholder="Enter Mother's Name" />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="loan-form-section">
              <h2>Address Details</h2>

              <div className="field-grid inline-choice">
                <label className="field-block compact">
                  <span>Residential Type <em className="loan-required">*</em></span>
                  <div className="radio-group">
                    {['Current & Aadhaar', 'Permanent - Aadhaar', 'All same'].map((option) => (
                      <label key={option} className="radio-option">
                        <input type="radio" name="residentialType" checked={form.residentialType === option} onChange={(event) => updateField('residentialType', event.target.value)} onBlur={() => handleFieldBlur('residentialType')} value={option} aria-invalid={Boolean(currentStepErrors.residentialType)} aria-describedby={currentStepErrors.residentialType ? 'residential-type-error' : undefined} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {currentStepErrors.residentialType && <span id="residential-type-error" className="loan-field-error" role="alert">{currentStepErrors.residentialType}</span>}
                </label>
              </div>

              <div className="field-grid two-col loan-address-two">
                <SelectField label="Residential Status" value={form.residentialStatus} onChange={(value) => updateField('residentialStatus', value)} options={['Resident', 'Non-Resident']} />
                <Field label="Flat / Building Name" value={form.flatBuildingName} onChange={(value) => updateField('flatBuildingName', value)} onBlur={() => handleFieldBlur('flatBuildingName')} error={currentStepErrors.flatBuildingName} placeholder="Enter Flat / Building Name" required />
              </div>

              <div className="field-grid two-col loan-address-two">
                <Field label="Street / Road" value={form.streetRoad} onChange={(value) => updateField('streetRoad', value)} onBlur={() => handleFieldBlur('streetRoad')} error={currentStepErrors.streetRoad} placeholder="Enter Street / Road" />
                <Field label="Landmark" value={form.landMark} onChange={(value) => updateField('landMark', value)} onBlur={() => handleFieldBlur('landMark')} error={currentStepErrors.landMark} placeholder="Enter Landmark" />
              </div>

              <div className="field-grid three-col loan-address-three">
                <Field label="City" value={form.city} onChange={(value) => updateField('city', value)} onBlur={() => handleFieldBlur('city')} error={currentStepErrors.city} placeholder="Enter City" required />
                <SelectField label="State" value={form.state} onChange={(value) => updateField('state', value)} onBlur={() => handleFieldBlur('state')} error={currentStepErrors.state} options={['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat']} required />
                <Field label="PIN Code" value={form.pinCode} onChange={(value) => updateField('pinCode', value.replace(/\D/g, '').slice(0, 6))} onBlur={() => handleFieldBlur('pinCode')} error={currentStepErrors.pinCode} placeholder="Enter 6-digit PIN Code" inputMode="numeric" maxLength={6} required />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="loan-form-section">
              <h2>Employment Info</h2>

              <div className="field-grid three-col loan-employment-three">
                <SelectField label="Employment Type" value={form.employmentType} onChange={(value) => updateField('employmentType', value)} onBlur={() => handleFieldBlur('employmentType')} error={currentStepErrors.employmentType} options={['Full Time', 'Contract', 'Temporary']} />
                <Field label="Employer Name" value={form.employerName} onChange={(value) => updateField('employerName', value)} onBlur={() => handleFieldBlur('employerName')} error={currentStepErrors.employerName} placeholder="Enter Employer Name" />
                <Field label="Designation" value={form.designation} onChange={(value) => updateField('designation', value)} onBlur={() => handleFieldBlur('designation')} error={currentStepErrors.designation} placeholder="Enter Designation" />
              </div>

              <div className="field-grid three-col loan-employment-three">
                <Field label="Date of Joining" type="date" value={form.dateOfJoining} onChange={(value) => updateField('dateOfJoining', value)} onBlur={() => handleFieldBlur('dateOfJoining')} error={currentStepErrors.dateOfJoining} />
                <Field label="Date of Retirement" type="date" value={form.dateOfRetirement} onChange={(value) => updateField('dateOfRetirement', value)} onBlur={() => handleFieldBlur('dateOfRetirement')} error={currentStepErrors.dateOfRetirement} />
                <Field label="Location" value={form.location} onChange={(value) => updateField('location', value)} onBlur={() => handleFieldBlur('location')} error={currentStepErrors.location} placeholder="Enter Location" />
              </div>

              <div className="field-grid two-col loan-employment-two">
                <Field label="Emp. Email ID" type="email" value={form.empEmailId} onChange={(value) => updateField('empEmailId', value)} onBlur={() => handleFieldBlur('empEmailId')} error={currentStepErrors.empEmailId} placeholder="name@employer.com" autoComplete="email" />
                <Field label="Qualification" value={form.qualification} onChange={(value) => updateField('qualification', value)} onBlur={() => handleFieldBlur('qualification')} error={currentStepErrors.qualification} placeholder="Enter Qualification" />
              </div>

              <div className="field-grid one-col loan-employment-upload">
                <div className={`loan-field${currentStepErrors.appointmentLetter ? ' has-error' : ''}`}>
                  <label htmlFor="appointment-letter">Appointment Letter</label>
                  <label htmlFor="appointment-letter" className="loan-file-input loan-appointment-file-input">
                    <UploadCloud size={15} />
                    <span>{form.appointmentLetter?.name || 'Browse for Appointment Letter'}</span>
                    <input
                      id="appointment-letter"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) => updateField('appointmentLetter', event.target.files?.[0] || '')}
                      onBlur={() => handleFieldBlur('appointmentLetter')}
                      aria-describedby={currentStepErrors.appointmentLetter ? 'appointment-letter-error' : undefined}
                    />
                  </label>
                  {currentStepErrors.appointmentLetter && <span id="appointment-letter-error" className="loan-field-error" role="alert">{currentStepErrors.appointmentLetter}</span>}
                  <span className="loan-upload-hint">PDF, DOC, DOCX, JPG, or PNG; up to 5 MB.</span>
                </div>
              </div>

              <section className="loan-previous-employment">
                <div className="loan-previous-employment-heading">
                  <h3>Details of Previous Employment</h3>
                  <button type="button" className="loan-inline-button" onClick={() => setForm((previous) => ({
                    ...previous,
                    previousEmployment: [...previous.previousEmployment, {
                      employmentType: '',
                      employerName: '',
                      designation: '',
                      location: '',
                      dateOfJoining: '',
                      dateOfRelieving: ''
                    }]
                  }))}>Add Employment</button>
                </div>
                <div className="loan-data-table-wrap">
                  <table className="loan-data-table loan-previous-employment-table">
                    <thead>
                      <tr>
                        <th>Employment Type</th>
                        <th>Employer Name</th>
                        <th>Designation</th>
                        <th>Location</th>
                        <th>Date of Joining</th>
                        <th>Date of Relieving</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.previousEmployment.length === 0 ? (
                        <tr><td colSpan={6} className="loan-empty-employment">No previous employment details added.</td></tr>
                      ) : form.previousEmployment.map((employment, index) => (
                        <tr key={index}>
                          {previousEmploymentFields.map(({ id: field, label }) => (
                            <td key={field}>
                              {field === 'employmentType' ? (
                                <select
                                  aria-label={`${label} for previous employment ${index + 1}`}
                                  value={employment[field]}
                                  aria-invalid={Boolean(currentStepErrors[`previousEmployment-${index}-${field}`])}
                                  aria-describedby={currentStepErrors[`previousEmployment-${index}-${field}`] ? `previous-employment-${index}-${field}-error` : undefined}
                                  onChange={(event) => setForm((previous) => ({
                                    ...previous,
                                    previousEmployment: previous.previousEmployment.map((item, rowIndex) => rowIndex === index ? { ...item, [field]: event.target.value } : item)
                                  }))}
                                  onBlur={(event) => {
                                    const value = event.target.value;
                                    const fieldError = value && !['Full Time', 'Contract', 'Temporary'].includes(value) ? 'Select a valid employment type.' : '';
                                    setValidationErrors((previous) => {
                                      const errors = { ...(previous[2] || {}) };
                                      const errorKey = `previousEmployment-${index}-${field}`;
                                      if (fieldError) errors[errorKey] = fieldError;
                                      else delete errors[errorKey];
                                      return { ...previous, 2: errors };
                                    });
                                  }}
                                >
                                  <option value="">Select</option>
                                  {['Full Time', 'Contract', 'Temporary'].map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                              ) : (
                                <input
                                  aria-label={`${label} for previous employment ${index + 1}`}
                                  type={field === 'dateOfJoining' || field === 'dateOfRelieving' ? 'date' : 'text'}
                                  value={employment[field]}
                                  aria-invalid={Boolean(currentStepErrors[`previousEmployment-${index}-${field}`])}
                                  aria-describedby={currentStepErrors[`previousEmployment-${index}-${field}`] ? `previous-employment-${index}-${field}-error` : undefined}
                                  onChange={(event) => setForm((previous) => ({
                                    ...previous,
                                    previousEmployment: previous.previousEmployment.map((item, rowIndex) => rowIndex === index ? { ...item, [field]: event.target.value } : item)
                                  }))}
                                  onBlur={(event) => {
                                    const value = event.target.value;
                                    const fieldError = field.startsWith('date')
                                      ? value && !isValidDate(value) ? 'Enter a valid date.' : ''
                                      : value && !ADDRESS_REGEX.test(value.trim()) ? 'Enter valid text.' : '';
                                    const joiningDate = field === 'dateOfJoining' ? value : employment.dateOfJoining;
                                    const relievingDate = field === 'dateOfRelieving' ? value : employment.dateOfRelieving;
                                    const relievingDateError = joiningDate && relievingDate && isValidDate(joiningDate) && isValidDate(relievingDate) && joiningDate > relievingDate
                                      ? 'Relieving date cannot be earlier than joining date.'
                                      : '';
                                    setValidationErrors((previous) => {
                                      const errors = { ...(previous[2] || {}) };
                                      const errorKey = `previousEmployment-${index}-${field}`;
                                      if (fieldError) errors[errorKey] = fieldError;
                                      else delete errors[errorKey];
                                      const relievingErrorKey = `previousEmployment-${index}-dateOfRelieving`;
                                      if (relievingDateError) errors[relievingErrorKey] = relievingDateError;
                                      else delete errors[relievingErrorKey];
                                      return { ...previous, 2: errors };
                                    });
                                  }}
                                />
                              )}
                              {currentStepErrors[`previousEmployment-${index}-${field}`] && <span id={`previous-employment-${index}-${field}-error`} className="loan-field-error" role="alert">{currentStepErrors[`previousEmployment-${index}-${field}`]}</span>}
                              {field === 'dateOfRelieving' && <button type="button" className="loan-inline-button danger loan-previous-remove" onClick={() => setForm((previous) => ({ ...previous, previousEmployment: previous.previousEmployment.filter((_, rowIndex) => rowIndex !== index) }))}>Remove</button>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {currentStep === 3 && (
            <div className="loan-form-section">
              <h2>Income Details</h2>

              <div className="field-grid three-col loan-income-grid">
                <SelectField label="Income Tax Filer" value={form.incomeTaxFiler} onChange={(value) => updateField('incomeTaxFiler', value)} onBlur={() => handleFieldBlur('incomeTaxFiler')} error={currentStepErrors.incomeTaxFiler} options={['Yes', 'No']} />
                <Field label="Annual Income" value={form.annualIncome} onChange={(value) => updateField('annualIncome', value)} onBlur={() => handleFieldBlur('annualIncome')} error={currentStepErrors.annualIncome} placeholder="Enter Annual Income" inputMode="decimal" />
                <SelectField label="Risk Category" value={form.riskCategory} onChange={(value) => updateField('riskCategory', value)} onBlur={() => handleFieldBlur('riskCategory')} error={currentStepErrors.riskCategory} options={['Low', 'Medium', 'High']} />
                <Field label="Name of the Bank" value={form.bankName} onChange={(value) => updateField('bankName', value)} onBlur={() => handleFieldBlur('bankName')} error={currentStepErrors.bankName} placeholder="Enter Bank Name" />
                <Field label="Bank Account No" value={form.bankAccountNo} onChange={(value) => updateField('bankAccountNo', value)} onBlur={() => handleFieldBlur('bankAccountNo')} error={currentStepErrors.bankAccountNo} placeholder="Enter Bank Account Number" inputMode="numeric" />
              </div>

              <section className="loan-form-section-inner">
                <h3>Income Tax Details</h3>
                <div className="loan-data-table-wrap">
                  <table className="loan-data-table loan-income-table">
                    <thead>
                      <tr>
                        <th>Financial Year</th>
                        <th>Gross Income</th>
                        <th>TDS Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.incomeTaxYears.map((row, index) => (
                        <tr key={row.year}>
                          <td>{row.year}</td>
                          {['grossIncome', 'tdsPaid'].map((field) => {
                            const errorKey = `incomeTax-${index}-${field}`;
                            return (
                              <td key={field}>
                                <input
                                  aria-label={`${field === 'grossIncome' ? 'Gross Income' : 'TDS Paid'} for ${row.year}`}
                                  value={row[field]}
                                  inputMode="decimal"
                                  onChange={(event) => updateIncomeYear(index, field, event.target.value)}
                                  aria-invalid={Boolean(currentStepErrors[errorKey])}
                                  aria-describedby={currentStepErrors[errorKey] ? `${errorKey}-error` : undefined}
                                />
                                {currentStepErrors[errorKey] && <span id={`${errorKey}-error`} className="loan-field-error" role="alert">{currentStepErrors[errorKey]}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="field-grid two-col loan-income-files">
                {[
                  { field: 'formNo16', label: 'Form No 16' },
                  { field: 'salaryCertificate', label: 'Salary Certificate' }
                ].map(({ field, label }) => (
                  <div className={`loan-field${currentStepErrors[field] ? ' has-error' : ''}`} key={field}>
                    <label htmlFor={field}>{label}</label>
                    <label htmlFor={field} className="loan-file-input loan-appointment-file-input">
                      <UploadCloud size={15} />
                      <span>{form[field]?.name || `Browse for ${label}`}</span>
                      <input
                        id={field}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(event) => updateField(field, event.target.files?.[0] || '')}
                        onBlur={() => handleFieldBlur(field)}
                        aria-describedby={currentStepErrors[field] ? `${field}-error` : undefined}
                      />
                    </label>
                    {currentStepErrors[field] && <span id={`${field}-error`} className="loan-field-error" role="alert">{currentStepErrors[field]}</span>}
                    <span className="loan-upload-hint">PDF, DOC, DOCX, JPG, or PNG; up to 5 MB.</span>
                  </div>
                ))}
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
                          <label className={`loan-file-input${currentStepErrors[row.field] ? ' has-error' : ''}`}>
                            <UploadCloud size={15} />
                            <input
                              id={`${row.field}-upload`}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                updateDocumentFile(row.field, file || '');
                                event.target.value = '';
                              }}
                              aria-invalid={Boolean(currentStepErrors[row.field])}
                              aria-describedby={currentStepErrors[row.field] ? `${row.field}-error` : undefined}
                            />
                            <span>{form[row.field]?.name || 'Upload'}</span>
                          </label>
                          {currentStepErrors[row.field] && <span id={`${row.field}-error`} className="loan-field-error" role="alert">{currentStepErrors[row.field]}</span>}
                        </td>
                        <td>
                          <input
                            aria-label={`${row.label} expiry date`}
                            type="date"
                            value={form.documentDetails[row.field]?.expiryDate || ''}
                            onChange={(event) => updateDocumentDetail(row.field, 'expiryDate', event.target.value)}
                            aria-invalid={Boolean(currentStepErrors[`${row.field}-expiryDate`])}
                            aria-describedby={currentStepErrors[`${row.field}-expiryDate`] ? `${row.field}-expiry-error` : undefined}
                          />
                          {currentStepErrors[`${row.field}-expiryDate`] && <span id={`${row.field}-expiry-error`} className="loan-field-error" role="alert">{currentStepErrors[`${row.field}-expiryDate`]}</span>}
                        </td>
                        <td>
                          <input
                            aria-label={`${row.label} remarks`}
                            type="text"
                            value={form.documentDetails[row.field]?.remarks || ''}
                            onChange={(event) => updateDocumentDetail(row.field, 'remarks', event.target.value)}
                            maxLength={250}
                            placeholder="Add remark"
                            aria-invalid={Boolean(currentStepErrors[`${row.field}-remarks`])}
                            aria-describedby={currentStepErrors[`${row.field}-remarks`] ? `${row.field}-remarks-error` : undefined}
                          />
                          {currentStepErrors[`${row.field}-remarks`] && <span id={`${row.field}-remarks-error`} className="loan-field-error" role="alert">{currentStepErrors[`${row.field}-remarks`]}</span>}
                        </td>
                        <td>
                          <div className="loan-table-actions">
                            <button
                              type="button"
                              className="loan-inline-button"
                              disabled={!form[row.field]}
                              onClick={() => {
                                const file = form[row.field];
                                if (!(file instanceof File)) return;
                                const fileUrl = URL.createObjectURL(file);
                                window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
                              }}
                            >View</button>
                            <button type="button" className="loan-inline-button danger" disabled={!form[row.field]} onClick={() => updateDocumentFile(row.field, '')}>Delete</button>
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
                    {form.loanHistory.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>{rowIndex + 1}</td>
                        {[
                          { field: 'bankName', label: 'Bank Name', type: 'text' },
                          { field: 'accountNumber', label: 'Account Number', type: 'text' },
                          { field: 'loanType', label: 'Type of Loan', type: 'select' },
                          { field: 'totalOutstanding', label: 'Total Outstanding', type: 'text' },
                          { field: 'emi', label: 'EMI', type: 'text' },
                          { field: 'expiryDate', label: 'Expiry Date', type: 'date' }
                        ].map(({ field, label, type }) => {
                          const errorKey = `loanHistory-${rowIndex}-${field}`;
                          return (
                            <td key={field}>
                              {type === 'select' ? (
                                <select
                                  aria-label={`${label} for loan ${rowIndex + 1}`}
                                  value={row[field]}
                                  onChange={(event) => updateLoanHistory(rowIndex, field, event.target.value)}
                                  aria-invalid={Boolean(currentStepErrors[errorKey])}
                                  aria-describedby={currentStepErrors[errorKey] ? `${errorKey}-error` : undefined}
                                >
                                  <option value="">Select</option>
                                  {['Personal Loan', 'Home Loan', 'Business Loan', 'Vehicle Loan', 'Education Loan', 'Other'].map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                              ) : (
                                <input
                                  aria-label={`${label} for loan ${rowIndex + 1}`}
                                  type={type}
                                  value={row[field]}
                                  inputMode={['totalOutstanding', 'emi'].includes(field) ? 'decimal' : undefined}
                                  onChange={(event) => updateLoanHistory(rowIndex, field, event.target.value)}
                                  aria-invalid={Boolean(currentStepErrors[errorKey])}
                                  aria-describedby={currentStepErrors[errorKey] ? `${errorKey}-error` : undefined}
                                />
                              )}
                              {currentStepErrors[errorKey] && <span id={`${errorKey}-error`} className="loan-field-error" role="alert">{currentStepErrors[errorKey]}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="loan-form-actions">
            <button type="button" className="loan-back-button" onClick={goBack} disabled={currentStep === 0}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button type="button" className="loan-back-button loan-cancel-button" onClick={cancelOnboarding}>Cancel</button>
            <button type="button" className="loan-continue-button" onClick={goNext} disabled={isSubmitting}>
              {isLastStep ? 'Submit' : 'Next'} <ArrowRight size={16} />
            </button>
          </div>
          {submissionMessage && <p className="loan-submission-message" role="status">{submissionMessage}</p>}
        </div>
      </div>
    </AppShell>
  );
}
