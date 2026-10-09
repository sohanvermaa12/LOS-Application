'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
  AlertTriangle
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { api } from '../../services/api.js';

const initialEmployeeForm = {
  employeeId: '',
  userName: '',
  password: '',
  confirmPassword: '',

  twoFAEnabled: 'Y',
  status: 'Active',

  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  mobile: '',
  gender: '',

  designation: '',
  role: '',

  multiBranchAccess: 'N',
  loginBranch: '',

  loginOnHolidays: 'N',

  loginTime: '09:00',
  logoutTime: '18:00',

  inactiveSessionTimeout: '900',
  badLogins: '0',

  lastLoginDate: '',
  lastLoginTime: '',
};

const roleDescriptions = {
  Manager: 'Oversee branch operations, application workflows and staff approvals.',
  Officer: 'Verify loan applications, evaluate borrower profiles and conduct field checks.',
  Maker: 'Create and process loan applications.',
  Checker: 'Review, verify and approve applications.',
  Viewer: 'View permitted application and customer information.',
  Admin: 'System administration, user access control and configuration.',
};

export default function UserManagementPage() {
  const [employees, setEmployees] = useState(api.employees || []);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Form states
  const [form, setForm] = useState(initialEmployeeForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Search logic: triggers only when Search button is clicked or Enter key is pressed
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return employees;

    return employees.filter((emp) => {
      const empNo = (emp.empNo || emp.employeeId || '').toLowerCase();
      const name = (emp.name || emp.fullName || '').toLowerCase();
      const mobile = (emp.mobile || '').toLowerCase();
      const branch = (emp.branch || emp.loginBranch || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();

      return (
        empNo.includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        branch.includes(q) ||
        role.includes(q)
      );
    });
  }, [employees, searchQuery]);

  // Form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setFormError('');
    }
  };

  const resetForm = () => {
    setForm(initialEmployeeForm);
    setFormError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditingEmployee(null);
  };

  const openAddUserModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    resetForm();
  };

  // Password Policy validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must contain at least 8 characters.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*).';
    }
    return '';
  };

  // Open Edit Form
  const handleEdit = (emp) => {
    setEditingEmployee(emp);

    const nameParts = (emp.fullName || emp.name || '').trim().split(' ');
    const firstName = emp.firstName || nameParts[0] || '';
    const lastName = emp.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
    const middleName = emp.middleName || '';

    setForm({
      employeeId: emp.empNo || emp.employeeId || '',
      userName: emp.userName || '',
      password: '',
      confirmPassword: '',

      twoFAEnabled: emp.twoFAEnabled || 'Y',
      status: emp.status || 'Active',

      firstName,
      middleName,
      lastName,
      dateOfBirth: emp.dateOfBirth || '',
      email: emp.email || '',
      mobile: emp.mobile || '',
      gender: emp.gender || '',

      designation: emp.designation || '',
      role: emp.role || '',

      multiBranchAccess: emp.multiBranchAccess || 'N',
      loginBranch: emp.branch === 'Multiple Branches' ? '' : (emp.branch || emp.loginBranch || ''),

      loginOnHolidays: emp.loginOnHolidays || 'N',
      loginTime: emp.loginTime || '09:00',
      logoutTime: emp.logoutTime || '18:00',

      inactiveSessionTimeout: emp.inactiveSessionTimeout || '900',
      badLogins: emp.badLogins || '0',

      lastLoginDate: emp.lastLoginDate || '',
      lastLoginTime: emp.lastLoginTime || '',
    });

    setFormError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowFormModal(true);
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!form.employeeId.trim()) {
      setFormError('Employee ID / Emp. No. is required.');
      return;
    }

    if (!form.userName.trim()) {
      setFormError('User Name is required.');
      return;
    }

    if (!form.role) {
      setFormError('Please select an employee role.');
      return;
    }

    if (form.multiBranchAccess === 'N' && !form.loginBranch) {
      setFormError('Please select Branch when Multi Branch Access is No.');
      return;
    }

    // Password validation: required for new user, optional for edit unless entered
    if (!editingEmployee) {
      const passwordValidation = validatePassword(form.password);
      if (passwordValidation) {
        setFormError(passwordValidation);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setFormError('Password and Confirm Password do not match.');
        return;
      }
    } else if (form.password) {
      const passwordValidation = validatePassword(form.password);
      if (passwordValidation) {
        setFormError(passwordValidation);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setFormError('Password and Confirm Password do not match.');
        return;
      }
    }

    const fullName = [form.firstName, form.middleName, form.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || form.userName;

    const branchName = form.multiBranchAccess === 'Y' ? 'Multiple Branches' : (form.loginBranch || 'Head Office');

    if (editingEmployee) {
      // Update existing employee
      setEmployees((prev) =>
        prev.map((emp) => {
          const isMatch = emp.id === editingEmployee.id || emp.empNo === editingEmployee.empNo;
          if (isMatch) {
            return {
              ...emp,
              empNo: form.employeeId.trim(),
              employeeId: form.employeeId.trim(),
              name: fullName,
              fullName,
              firstName: form.firstName,
              middleName: form.middleName,
              lastName: form.lastName,
              userName: form.userName.trim(),
              mobile: form.mobile.trim(),
              email: form.email.trim(),
              branch: branchName,
              loginBranch: branchName,
              role: form.role,
              designation: form.designation.trim() || emp.designation,
              status: form.status,
              twoFAEnabled: form.twoFAEnabled,
              gender: form.gender,
              dateOfBirth: form.dateOfBirth,
              multiBranchAccess: form.multiBranchAccess,
              loginOnHolidays: form.loginOnHolidays,
              loginTime: form.loginTime,
              logoutTime: form.logoutTime,
              inactiveSessionTimeout: form.inactiveSessionTimeout,
            };
          }
          return emp;
        })
      );
    } else {
      // Create new employee
      const newEmpId = `USR-${String(employees.length + 1).padStart(5, '0')}`;
      const newEmployee = {
        id: newEmpId,
        empNo: form.employeeId.trim(),
        employeeId: form.employeeId.trim(),
        name: fullName,
        fullName,
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        userName: form.userName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        branch: branchName,
        loginBranch: branchName,
        role: form.role,
        designation: form.designation.trim() || 'Staff',
        status: form.status,
        twoFAEnabled: form.twoFAEnabled,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        multiBranchAccess: form.multiBranchAccess,
        loginOnHolidays: form.loginOnHolidays,
        loginTime: form.loginTime,
        logoutTime: form.logoutTime,
        inactiveSessionTimeout: form.inactiveSessionTimeout,
        lastLogin: 'Never',
      };

      setEmployees((prev) => [newEmployee, ...prev]);
    }

    closeFormModal();
  };

  // View action
  const handleView = (emp) => {
    setViewingEmployee(emp);
  };

  // Delete flow with confirmation dialog
  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
  };

  const confirmDelete = () => {
    if (!employeeToDelete) return;
    setEmployees((prev) =>
      prev.filter((emp) => emp.id !== employeeToDelete.id && emp.empNo !== employeeToDelete.empNo)
    );
    setEmployeeToDelete(null);
  };

  return (
    <AppShell title="User Management">
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="User Management"
        description="Manage application users, authentication controls and role-based access."
        action={
          <button
            type="button"
            className="primary-button"
            onClick={openAddUserModal}
          >
            <Plus size={16} />
            Add User
          </button>
        }
      />

      {/* =====================================================
          SUMMARY CARDS: EXACTLY ONE CARD
          [ Total No. of Employees ]
      ===================================================== */}
      <section style={{ maxWidth: '300px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon ink">
            <UsersRound size={18} />
          </div>
          <div className="metric-label">Total No. of Employees</div>
          <div className="metric-value">{employees.length}</div>
        </div>
      </section>

      {/* =====================================================
          USER MANAGEMENT SEARCH SECTION
      ===================================================== */}
      <div
        className="workspace-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div className="search-field" style={{ flex: 1, minWidth: '240px', maxWidth: '450px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleSearch}
          style={{ height: '36px', padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Search size={14} />
          Search
        </button>

        {searchQuery && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleResetSearch}
            style={{ height: '36px', padding: '0 14px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* =====================================================
          EMPLOYEE TABLE
          Columns:
          1. Sr. No.
          2. Emp. No.
          3. Name of the Employee
          4. Mobile
          5. Branch
          6. Role
          7. Action
      ===================================================== */}
      <Card className="table-panel">
        <div className="panel-heading" style={{ marginBottom: '16px' }}>
          <div>
            <h2>Employee Directory</h2>
            <p>
              Showing {filteredEmployees.length} of {employees.length} employees
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Sr. No.</th>
                <th style={{ width: '130px' }}>Emp. No.</th>
                <th>Name of the Employee</th>
                <th style={{ width: '140px' }}>Mobile</th>
                <th style={{ width: '150px' }}>Branch</th>
                <th style={{ width: '130px' }}>Role</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#7a898b' }}>
                    No employees found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp.id || emp.empNo || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong className="id-text">{emp.empNo || emp.employeeId}</strong>
                    </td>
                    <td>
                      <strong>{emp.name || emp.fullName}</strong>
                    </td>
                    <td>{emp.mobile || '-'}</td>
                    <td>{emp.branch || emp.loginBranch || '-'}</td>
                    <td>
                      <span className="role-badge">{emp.role}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="icon-button"
                          title="View"
                          aria-label={`View ${emp.name || emp.fullName}`}
                          onClick={() => handleView(emp)}
                          style={{ border: '1px solid #d8e2e1', width: '30px', height: '30px', borderRadius: '5px' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Edit"
                          aria-label={`Edit ${emp.name || emp.fullName}`}
                          onClick={() => handleEdit(emp)}
                          style={{ border: '1px solid #d8e2e1', width: '30px', height: '30px', borderRadius: '5px' }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Delete"
                          aria-label={`Delete ${emp.name || emp.fullName}`}
                          onClick={() => handleDeleteClick(emp)}
                          style={{ border: '1px solid #fed7d7', color: '#c53030', width: '30px', height: '30px', borderRadius: '5px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =====================================================
          VIEW EMPLOYEE DETAILS MODAL
      ===================================================== */}
      {viewingEmployee && (
        <Modal onClose={() => setViewingEmployee(null)}>
          <div className="modal-header">
            <div>
              <div className="eyebrow">EMPLOYEE DETAILS</div>
              <h2>{viewingEmployee.name || viewingEmployee.fullName}</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setViewingEmployee(null)}
              aria-label="Close employee details"
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body" style={{ minHeight: 'auto', padding: '24px 28px' }}>
            <div className="review-summary" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <span>
                Emp. No.
                <strong>{viewingEmployee.empNo || viewingEmployee.employeeId}</strong>
              </span>
              <span>
                Username
                <strong>{viewingEmployee.userName || viewingEmployee.empNo}</strong>
              </span>
              <span>
                Name of the Employee
                <strong>{viewingEmployee.name || viewingEmployee.fullName}</strong>
              </span>
              <span>
                Role
                <strong>{viewingEmployee.role}</strong>
              </span>
              <span>
                Designation
                <strong>{viewingEmployee.designation || 'Not specified'}</strong>
              </span>
              <span>
                Branch
                <strong>{viewingEmployee.branch || viewingEmployee.loginBranch || 'Head Office'}</strong>
              </span>
              <span>
                Mobile
                <strong>{viewingEmployee.mobile || 'Not specified'}</strong>
              </span>
              <span>
                Email
                <strong>{viewingEmployee.email || 'Not specified'}</strong>
              </span>
              <span>
                Status
                <strong>{viewingEmployee.status || 'Active'}</strong>
              </span>
              <span>
                2FA Security
                <strong>{viewingEmployee.twoFAEnabled === 'Y' ? 'Enabled' : 'Disabled'}</strong>
              </span>
              <span>
                Multi-Branch Access
                <strong>{viewingEmployee.multiBranchAccess === 'Y' ? 'Yes' : 'No'}</strong>
              </span>
              <span>
                Last Login
                <strong>{viewingEmployee.lastLogin || 'Never'}</strong>
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setViewingEmployee(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                const emp = viewingEmployee;
                setViewingEmployee(null);
                handleEdit(emp);
              }}
            >
              <Edit3 size={14} />
              Edit Employee
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}
      {employeeToDelete && (
        <Modal onClose={() => setEmployeeToDelete(null)}>
          <div className="modal-header">
            <div>
              <div className="eyebrow" style={{ color: '#c53030' }}>CONFIRM DELETION</div>
              <h2>Delete Employee</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setEmployeeToDelete(null)}
              aria-label="Close confirmation dialog"
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body" style={{ minHeight: 'auto', padding: '24px 28px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#415e66', lineHeight: 1.6 }}>
              Are you sure you want to delete this employee?
            </p>
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
              }}
            >
              <strong style={{ display: 'block', color: '#1e3f45', fontSize: '13px' }}>
                {employeeToDelete.name || employeeToDelete.fullName}
              </strong>
              <span style={{ fontSize: '11px', color: '#708087' }}>
                Emp. No: {employeeToDelete.empNo || employeeToDelete.employeeId} • Role: {employeeToDelete.role} • Branch: {employeeToDelete.branch || employeeToDelete.loginBranch}
              </span>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: '11px', color: '#8a999a' }}>
              This action will remove the employee from the directory. Only delete after confirmation.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setEmployeeToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              onClick={confirmDelete}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          ADD / EDIT EMPLOYEE MODAL
      ===================================================== */}
      {showFormModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15, 23, 42, 0.62)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeFormModal();
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '94vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 70px rgba(15, 23, 42, 0.35)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                zIndex: 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#e8eeed',
                    color: '#167c78',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserRound size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#173e46' }}>
                    {editingEmployee ? 'Edit Employee' : 'Add User'}
                  </h2>
                  <p style={{ margin: '3px 0 0', color: '#7b8a8d', fontSize: '12px' }}>
                    {editingEmployee
                      ? `Update account information for ${editingEmployee.name || editingEmployee.fullName}.`
                      : 'Create and configure an application user account.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                style={{
                  border: 'none',
                  background: '#f1f5f5',
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6a7d82',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm}>
              <div style={{ padding: '24px 28px' }}>
                {/* SECTION 1: EMPLOYEE & LOGIN */}
                <div style={{ marginBottom: '26px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#173e46',
                      marginBottom: '14px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e5ecec',
                    }}
                  >
                    <LockKeyhole size={16} color="#167c78" />
                    <span>Employee & Login Information</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="form-label">
                        Emp. No. / Employee ID <span>*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        placeholder="e.g. EMP001"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        User Name <span>*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="userName"
                        value={form.userName}
                        onChange={handleChange}
                        placeholder="e.g. rahul.sharma"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Status <span>*</span>
                      </label>
                      <select
                        className="form-input"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <label className="form-label">
                        {editingEmployee ? 'Password (leave blank to keep unchanged)' : 'Password *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="form-input"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder={editingEmployee ? 'Leave empty to retain existing' : 'Create initial password'}
                          required={!editingEmployee}
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#708087',
                          }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '10px', color: '#708087' }}>
                        Min. 8 chars with uppercase, lowercase, number & symbol.
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        {editingEmployee ? 'Confirm Password' : 'Confirm Password *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="form-input"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter password"
                          required={!editingEmployee && Boolean(form.password)}
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#708087',
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">2FA Enabled</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {['Y', 'N'].map((val) => {
                          const isSel = form.twoFAEnabled === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, twoFAEnabled: val }))}
                              style={{
                                flex: 1,
                                height: '38px',
                                borderRadius: '6px',
                                border: isSel ? '1px solid #167c78' : '1px solid #d8e2e1',
                                background: isSel ? '#edf6f5' : '#fff',
                                color: isSel ? '#167c78' : '#52666a',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              {val === 'Y' ? 'Yes' : 'No'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PERSONAL INFORMATION */}
                <div style={{ marginBottom: '26px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#173e46',
                      marginBottom: '14px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e5ecec',
                    }}
                  >
                    <UserRound size={16} color="#167c78" />
                    <span>Personal Information</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="form-label">
                        First Name <span>*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Middle Name</label>
                      <input
                        className="form-input"
                        type="text"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        placeholder="Middle name"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Last Name <span>*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <label className="form-label">Mobile No. <span>*</span></label>
                      <input
                        className="form-input"
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Email ID</label>
                      <input
                        className="form-input"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="e.g. employee@bank.com"
                      />
                    </div>

                    <div>
                      <label className="form-label">Date of Birth</label>
                      <input
                        className="form-input"
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ROLE & BRANCH */}
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#173e46',
                      marginBottom: '14px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e5ecec',
                    }}
                  >
                    <ShieldCheck size={16} color="#167c78" />
                    <span>Role & Branch Access</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="form-label">
                        Role <span>*</span>
                      </label>
                      <select
                        className="form-input"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="Manager">Manager</option>
                        <option value="Officer">Officer</option>
                        <option value="Maker">Maker</option>
                        <option value="Checker">Checker</option>
                        <option value="Viewer">Viewer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Designation</label>
                      <input
                        className="form-input"
                        type="text"
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        placeholder="e.g. Branch Manager"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Branch <span>*</span>
                      </label>
                      <select
                        className="form-input"
                        name="loginBranch"
                        value={form.loginBranch}
                        onChange={handleChange}
                        required={form.multiBranchAccess === 'N'}
                      >
                        <option value="">Select Branch</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Koramangala">Koramangala</option>
                        <option value="Salt Lake">Salt Lake</option>
                        <option value="Andheri West">Andheri West</option>
                        <option value="Pimpri">Pimpri</option>
                        <option value="Indiranagar">Indiranagar</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-Branch Access */}
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2c4751' }}>
                      Multi Branch Access:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['N', 'Y'].map((val) => {
                        const isSel = form.multiBranchAccess === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, multiBranchAccess: val }))}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '6px',
                              border: isSel ? '1px solid #167c78' : '1px solid #d8e2e1',
                              background: isSel ? '#edf6f5' : '#fff',
                              color: isSel ? '#167c78' : '#52666a',
                              fontWeight: 600,
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            {val === 'Y' ? 'Yes' : 'No'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ERROR DISPLAY */}
                {formError && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={15} />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '16px 28px',
                  borderTop: '1px solid #e5ecec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  bottom: 0,
                  background: '#ffffff',
                  zIndex: 5,
                }}
              >
                <div style={{ fontSize: '11px', color: '#7b8a8d' }}>
                  Fields marked with * are mandatory.
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeFormModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {editingEmployee ? (
                      <>
                        <Check size={15} />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}