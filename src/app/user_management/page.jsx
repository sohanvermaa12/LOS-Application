'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  UserRound
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { getEmployees, deleteEmployee } from '../../services/employeeService';

export default function UserManagementPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [notification, setNotification] = useState('');

  // Load employees & check for any flash notification from add/edit
  useEffect(() => {
    const list = getEmployees();
    setEmployees(list);

    if (typeof window !== 'undefined') {
      const flash = window.sessionStorage.getItem('los_user_notification');
      if (flash) {
        setNotification(flash);
        window.sessionStorage.removeItem('los_user_notification');
        const timer = setTimeout(() => setNotification(''), 6000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Search logic: triggers only when Search button is clicked or Enter is pressed
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
      const role = (emp.userRole || emp.role || '').toLowerCase();

      return (
        empNo.includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        branch.includes(q) ||
        role.includes(q)
      );
    });
  }, [employees, searchQuery]);

  // Navigate to dedicated full-page View
  const handleView = (emp) => {
    const id = emp.empNo || emp.employeeId || emp.id;
    router.push(`/user_management/view/${id}`);
  };


  
  const handleEdit = (emp) => {
    const id = emp.empNo || emp.employeeId || emp.id;
    router.push(`/user_management/edit/${id}`);
  };

  // Delete confirmation flow
  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
  };

  const confirmDelete = () => {
    if (!employeeToDelete) return;
    const idToDelete = employeeToDelete.id || employeeToDelete.empNo;
    const updated = deleteEmployee(idToDelete);
    setEmployees(updated);
    setNotification(
      `Employee ${employeeToDelete.name || employeeToDelete.fullName} (${employeeToDelete.empNo || employeeToDelete.employeeId}) deleted successfully.`
    );
    setEmployeeToDelete(null);
  };

  return (
    <AppShell title="User Management">
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="User Management"
        description="Manage application users, authentication controls, role-based access, and operational branch privileges."
      />

      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: '8px',
            background: '#eef8f5',
            border: '1px solid #cce8e0',
            color: '#13715b',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px',
            boxShadow: '0 2px 6px rgba(19, 113, 91, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="#13715b" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification('')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#13715b', display: 'grid', placeItems: 'center' }}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          ENHANCED PROMINENT SEARCH BAR SECTION
      ===================================================== */}
      <div
        className="workspace-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div className="prominent-search-bar">
          <div className="prominent-search-input">
            <Search size={18} />
            <input
              type="text"
              aria-label="Search employees"
              placeholder="Search employee..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#7a8e91',
                  padding: '0 4px',
                  display: 'grid',
                  placeItems: 'center',
                }}
                title="Clear input"
                aria-label="Clear employee search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleSearch}
            style={{
              height: '50px',
              padding: '0 22px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <Search size={15} />
            Search
          </button>

          {searchQuery && (
            <button
              type="button"
              className="secondary-button"
              onClick={handleResetSearch}
              style={{ height: '50px', padding: '0 16px', fontSize: '12px', flexShrink: 0 }}
            >
              Reset Filter
            </button>
          )}
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => router.push('/user_management/add')}
          style={{
            height: '50px',
            padding: '0 20px',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* =====================================================
          IMPROVED EMPLOYEE TABLE
          - All column headers bold
          - Column: Employee Name (renamed from Name of the Employee)
          - Reduced excessive spacing between Employee Name and Mobile
          - Subtle row separators and clean hover effect
          - Properly aligned Action column
      ===================================================== */}
      <Card className="table-panel">
        <div className="panel-heading" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Employee Directory</h2>
            <p>
              Showing {filteredEmployees.length} of {employees.length} employees
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '64px', fontWeight: 700, fontSize: '11px', color: '#173e46' }}>
                  Sr. No.
                </th>
                <th style={{ width: '120px', fontWeight: 700, fontSize: '11px', color: '#173e46' }}>
                  Emp. No.
                </th>
                <th style={{ width: '240px', fontWeight: 700, fontSize: '11px', color: '#173e46' }}>
                  Employee Name
                </th>
                <th style={{ width: '140px', fontWeight: 700, fontSize: '11px', color: '#173e46' }}>
                  Mobile
                </th>
                <th style={{ width: '150px', fontWeight: 700, fontSize: '11px', color: '#173e46' }}>
                  Branch
                </th>
                <th style={{ width: '130px', fontWeight: 700, fontSize: '11px', color: '#173e46' }}>
                  Role
                </th>
                <th style={{ width: '140px', fontWeight: 700, fontSize: '11px', color: '#173e46', textAlign: 'center' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#7a898b' }}>
                    <div style={{ display: 'grid', placeItems: 'center', gap: '8px' }}>
                      <UserRound size={32} color="#9bb0af" />
                      <strong style={{ color: '#173e46', fontSize: '14px' }}>No employees found</strong>
                      <span style={{ fontSize: '12px' }}>
                        {searchQuery ? 'Try clearing or modifying your search terms.' : 'Click "Add User" to register a new employee.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr
                    key={emp.id || emp.empNo || index}
                    style={{
                      transition: 'background-color 0.15s ease',
                      borderBottom: '1px solid #edf2f1',
                    }}
                  >
                    <td style={{ color: '#708087', fontSize: '12px', padding: '14px 12px' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <strong className="id-text" style={{ fontSize: '12px', fontWeight: 700 }}>
                        {emp.empNo || emp.employeeId}
                      </strong>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <strong style={{ fontSize: '13px', color: '#173e46' }}>
                        {emp.name || emp.fullName}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#889a9c', display: 'block', marginTop: '2px' }}>
                        @{emp.userName}
                      </span>
                    </td>
                    <td style={{ color: '#2c4751', fontSize: '12px', padding: '14px 12px' }}>
                      {emp.mobile || '-'}
                    </td>
                    <td style={{ color: '#2c4751', fontSize: '12px', padding: '14px 12px' }}>
                      {emp.branch || emp.loginBranch || '-'}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="role-badge" style={{ fontWeight: 600 }}>
                        {emp.userRole || emp.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="icon-button"
                          title="View Employee Details"
                          aria-label={`View ${emp.name || emp.fullName}`}
                          onClick={() => handleView(emp)}
                          style={{
                            border: '1px solid #d8e2e1',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            color: '#167c78',
                            background: '#fff',
                          }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Edit Employee"
                          aria-label={`Edit ${emp.name || emp.fullName}`}
                          onClick={() => handleEdit(emp)}
                          style={{
                            border: '1px solid #d8e2e1',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            color: '#2563eb',
                            background: '#fff',
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Delete Employee"
                          aria-label={`Delete ${emp.name || emp.fullName}`}
                          onClick={() => handleDeleteClick(emp)}
                          style={{
                            border: '1px solid #fed7d7',
                            color: '#dc2626',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#fff',
                          }}
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
          DELETE CONFIRMATION MODAL
      ===================================================== */}
      {employeeToDelete && (
        <Modal onClose={() => setEmployeeToDelete(null)}>
          <div className="modal-header">
            <div>
              <div className="eyebrow" style={{ color: '#dc2626' }}>CONFIRM DELETION</div>
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
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#173e46', lineHeight: 1.5, fontWeight: 600 }}>
                  Are you sure you want to delete this employee?
                </p>
                <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#7a8e91' }}>
                  This will remove the employee record from the directory and revoke login access.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <strong style={{ display: 'block', color: '#173e46', fontSize: '13px' }}>
                {employeeToDelete.name || employeeToDelete.fullName}
              </strong>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '8px' }}>
                <span>Emp ID: {employeeToDelete.empNo || employeeToDelete.employeeId}</span>
                <span>•</span>
                <span>Role: {employeeToDelete.userRole || employeeToDelete.role}</span>
                <span>•</span>
                <span>Branch: {employeeToDelete.branch || employeeToDelete.loginBranch}</span>
              </div>
            </div>
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
              style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
              onClick={confirmDelete}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}