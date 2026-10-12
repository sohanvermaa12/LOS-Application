'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Save,
  Shield,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import PageHeader from './PageHeader';
import { saveEmployee, isEmpIdUnique, isUsernameUnique } from '../services/employeeService';
import {
  filterUserInput,
  getMaxDateFor18YearsOld,
  calculateAge,
  isValidEmployeeName,
  isAtLeast18YearsOld,
  isValidMobile,
  isValidEmail,
  validatePasswordStrength
} from '../utils/validation';

export default function UserForm({ mode = 'add', initialData = null }) {
  const router = useRouter();

  const isEdit = mode === 'edit';

  // Dynamic max date for 18 years requirement (calculated from current date so it never needs manual updates)
  const maxDobDate = useMemo(() => getMaxDateFor18YearsOld(), []);
  const maxDobFormatted = useMemo(() => {
    try {
      const parts = maxDobDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return maxDobDate;
    }
  }, [maxDobDate]);

  const [form, setForm] = useState({
    empNo: initialData?.empNo || initialData?.employeeId || '',
    firstName: initialData?.firstName || initialData?.name?.split(' ')[0] || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || initialData?.name?.split(' ').slice(1).join(' ') || '',
    mobile: initialData?.mobile || '',
    dateOfBirth: initialData?.dateOfBirth || '',

    userName: initialData?.userName || '',
    password: '',
    email: initialData?.email || '',
    allow2FA: initialData?.allow2FA ?? (initialData?.twoFAEnabled === 'Y'),

    designation: initialData?.designation || '',
    userRole: initialData?.userRole || initialData?.role || '',
    systemRole: initialData?.systemRole || 'BRANCH_USER',
    status: initialData?.status || 'Active',
    allowMultiBranch: initialData?.allowMultiBranch ?? (initialData?.multiBranchAccess === 'Y'),
    loginBranch: initialData?.loginBranch || initialData?.branch || '',
    allowLoginOnHolidays: initialData?.allowLoginOnHolidays ?? (initialData?.loginOnHolidays === 'Y'),

    idleTimeout: initialData?.idleTimeout ?? 900,
    badLogins: initialData?.badLogins ?? 3,
    loginTime: initialData?.loginTime || '09:00 AM',
    logoutTime: initialData?.logoutTime || '06:00 PM',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate single field
  const validateField = (name, value, values = form) => {
    let err = '';

    switch (name) {
      case 'empNo':
        if (!value || !String(value).trim()) {
          err = 'Emp ID is required.';
        } else if (String(value).trim().length < 3 || String(value).trim().length > 20) {
          err = 'Emp ID must be between 3 and 20 characters.';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(String(value).trim())) {
          err = 'Emp ID can only contain letters, numbers, hyphens, and underscores (e.g. EMP001).';
        } else if (!isEmpIdUnique(String(value).trim(), initialData?.id)) {
          err = 'This Emp ID is already in use by another employee.';
        }
        break;

      case 'firstName':
        if (!value || !String(value).trim()) {
          err = 'First Name is required.';
        } else if (String(value).trim().length < 2) {
          err = 'First Name must be at least 2 characters.';
        } else if (!isValidEmployeeName(value)) {
          err = 'Employee name must not contain numbers or unsupported characters.';
        }
        break;

      case 'middleName':
        if (value && String(value).trim() && !isValidEmployeeName(value)) {
          err = 'Employee name must not contain numbers or unsupported characters.';
        }
        break;

      case 'lastName':
        if (!value || !String(value).trim()) {
          err = 'Last Name is required.';
        } else if (!isValidEmployeeName(value)) {
          err = 'Employee name must not contain numbers or unsupported characters.';
        }
        break;

      case 'mobile': {
        const cleanMobile = String(value || '').trim();
        if (!cleanMobile) {
          err = 'Mobile number is required.';
        } else if (!/^[789]/.test(cleanMobile)) {
          err = 'Mobile number must start with 7, 8, or 9.';
        } else if (cleanMobile.length !== 10) {
          err = 'Mobile number must contain the required 10 digits.';
        } else if (!isValidMobile(cleanMobile)) {
          err = 'Please enter a valid 10-digit mobile number starting with 7, 8, or 9.';
        }
        break;
      }

      case 'dateOfBirth':
        if (!value) {
          err = 'Date of Birth is required.';
        } else {
          const dob = new Date(value);
          const today = new Date();
          const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          if (isNaN(dob.getTime())) {
            err = 'Please enter a valid Date of Birth.';
          } else if (value > todayString) {
            err = 'Date of Birth cannot be in the future.';
          } else if (!isAtLeast18YearsOld(value)) {
            const age = calculateAge(value);
            err = `Applicant must be at least 18 years old (current age is ${age} year${age === 1 ? '' : 's'}). Must be born on or before ${maxDobFormatted}.`;
          } else if (calculateAge(value) > 100) {
            err = 'Please enter a realistic Date of Birth (maximum age is 100 years).';
          }
        }
        break;

      case 'userName':
        if (!value || !String(value).trim()) {
          err = 'User Name is required.';
        } else if (String(value).trim().length < 3 || String(value).trim().length > 30) {
          err = 'User Name must be between 3 and 30 characters.';
        } else if (!/^[a-zA-Z0-9._-]+$/.test(String(value).trim())) {
          err = 'Username contains unsupported characters.';
        } else if (!isUsernameUnique(String(value).trim(), initialData?.id)) {
          err = 'This User Name is already taken. Please choose a different username.';
        }
        break;

      case 'password':
        if (!isEdit && !value) {
          err = 'Password is required.';
        } else if (value) {
          err = validatePasswordStrength(value);
        }
        break;

      case 'email':
        if (!value || !String(value).trim()) {
          err = 'Email ID is required.';
        } else if (!isValidEmail(String(value).trim())) {
          err = 'Please enter a valid email address (e.g. employee@bank.com).';
        }
        break;

      case 'designation':
        if (!value || !['Branch Manager', 'Loan Officer', 'Credit Analyst', 'Senior Underwriter', 'Audit Specialist', 'Operations Executive', 'Risk Analyst', 'System Administrator'].includes(value)) {
          err = 'Please select a Designation.';
        }
        break;

      case 'userRole':
        if (!value || !['Manager', 'Officer', 'Maker', 'Checker', 'Viewer', 'Admin'].includes(value)) {
          err = 'Please select a User Role.';
        }
        break;

      case 'systemRole':
        if (!value || !['SUPER_ADMIN', 'BRANCH_USER', 'CREDIT_USER', 'OPERATIONS_USER', 'AUDIT_USER'].includes(value)) {
          err = 'Please select a System Role.';
        }
        break;

      case 'status':
        if (!value || !['Active', 'Inactive', 'Suspended'].includes(value)) {
          err = 'Please select an Account Status.';
        }
        break;

      case 'loginBranch':
        if (!values.allowMultiBranch && (!value || !['Pune', 'Mumbai', 'Koramangala', 'Salt Lake', 'Andheri West', 'Pimpri', 'Indiranagar', 'Head Office'].includes(value))) {
          err = 'Please select a Login Branch (or enable Allow MultiBranch).';
        }
        break;

      case 'idleTimeout':
        if (value === '' || value === null || value === undefined) {
          err = 'Idle Timeout is required.';
        } else if (!/^\d+$/.test(String(value)) || Number(value) < 60 || Number(value) > 86400) {
          err = 'Idle Timeout must be between 60 and 86,400 seconds (1 minute to 24 hours).';
        }
        break;

      case 'badLogins':
        if (value === '' || value === null || value === undefined) {
          err = 'No. of Bad Login is required.';
        } else if (!/^\d+$/.test(String(value)) || Number(value) < 0 || Number(value) > 10) {
          err = 'No. of Bad Login must be an integer between 0 and 10.';
        }
        break;

      default:
        break;
    }

    return err;
  };

  const handleChange = (e) => {
    const input = e.currentTarget;
    const { name, type, checked } = input;
    const rawValue = input.value;
    const val = type === 'checkbox' ? checked : filterUserInput(name, rawValue);
    const nextForm = { ...form, [name]: val };

    if (type !== 'checkbox' && val !== rawValue && typeof input.setSelectionRange === 'function') {
      const caret = input.selectionStart ?? rawValue.length;
      const filteredCaret = filterUserInput(name, rawValue.slice(0, caret)).length;
      requestAnimationFrame(() => input.setSelectionRange(filteredCaret, filteredCaret));
    }

    setForm((prev) => ({ ...prev, [name]: val }));

    if (name === 'allowMultiBranch') {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        const branchError = checked || (!hasSubmitted && !touched.loginBranch)
          ? ''
          : validateField('loginBranch', form.loginBranch, nextForm);
        if (branchError) nextErrors.loginBranch = branchError;
        else delete nextErrors.loginBranch;
        return nextErrors;
      });
      return;
    }

    if (hasSubmitted || touched[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        const error = validateField(name, val, nextForm);
        if (error) nextErrors[name] = error;
        else delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.currentTarget;
    const val = type === 'checkbox' ? checked : filterUserInput(name, value);
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, val);

    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (errorMsg) nextErrors[name] = errorMsg;
      else delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    const newErrors = {};
    const fieldsToValidate = [
      'empNo',
      'firstName',
      'lastName',
      'userName',
      'mobile',
      'email',
      'dateOfBirth',
      'designation',
      'userRole',
      'systemRole',
      'status',
      'idleTimeout',
      'badLogins',
    ];

    if (form.middleName) {
      fieldsToValidate.push('middleName');
    }

    if (!isEdit || form.password) {
      fieldsToValidate.push('password');
    }

    if (!form.allowMultiBranch) {
      fieldsToValidate.push('loginBranch');
    }

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, form[field], form);
      if (err) {
        newErrors[field] = err;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setSubmitting(true);

    const fullName = [form.firstName, form.middleName, form.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const branchValue = form.allowMultiBranch ? 'Multiple Branches' : (form.loginBranch || 'Head Office');

    const employeeRecord = {
      ...(initialData || {}),
      empNo: String(form.empNo).trim(),
      employeeId: String(form.empNo).trim(),
      name: fullName,
      fullName,
      firstName: String(form.firstName).trim(),
      middleName: String(form.middleName || '').trim(),
      lastName: String(form.lastName).trim(),
      userName: String(form.userName).trim(),
      mobile: String(form.mobile).trim(),
      email: String(form.email).trim(),
      dateOfBirth: form.dateOfBirth,

      designation: form.designation,
      userRole: form.userRole,
      role: form.userRole,
      systemRole: form.systemRole,
      status: form.status,

      allow2FA: form.allow2FA,
      twoFAEnabled: form.allow2FA ? 'Y' : 'N',

      allowMultiBranch: form.allowMultiBranch,
      multiBranchAccess: form.allowMultiBranch ? 'Y' : 'N',

      loginBranch: branchValue,
      branch: branchValue,

      allowLoginOnHolidays: form.allowLoginOnHolidays,
      loginOnHolidays: form.allowLoginOnHolidays ? 'Y' : 'N',

      idleTimeout: Number(form.idleTimeout),
      inactiveSessionTimeout: String(form.idleTimeout),
      badLogins: Number(form.badLogins),
      loginTime: form.loginTime,
      logoutTime: form.logoutTime,
    };

    if (form.password) {
      employeeRecord.password = form.password;
    }

    saveEmployee(employeeRecord);

    // Save notification message in session
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        'los_user_notification',
        isEdit
          ? `Employee ${fullName} (${employeeRecord.empNo}) updated successfully.`
          : `New user ${fullName} (${employeeRecord.empNo}) created successfully.`
      );
    }

    router.push('/user_management');
  };

  return (
    <div>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title={isEdit ? 'Edit Employee' : 'Add User'}
        description={
          isEdit
            ? `Modify account settings, access privileges, and operating parameters for ${initialData?.name || initialData?.fullName || 'employee'}.`
            : 'Register a new employee and configure application access, security credentials, and branch permissions.'
        }
        action={
          <button
            type="button"
            className="secondary-button"
            onClick={() => router.push('/user_management')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            Back to User Management
          </button>
        }
      />

      <form onSubmit={handleSubmit} noValidate>
        {/* ====================================================
            SECTION 1: Employee and Personal Information
        ==================================================== */}
        <div className="form-card">
          <div className="form-card-title">
            <User size={18} color="#167c78" />
            <span>Employee and Personal Information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div>
              <label className="form-label" htmlFor="field-empNo">
                Emp ID <span>*</span>
              </label>
              <input
                id="field-empNo"
                name="empNo"
                type="text"
                maxLength={20}
                aria-invalid={Boolean(errors.empNo)}
                className={`form-input ${errors.empNo ? 'has-error' : ''}`}
                value={form.empNo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. EMP001"
              />
              {errors.empNo ? (
                <span className="field-error-text">{errors.empNo}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Unique employee identifier (e.g. EMP001).
                </span>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="field-firstName">
                First Name <span>*</span>
              </label>
              <input
                id="field-firstName"
                name="firstName"
                type="text"
                maxLength={100}
                autoComplete="given-name"
                aria-invalid={Boolean(errors.firstName)}
                className={`form-input ${errors.firstName ? 'has-error' : ''}`}
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="field-error-text">{errors.firstName}</span>}
            </div>

            <div>
              <label className="form-label" htmlFor="field-middleName">
                Middle Name
              </label>
              <input
                id="field-middleName"
                name="middleName"
                type="text"
                maxLength={100}
                aria-invalid={Boolean(errors.middleName)}
                className={`form-input ${errors.middleName ? 'has-error' : ''}`}
                value={form.middleName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Middle name (optional)"
              />
              {errors.middleName && <span className="field-error-text">{errors.middleName}</span>}
            </div>

            <div>
              <label className="form-label" htmlFor="field-lastName">
                Last Name <span>*</span>
              </label>
              <input
                id="field-lastName"
                name="lastName"
                type="text"
                maxLength={100}
                autoComplete="family-name"
                aria-invalid={Boolean(errors.lastName)}
                className={`form-input ${errors.lastName ? 'has-error' : ''}`}
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="field-error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginTop: '18px' }}>
            <div>
              <label className="form-label" htmlFor="field-mobile">
                Mobile <span>*</span>{' '}
                <small style={{ color: '#167c78', fontWeight: 600 }}>(Starts with 7, 8, or 9)</small>
              </label>
              <input
                id="field-mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                aria-invalid={Boolean(errors.mobile)}
                className={`form-input ${errors.mobile ? 'has-error' : ''}`}
                value={form.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit number starting with 7, 8, or 9"
              />
              {errors.mobile ? (
                <span className="field-error-text">{errors.mobile}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Must be exactly 10 digits starting with 7, 8, or 9.
                </span>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="field-dateOfBirth">
                Date of Birth <span>*</span>{' '}
                <small style={{ color: '#167c78', fontWeight: 600 }}>(Min. 18 years old)</small>
              </label>
              <input
                id="field-dateOfBirth"
                name="dateOfBirth"
                type="date"
                max={maxDobDate}
                className={`form-input ${errors.dateOfBirth ? 'has-error' : ''}`}
                value={form.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.dateOfBirth ? (
                <span className="field-error-text">{errors.dateOfBirth}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Applicant must be at least 18 years old (born on or before {maxDobFormatted}).
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            SECTION 2: Login Information
        ==================================================== */}
        <div className="form-card">
          <div className="form-card-title">
            <Lock size={18} color="#167c78" />
            <span>Login Information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div>
              <label className="form-label" htmlFor="field-userName">
                User Name <span>*</span>
              </label>
              <input
                id="field-userName"
                name="userName"
                type="text"
                maxLength={30}
                autoComplete="username"
                aria-invalid={Boolean(errors.userName)}
                className={`form-input ${errors.userName ? 'has-error' : ''}`}
                value={form.userName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Login username"
                style={{ fontWeight: 600, background: '#fcfdfd' }}
              />
              {errors.userName ? (
                <span className="field-error-text">{errors.userName}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Unique username for system authentication.
                </span>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="field-password">
                {isEdit ? 'Password (leave blank to keep existing)' : 'Password *'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="field-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={128}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  className={`form-input ${errors.password ? 'has-error' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={isEdit ? 'Leave empty to keep existing' : 'Enter strong password'}
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#708087',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <span className="field-error-text">{errors.password}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Min. 8 chars with uppercase, lowercase, number and special symbol.
                </span>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="field-email">
                Email ID <span>*</span>
              </label>
              <input
                id="field-email"
                name="email"
                type="email"
                maxLength={254}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="employee@bank.com"
              />
              {errors.email ? (
                <span className="field-error-text">{errors.email}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Corporate or personal email address.
                </span>
              )}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label className="form-switch">
              <input
                type="checkbox"
                name="allow2FA"
                checked={form.allow2FA}
                onChange={handleChange}
              />
              <span>Allow 2FA Login</span>
            </label>
            <p style={{ margin: '4px 0 0 28px', fontSize: '11px', color: '#7a8e91' }}>
              Enforces two-factor authentication security during user login.
            </p>
          </div>
        </div>

        {/* ====================================================
            SECTION 3: Role and Access Information
        ==================================================== */}
        <div className="form-card">
          <div className="form-card-title">
            <Shield size={18} color="#167c78" />
            <span>Role and Access Information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div>
              <label className="form-label" htmlFor="field-designation">
                Designation <span>*</span>
              </label>
              <select
                id="field-designation"
                name="designation"
                className={`form-input ${errors.designation ? 'has-error' : ''}`}
                value={form.designation}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select Designation</option>
                <option value="Branch Manager">Branch Manager</option>
                <option value="Loan Officer">Loan Officer</option>
                <option value="Credit Analyst">Credit Analyst</option>
                <option value="Senior Underwriter">Senior Underwriter</option>
                <option value="Audit Specialist">Audit Specialist</option>
                <option value="Operations Executive">Operations Executive</option>
                <option value="Risk Analyst">Risk Analyst</option>
                <option value="System Administrator">System Administrator</option>
              </select>
              {errors.designation && <span className="field-error-text">{errors.designation}</span>}
            </div>

            <div>
              <label className="form-label" htmlFor="field-userRole">
                User Role <span>*</span>
              </label>
              <select
                id="field-userRole"
                name="userRole"
                className={`form-input ${errors.userRole ? 'has-error' : ''}`}
                value={form.userRole}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select User Role</option>
                <option value="Manager">Manager</option>
                <option value="Officer">Officer</option>
                <option value="Maker">Maker</option>
                <option value="Checker">Checker</option>
                <option value="Viewer">Viewer</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.userRole && <span className="field-error-text">{errors.userRole}</span>}
            </div>

            <div>
              <label className="form-label" htmlFor="field-systemRole">
                System Role <span>*</span>
              </label>
              <select
                id="field-systemRole"
                name="systemRole"
                className={`form-input ${errors.systemRole ? 'has-error' : ''}`}
                value={form.systemRole}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select System Role</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="BRANCH_USER">BRANCH_USER</option>
                <option value="CREDIT_USER">CREDIT_USER</option>
                <option value="OPERATIONS_USER">OPERATIONS_USER</option>
                <option value="AUDIT_USER">AUDIT_USER</option>
              </select>
              {errors.systemRole && <span className="field-error-text">{errors.systemRole}</span>}
            </div>

            <div>
              <label className="form-label" htmlFor="field-status">
                Status <span>*</span>
              </label>
              <select
                id="field-status"
                name="status"
                className={`form-input ${errors.status ? 'has-error' : ''}`}
                value={form.status}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              {errors.status && <span className="field-error-text">{errors.status}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginTop: '18px' }}>
            <div>
              <label className="form-label" htmlFor="field-loginBranch">
                Login Branch {!form.allowMultiBranch && <span>*</span>}
              </label>
              <select
                id="field-loginBranch"
                name="loginBranch"
                disabled={form.allowMultiBranch}
                className={`form-input ${errors.loginBranch ? 'has-error' : ''}`}
                value={form.allowMultiBranch ? '' : form.loginBranch}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">{form.allowMultiBranch ? 'All branches permitted' : 'Select Branch'}</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Koramangala">Koramangala</option>
                <option value="Salt Lake">Salt Lake</option>
                <option value="Andheri West">Andheri West</option>
                <option value="Pimpri">Pimpri</option>
                <option value="Indiranagar">Indiranagar</option>
                <option value="Head Office">Head Office</option>
              </select>
              {errors.loginBranch ? (
                <span className="field-error-text">{errors.loginBranch}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  {form.allowMultiBranch ? 'Multi-branch access is enabled.' : 'Primary operating branch assignment.'}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', marginTop: '20px' }}>
            <div>
              <label className="form-switch">
                <input
                  type="checkbox"
                  name="allowMultiBranch"
                  checked={form.allowMultiBranch}
                  onChange={handleChange}
                />
                <span>Allow MultiBranch</span>
              </label>
              <p style={{ margin: '4px 0 0 28px', fontSize: '11px', color: '#7a8e91' }}>
                Grants operational access across all bank branches.
              </p>
            </div>

            <div>
              <label className="form-switch">
                <input
                  type="checkbox"
                  name="allowLoginOnHolidays"
                  checked={form.allowLoginOnHolidays}
                  onChange={handleChange}
                />
                <span>Allow Login On Holidays</span>
              </label>
              <p style={{ margin: '4px 0 0 28px', fontSize: '11px', color: '#7a8e91' }}>
                Permits system access on recognized public holidays and weekends.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            SECTION 4: Session and Login Settings
        ==================================================== */}
        <div className="form-card">
          <div className="form-card-title">
            <Clock size={18} color="#167c78" />
            <span>Session and Login Settings</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div>
              <label className="form-label" htmlFor="field-idleTimeout">
                Idle Timeout In (Secs) <span>*</span>
              </label>
              <input
                id="field-idleTimeout"
                name="idleTimeout"
                type="text"
                inputMode="numeric"
                min={60}
                max={86400}
                maxLength={5}
                aria-invalid={Boolean(errors.idleTimeout)}
                className={`form-input ${errors.idleTimeout ? 'has-error' : ''}`}
                value={form.idleTimeout}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.idleTimeout ? (
                <span className="field-error-text">{errors.idleTimeout}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Duration of inactivity before session auto-expires (60 - 86,400s).
                </span>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="field-badLogins">
                No. of Bad Login <span>*</span>
              </label>
              <input
                id="field-badLogins"
                name="badLogins"
                type="text"
                inputMode="numeric"
                min={0}
                max={10}
                maxLength={2}
                aria-invalid={Boolean(errors.badLogins)}
                className={`form-input ${errors.badLogins ? 'has-error' : ''}`}
                value={form.badLogins}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.badLogins ? (
                <span className="field-error-text">{errors.badLogins}</span>
              ) : (
                <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                  Maximum failed password attempts before account lockout (0 - 10).
                </span>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="field-loginTime">
                Login Time
              </label>
              <input
                id="field-loginTime"
                name="loginTime"
                type="text"
                className="form-input"
                value={form.loginTime}
                onChange={handleChange}
                placeholder="09:00 AM"
              />
              <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                Permitted daily access window start time.
              </span>
            </div>

            <div>
              <label className="form-label" htmlFor="field-logoutTime">
                LogOut Time
              </label>
              <input
                id="field-logoutTime"
                name="logoutTime"
                type="text"
                className="form-input"
                value={form.logoutTime}
                onChange={handleChange}
                placeholder="06:00 PM"
              />
              <span style={{ fontSize: '11px', color: '#647e82', marginTop: '4px', display: 'block' }}>
                Permitted daily access window end time.
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {Object.keys(errors).length > 0 && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            <span>Please correct the errors highlighted above before submitting the form.</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '14px',
            paddingTop: '10px',
            marginBottom: '40px',
          }}
        >
          <button
            type="button"
            className="secondary-button"
            onClick={() => router.push('/user_management')}
            style={{ minWidth: '110px' }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="primary-button"
            style={{ minWidth: '140px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isEdit ? <Save size={16} /> : <Check size={16} />}
            {isEdit ? 'Save Changes' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
