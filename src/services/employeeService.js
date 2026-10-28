import { api } from './api.js';

const STORAGE_KEY = 'los_employee_records';

const defaultEmployees = [
  {
    id: 'USR-00001',
    empNo: 'EMP001',
    employeeId: 'EMP001',
    name: 'Rahul Sharma',
    fullName: 'Rahul Sharma',
    firstName: 'Rahul',
    middleName: '',
    lastName: 'Sharma',
    userName: 'rahul.sharma',
    password: 'Password@123',
    mobile: '9876543210',
    email: 'rahul.sharma@bank.com',
    dateOfBirth: '1988-04-12',
    designation: 'Branch Manager',
    userRole: 'Manager',
    role: 'Manager',
    systemRole: 'SUPER_ADMIN',
    status: 'Active',
    allow2FA: true,
    twoFAEnabled: 'Y',
    allowMultiBranch: false,
    multiBranchAccess: 'N',
    loginBranch: 'Pune',
    branch: 'Pune',
    allowLoginOnHolidays: false,
    loginOnHolidays: 'N',
    idleTimeout: 900,
    inactiveSessionTimeout: '900',
    badLogins: 0,
    loginTime: '09:00 AM',
    logoutTime: '06:00 PM',
    lastLogin: 'Today, 10:30 AM',
  },
  {
    id: 'USR-00002',
    empNo: 'EMP002',
    employeeId: 'EMP002',
    name: 'Priya Deshmukh',
    fullName: 'Priya Deshmukh',
    firstName: 'Priya',
    middleName: '',
    lastName: 'Deshmukh',
    userName: 'priya.deshmukh',
    password: 'Password@123',
    mobile: '9876543211',
    email: 'priya.deshmukh@bank.com',
    dateOfBirth: '1992-08-23',
    designation: 'Loan Officer',
    userRole: 'Officer',
    role: 'Officer',
    systemRole: 'BRANCH_USER',
    status: 'Active',
    allow2FA: true,
    twoFAEnabled: 'Y',
    allowMultiBranch: false,
    multiBranchAccess: 'N',
    loginBranch: 'Mumbai',
    branch: 'Mumbai',
    allowLoginOnHolidays: false,
    loginOnHolidays: 'N',
    idleTimeout: 900,
    inactiveSessionTimeout: '900',
    badLogins: 0,
    loginTime: '09:00 AM',
    logoutTime: '06:00 PM',
    lastLogin: 'Today, 09:15 AM',
  },
  {
    id: 'USR-00003',
    empNo: 'EMP003',
    employeeId: 'EMP003',
    name: 'Amit Joshi',
    fullName: 'Amit Joshi',
    firstName: 'Amit',
    middleName: '',
    lastName: 'Joshi',
    userName: 'amit.joshi',
    password: 'Password@123',
    mobile: '9876543212',
    email: 'amit.joshi@bank.com',
    dateOfBirth: '1995-01-15',
    designation: 'Credit Analyst',
    userRole: 'Maker',
    role: 'Maker',
    systemRole: 'CREDIT_USER',
    status: 'Active',
    allow2FA: true,
    twoFAEnabled: 'Y',
    allowMultiBranch: false,
    multiBranchAccess: 'N',
    loginBranch: 'Pune',
    branch: 'Pune',
    allowLoginOnHolidays: false,
    loginOnHolidays: 'N',
    idleTimeout: 900,
    inactiveSessionTimeout: '900',
    badLogins: 0,
    loginTime: '09:00 AM',
    logoutTime: '06:00 PM',
    lastLogin: 'Yesterday, 04:45 PM',
  },
  {
    id: 'USR-00004',
    empNo: 'EMP004',
    employeeId: 'EMP004',
    name: 'Sneha Kulkarni',
    fullName: 'Sneha Kulkarni',
    firstName: 'Sneha',
    middleName: '',
    lastName: 'Kulkarni',
    userName: 'sneha.kulkarni',
    password: 'Password@123',
    mobile: '9876543213',
    email: 'sneha.kulkarni@bank.com',
    dateOfBirth: '1990-11-05',
    designation: 'Senior Underwriter',
    userRole: 'Checker',
    role: 'Checker',
    systemRole: 'CREDIT_USER',
    status: 'Active',
    allow2FA: false,
    twoFAEnabled: 'N',
    allowMultiBranch: false,
    multiBranchAccess: 'N',
    loginBranch: 'Koramangala',
    branch: 'Koramangala',
    allowLoginOnHolidays: false,
    loginOnHolidays: 'N',
    idleTimeout: 900,
    inactiveSessionTimeout: '900',
    badLogins: 0,
    loginTime: '09:00 AM',
    logoutTime: '06:00 PM',
    lastLogin: 'Yesterday, 02:10 PM',
  },
  {
    id: 'USR-00005',
    empNo: 'EMP005',
    employeeId: 'EMP005',
    name: 'Vikram Singh',
    fullName: 'Vikram Singh',
    firstName: 'Vikram',
    middleName: '',
    lastName: 'Singh',
    userName: 'vikram.singh',
    password: 'Password@123',
    mobile: '9876543214',
    email: 'vikram.singh@bank.com',
    dateOfBirth: '1986-06-30',
    designation: 'Audit Specialist',
    userRole: 'Viewer',
    role: 'Viewer',
    systemRole: 'AUDIT_USER',
    status: 'Inactive',
    allow2FA: true,
    twoFAEnabled: 'Y',
    allowMultiBranch: true,
    multiBranchAccess: 'Y',
    loginBranch: 'Salt Lake',
    branch: 'Salt Lake',
    allowLoginOnHolidays: false,
    loginOnHolidays: 'N',
    idleTimeout: 900,
    inactiveSessionTimeout: '900',
    badLogins: 0,
    loginTime: '09:00 AM',
    logoutTime: '06:00 PM',
    lastLogin: '3 days ago',
  },
];

