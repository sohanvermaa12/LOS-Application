'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {

  Edit3,

  Eye,

  Plus,

  Search,

  X,

  CheckCircle2,

  UserRound

} from 'lucide-react';

import AppShell from '../../components/AppShell';

import PageHeader from '../../components/PageHeader';

import Card from '../../components/Card';

import { api } from '../../services/api.js';

import { getEmployees } from '../../services/employeeService';

import { getLeads } from '../../services/leadService';

export default function UserManagementPage() {

  const router = useRouter();

  const [employees, setEmployees] = useState([]);

  const [leads, setLeads] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [searchInput, setSearchInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [notification, setNotification] = useState('');

  // Load employees & check for any flash notification from add/edit

  useEffect(() => {

    // Read the status saved by the Add/Edit User form.
    // Do not override it here; the table only displays the saved value.
    setEmployees(getEmployees());

    setLeads(getLeads());

    setCustomers(api.customers);

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

  const filteredRecords = useMemo(() => {

    const q = searchQuery.trim().toLowerCase();

    if (!q) return employees;

    return employees.filter((record) => {

      const values = [

        record.empNo,

        record.employeeId,

        record.title,

        record.name,

        record.fullName,

        record.mobile,

        record.branch,

        record.loginBranch,

        record.designation,

        record.jobTitle,

        record.position,

        record.systemRole,

        record.system_role,

        record.userRole,

        record.user_role,

        record.role,

        record.status,

      ];

      return values.some((value) => String(value ?? '').toLowerCase().includes(q));

    });

  }, [employees, searchQuery]);

  const tableColumns = ['Sr. No.', 'Emp. No.', 'Employee Name', 'Mobile Number', 'Branch', 'Designation', 'System Role', 'User Role', 'Status', 'Action'];

  // Navigate to dedicated full-page View

  const handleView = (emp) => {

    const id = emp.empNo || emp.employeeId || emp.id;

    router.push(`/user_management/view/${id}`);

  };

  const handleEdit = (emp) => {

    const id = emp.empNo || emp.employeeId || emp.id;

    router.push(`/user_management/edit/${id}`);

  };

  return (

    <AppShell title="User Management">

      <PageHeader

        eyebrow="ADMINISTRATION"

        title="User Management"

        description="Manage application users, authentication controls, role-based access, and operational branch privileges."

      />

      <div

        style={{

          display: 'grid',

          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',

          gap: '15px',

          marginBottom: '20px',

        }}

      >

        {[

          { key: 'leads', label: 'Total No. of Leads', count: leads.length },

          { key: 'customers', label: 'Total No. of Customers', count: customers.length },

          { key: 'employees', label: 'Total No. of Employees', count: employees.length },

        ].map((summary) => {

          return (

            <article

              key={summary.key}

              aria-label={`${summary.label}: ${summary.count}`}

              style={{

                minHeight: '112px',

                padding: '19px 21px',

                border: '1px solid #e5ecec',

                borderRadius: '8px',

                background: '#fff',

                boxShadow: '0 2px 8px rgba(17, 39, 45, 0.03)',

                textAlign: 'left',

              }}

            >

              <span style={{ display: 'block', fontSize: '11px', color: '#718185', fontWeight: 600 }}>

                {summary.label}

              </span>

              <strong style={{ display: 'block', marginTop: '7px', font: '700 26px Manrope', color: '#1e3f45' }}>

                {summary.count}

              </strong>

            </article>

          );

        })}

      </div>

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

              placeholder="Search employees..."

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

              Showing {filteredRecords.length} of {employees.length} employees

              {searchQuery ? ` matching "${searchQuery}"` : ''}

            </p>

          </div>

        </div>

        <div className="table-scroll">

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>

            <thead>

              <tr>

                {tableColumns.map((column) => (

                  <th

                    key={column}

                    style={{

                      width: {

                        'Sr. No.': '64px',

                        'Emp. No.': '120px',

                        'Employee Name': '240px',

                        'Mobile Number': '140px',

                        Branch: '130px',

                        Designation: '150px',

                        'System Role': '140px',

                        'User Role': '130px',

                        Status: '120px',

                        Action: '110px',

                      }[column],

                      fontWeight: 700,

                      fontSize: '11px',

                      color: '#173e46',

                      textAlign: column === 'Action' ? 'center' : undefined,

                    }}

                  >

                    {column}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {filteredRecords.length === 0 ? (

                <tr>

                  <td colSpan={10} style={{ textAlign: 'center', padding: '48px 16px', color: '#7a898b' }}>

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

                filteredRecords.map((emp, index) => (

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

                        {[emp.title, emp.name || emp.fullName].filter(Boolean).join(' ')}

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

                    <td style={{ color: '#2c4751', fontSize: '12px', padding: '14px 12px' }}>

                      {emp.designation || emp.jobTitle || emp.position || '-'}

                    </td>

                    <td style={{ padding: '14px 12px' }}>

                      <span className="role-badge" style={{ fontWeight: 600 }}>

                        {emp.systemRole || emp.system_role || '-'}

                      </span>

                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <span className="role-badge" style={{ fontWeight: 600 }}>
                        {emp.userRole || emp.user_role || emp.role || '-'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 11px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          background:
                            String(emp.status || '').toLowerCase() === 'active'
                              ? '#dcfce7'
                              : String(emp.status || '').toLowerCase() === 'suspended'
                              ? '#fee2e2'
                              : String(emp.status || '').toLowerCase() === 'inactive'
                              ? '#f3f4f6'
                              : '#f8fafc',
                          color:
                            String(emp.status || '').toLowerCase() === 'active'
                              ? '#166534'
                              : String(emp.status || '').toLowerCase() === 'suspended'
                              ? '#991b1b'
                              : String(emp.status || '').toLowerCase() === 'inactive'
                              ? '#4b5563'
                              : '#64748b',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {emp.status || 'Not set'}
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

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </AppShell>

  );

}