export function getEmployees() {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default
    }
  }

  // Fallback to api.employees or defaults
  const base = api.employees && api.employees.length > 0 ? api.employees : defaultEmployees;
  // Initialize storage
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
    } catch {
      // Ignore
    }
  }
  return base;
}

export function getEmployeeById(id) {
  if (!id) return null;
  const list = getEmployees();
  const searchId = decodeURIComponent(String(id)).trim().toLowerCase();
  return list.find(
    (emp) =>
      String(emp.id).toLowerCase() === searchId ||
      String(emp.empNo || emp.employeeId).toLowerCase() === searchId
  ) || null;
}

export function saveEmployee(employeeData) {
  const list = getEmployees();
  const empId = employeeData.empNo || employeeData.employeeId;

  // Check if exists
  const existingIndex = list.findIndex(
    (emp) =>
      (employeeData.id && emp.id === employeeData.id) ||
      (empId && (emp.empNo === empId || emp.employeeId === empId))
  );

  let updatedList;
  let savedRecord;

  if (existingIndex >= 0) {
    // Update
    savedRecord = {
      ...list[existingIndex],
      ...employeeData,
      id: list[existingIndex].id,
      empNo: empId,
      employeeId: empId,
      updatedAt: new Date().toISOString(),
    };
    updatedList = [...list];
    updatedList[existingIndex] = savedRecord;
  } else {
    // Add new
    const newId = `USR-${String(list.length + 1).padStart(5, '0')}`;
    savedRecord = {
      ...employeeData,
      id: newId,
      empNo: empId,
      employeeId: empId,
      createdAt: new Date().toISOString(),
      lastLogin: 'Never',
    };
    updatedList = [savedRecord, ...list];
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // Ignore
    }
  }

  // Also keep in-memory api.employees in sync
  api.employees = updatedList;

  return savedRecord;
}

export function deleteEmployee(id) {
  const list = getEmployees();
  const searchId = String(id).toLowerCase();
  const updatedList = list.filter(
    (emp) =>
      String(emp.id).toLowerCase() !== searchId &&
      String(emp.empNo || emp.employeeId).toLowerCase() !== searchId
  );

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // Ignore
    }
  }

  api.employees = updatedList;
  return updatedList;
}

export function isEmpIdUnique(empId, currentId = null) {
  if (!empId) return false;
  const list = getEmployees();
  const cleanEmpId = String(empId).trim().toLowerCase();
  const cleanCurrentId = currentId ? String(currentId).trim().toLowerCase() : null;

  return !list.some((emp) => {
    const isSelf =
      cleanCurrentId &&
      (String(emp.id).toLowerCase() === cleanCurrentId ||
        String(emp.empNo || emp.employeeId).toLowerCase() === cleanCurrentId);
    if (isSelf) return false;

    return String(emp.empNo || emp.employeeId).toLowerCase() === cleanEmpId;
  });
}

export function isUsernameUnique(userName, currentId = null) {
  if (!userName) return false;
  const list = getEmployees();
  const cleanUserName = String(userName).trim().toLowerCase();
  const cleanCurrentId = currentId ? String(currentId).trim().toLowerCase() : null;

  return !list.some((emp) => {
    const isSelf =
      cleanCurrentId &&
      (String(emp.id).toLowerCase() === cleanCurrentId ||
        String(emp.empNo || emp.employeeId).toLowerCase() === cleanCurrentId);
    if (isSelf) return false;

    return String(emp.userName).toLowerCase() === cleanUserName;
  });
}

