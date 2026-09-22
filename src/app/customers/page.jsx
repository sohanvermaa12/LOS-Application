"use client";

import {
  ArrowUpRight,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UserX,
  X,
  Building2,
  Clock3,
  LockKeyhole,
  CalendarDays,
} from "lucide-react";

import { useState } from "react";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    userName: "",
    password: "",
    confirmPassword: "",

    twoFAEnabled: "Y",
    status: "Active",

    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    mobile: "",
    gender: "",

    designation: "",
    role: "",

    multiBranchAccess: "N",
    loginBranch: "",

    loginOnHolidays: "N",

    loginTime: "09:00",
    logoutTime: "18:00",

    inactiveSessionTimeout: "900",
    badLogins: "0",

    lastLoginDate: "",
    lastLoginTime: "",
  });

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      name === "password" ||
      name === "confirmPassword"
    ) {
      setPasswordError("");
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      employeeId: "",
      userName: "",
      password: "",
      confirmPassword: "",

      twoFAEnabled: "Y",
      status: "Active",

      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      mobile: "",
      gender: "",

      designation: "",
      role: "",

      multiBranchAccess: "N",
      loginBranch: "",

      loginOnHolidays: "N",

      loginTime: "09:00",
      logoutTime: "18:00",

      inactiveSessionTimeout: "900",
      badLogins: "0",

      lastLoginDate: "",
      lastLoginTime: "",
    });

    setPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setShowCreateUser(false);
    resetForm();
  };

  // =========================================================
  // PASSWORD POLICY
  // =========================================================

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  // =========================================================
  // CREATE USER
  // =========================================================

  const handleCreateUser = (e) => {
    e.preventDefault();

    const passwordValidation = validatePassword(form.password);

    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError(
        "Password and Confirm Password do not match."
      );
      return;
    }

    if (!form.role) {
      setPasswordError("Please select a user role.");
      return;
    }

    if (
      form.multiBranchAccess === "N" &&
      !form.loginBranch
    ) {
      setPasswordError(
        "Please select Login Branch when Multi Branch Access is No."
      );
      return;
    }

    if (!form.employeeId.trim()) {
      setPasswordError("Employee ID is required.");
      return;
    }

    if (!form.userName.trim()) {
      setPasswordError("User Name is required.");
      return;
    }

    const fullName = [
      form.firstName,
      form.middleName,
      form.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const initials = fullName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    /*
      BACKEND API INTEGRATION WILL BE ADDED LATER.

      Example future payload:

      {
        employeeId,
        userName,
        password,
        twoFAEnabled,
        status,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        email,
        mobile,
        gender,
        designation,
        role,
        multiBranchAccess,
        loginBranch,
        loginOnHolidays,
        loginTime,
        logoutTime,
        inactiveSessionTimeout,
        badLogins
      }

      Password should NEVER be stored directly by frontend.
      Backend should hash the password.
    */

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(5, "0")}`,

      employeeId: form.employeeId,
      userName: form.userName,

      fullName,

      email: form.email,
      mobile: form.mobile,

      designation: form.designation,
      role: form.role,

      status: form.status,

      loginBranch:
        form.multiBranchAccess === "Y"
          ? "Multiple Branches"
          : form.loginBranch,

      twoFAEnabled: form.twoFAEnabled,

      lastLogin:
        form.lastLoginDate && form.lastLoginTime
          ? `${form.lastLoginDate} ${form.lastLoginTime}`
          : "Never",

      initials,
    };

    setUsers((prev) => [...prev, newUser]);

    closeModal();
  };

  // =========================================================
  // ROLE DESCRIPTION
  // =========================================================

  const roleDescriptions = {
    Maker: "Create and process loan applications.",
    Checker: "Review, verify and approve applications.",
    Viewer: "View permitted application information.",
  };

  // =========================================================
  // COMMON STYLES
  // =========================================================

  const sectionStyle = {
    marginBottom: "32px",
  };

  const sectionTitleStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#172033",
    marginBottom: "18px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
  };

  const sectionIconStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const grid2 = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  };

  const grid3 = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  };

  const fieldStyle = {
    minWidth: 0,
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <AppShell title="User Management">

      <PageHeader
        eyebrow="ADMINISTRATION"
        title="User Management"
        description="Manage application users, authentication controls and role-based access."
        action={
          <button
            className="primary-button"
            onClick={() => setShowCreateUser(true)}
          >
            <Plus size={17} />
            Add User
          </button>
        }
      />

      {/* =====================================================
          SEARCH & FILTERS
      ===================================================== */}

      <div className="workspace-toolbar">

        <div className="search-field">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search by employee ID, name, username, email or mobile"
          />
        </div>

        <button className="filter-select">
          <Filter size={15} />
          Role
        </button>

        <button className="filter-select">
          <Filter size={15} />
          Branch
        </button>

        <button className="filter-select">
          <Filter size={15} />
          Status
        </button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section
        className="customer-grid"
        style={{ marginBottom: "24px" }}
      >

        <Card>
          <div className="customer-card-top">
            <div className="customer-avatar">
              <UserRound size={19} />
            </div>
          </div>

          <h3>{users.length}</h3>
          <p>Total Users</p>
        </Card>

        <Card>
          <div className="customer-card-top">
            <div className="customer-avatar">
              <ShieldCheck size={19} />
            </div>
          </div>

          <h3>
            {
              users.filter(
                (user) => user.role === "Maker"
              ).length
            }
          </h3>

          <p>Maker Users</p>
        </Card>

        <Card>
          <div className="customer-card-top">
            <div className="customer-avatar">
              <ShieldCheck size={19} />
            </div>
          </div>

          <h3>
            {
              users.filter(
                (user) => user.role === "Checker"
              ).length
            }
          </h3>

          <p>Checker Users</p>
        </Card>

        <Card>
          <div className="customer-card-top">
            <div className="customer-avatar">
              <UserX size={19} />
            </div>
          </div>

          <h3>
            {
              users.filter(
                (user) => user.role === "Viewer"
              ).length
            }
          </h3>

          <p>Viewer Users</p>
        </Card>

      </section>

      {/* =====================================================
          USER LIST
      ===================================================== */}

      <Card>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >

          <div>
            <h3 style={{ margin: 0 }}>
              Application Users
            </h3>

            <p style={{ margin: "5px 0 0" }}>
              Users configured for the LOS application.
            </p>
          </div>

          <button
            className="outline-button"
            onClick={() => setShowCreateUser(true)}
          >
            <Plus size={15} />
            Add User
          </button>

        </div>

        {users.length === 0 ? (

          <div
            style={{
              minHeight: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >

            <div>

              <div
                style={{
                  width: "58px",
                  height: "58px",
                  margin: "0 auto 16px",
                  borderRadius: "14px",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserRound size={25} />
              </div>

              <h3 style={{ marginBottom: "6px" }}>
                No users created
              </h3>

              <p style={{ marginBottom: "20px" }}>
                Create a user and assign a Maker,
                Checker or Viewer role.
              </p>

              <button
                className="primary-button"
                onClick={() => setShowCreateUser(true)}
              >
                <Plus size={17} />
                Create User
              </button>

            </div>

          </div>

        ) : (

          <div style={{ overflowX: "auto" }}>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1200px",
              }}
            >

              <thead>

                <tr>

                  <th className="table-header">
                    Employee / User
                  </th>

                  <th className="table-header">
                    Role
                  </th>

                  <th className="table-header">
                    Designation
                  </th>

                  <th className="table-header">
                    Branch
                  </th>

                  <th className="table-header">
                    Contact
                  </th>

                  <th className="table-header">
                    2FA
                  </th>

                  <th className="table-header">
                    Status
                  </th>

                  <th className="table-header">
                    Last Login
                  </th>

                  <th className="table-header">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr key={user.id}>

                    <td className="table-cell">

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >

                        <div className="customer-avatar">
                          {user.initials}
                        </div>

                        <div>

                          <strong>
                            {user.fullName}
                          </strong>

                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.6,
                              marginTop: "3px",
                            }}
                          >
                            {user.employeeId}
                            {" • "}
                            {user.userName}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="table-cell">

                      <span className="role-badge">
                        {user.role}
                      </span>

                    </td>

                    <td className="table-cell">
                      {user.designation || "-"}
                    </td>

                    <td className="table-cell">
                      {user.loginBranch || "-"}
                    </td>

                    <td className="table-cell">

                      <div>
                        {user.email}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          opacity: 0.6,
                          marginTop: "3px",
                        }}
                      >
                        {user.mobile}
                      </div>

                    </td>

                    <td className="table-cell">
                      {user.twoFAEnabled === "Y"
                        ? "Enabled"
                        : "Disabled"}
                    </td>

                    <td className="table-cell">

                      <span
                        className={`status ${
                          user.status === "Active"
                            ? "status-green"
                            : "status-amber"
                        }`}
                      >
                        {user.status}
                      </span>

                    </td>

                    <td className="table-cell">
                      {user.lastLogin}
                    </td>

                    <td className="table-cell">

                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                        }}
                      >

                        <button
                          className="outline-button"
                          title="Edit User"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button className="outline-button">
                          View
                          <ArrowUpRight size={14} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* =====================================================
          CREATE USER MODAL
      ===================================================== */}

      {showCreateUser && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(15, 23, 42, 0.62)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "1120px",
              maxHeight: "94vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              boxShadow:
                "0 30px 90px rgba(15, 23, 42, 0.35)",
            }}
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              style={{
                padding: "24px 32px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "#ffffff",
                zIndex: 5,
              }}
            >

              <div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "11px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserRound size={21} />
                  </div>

                  <div>

                    <h2
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: 750,
                        color: "#172033",
                      }}
                    >
                      Create New User
                    </h2>

                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Create and configure an application
                      user account.
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "#f8fafc",
                  width: "38px",
                  height: "38px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={19} />
              </button>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleCreateUser}>

              <div
                style={{
                  padding: "30px 32px 20px",
                }}
              >

                {/* =================================================
                    SECTION 1 - EMPLOYEE & LOGIN
                ================================================= */}

                <div style={sectionStyle}>

                  <div style={sectionTitleStyle}>

                    <div style={sectionIconStyle}>
                      <LockKeyhole size={17} />
                    </div>

                    <div>
                      <div>
                        Employee & Login Information
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Employee identity and authentication
                        credentials
                      </div>
                    </div>

                  </div>

                  <div style={grid3}>

                    <div style={fieldStyle}>

                      <label className="form-label">
                        Employee ID <span>*</span>
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        placeholder="Enter Employee ID"
                        required
                      />

                    </div>

                    <div style={fieldStyle}>

                      <label className="form-label">
                        User Name <span>*</span>
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        name="userName"
                        value={form.userName}
                        onChange={handleChange}
                        placeholder="Enter login username"
                        required
                      />

                    </div>

                    <div style={fieldStyle}>

                      <label className="form-label">
                        Status <span>*</span>
                      </label>

                      <select
                        className="form-input"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>
                      </select>

                    </div>

                  </div>

                  <div
                    style={{
                      ...grid2,
                      marginTop: "20px",
                    }}
                  >

                    {/* PASSWORD */}

                    <div>

                      <label className="form-label">
                        Password <span>*</span>
                      </label>

                      <div
                        style={{
                          position: "relative",
                        }}
                      >

                        <input
                          className="form-input"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Create initial password"
                          required
                          style={{
                            paddingRight: "45px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (prev) => !prev
                            )
                          }
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform:
                              "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "#64748b",
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                      </div>

                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "11px",
                          color: "#64748b",
                          lineHeight: 1.5,
                        }}
                      >
                        Minimum 8 characters with uppercase,
                        lowercase, number and special character.
                      </div>

                    </div>

                    {/* CONFIRM PASSWORD */}

                    <div>

                      <label className="form-label">
                        Confirm Password <span>*</span>
                      </label>

                      <div
                        style={{
                          position: "relative",
                        }}
                      >

                        <input
                          className="form-input"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter password"
                          required
                          style={{
                            paddingRight: "45px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (prev) => !prev
                            )
                          }
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform:
                              "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "#64748b",
                          }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* 2FA */}

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >

                    <label className="form-label">
                      2FA Enabled <span>*</span>
                    </label>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "8px",
                      }}
                    >

                      {["Y", "N"].map((value) => {

                        const selected =
                          form.twoFAEnabled === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                twoFAEnabled: value,
                              }))
                            }
                            style={{
                              minWidth: "90px",
                              padding: "10px 18px",
                              borderRadius: "8px",
                              border: selected
                                ? "1px solid #2563eb"
                                : "1px solid #d1d5db",
                              background: selected
                                ? "#eff6ff"
                                : "#ffffff",
                              color: selected
                                ? "#1d4ed8"
                                : "#475569",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
                          >
                            {value === "Y"
                              ? "Yes"
                              : "No"}
                          </button>
                        );
                      })}

                    </div>

                  </div>

                </div>

                {/* =================================================
                    SECTION 2 - PERSONAL INFORMATION
                ================================================= */}

                <div style={sectionStyle}>

                  <div style={sectionTitleStyle}>

                    <div style={sectionIconStyle}>
                      <UserRound size={17} />
                    </div>

                    <div>
                      <div>
                        Personal Information
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Employee personal and contact details
                      </div>
                    </div>

                  </div>

                  {/* NAME */}

                  <div style={grid3}>

                    <div style={fieldStyle}>

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

                    <div style={fieldStyle}>

                      <label className="form-label">
                        Middle Name
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        placeholder="Middle name"
                      />

                    </div>

                    <div style={fieldStyle}>

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

                  <div
                    style={{
                      ...grid3,
                      marginTop: "20px",
                    }}
                  >

                    <div>

                      <label className="form-label">
                        Date of Birth
                      </label>

                      <input
                        className="form-input"
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                      />

                    </div>

                    <div>

                      <label className="form-label">
                        Gender
                      </label>

                      <select
                        className="form-input"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                      >

                        <option value="">
                          Select Gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                    <div>

                      <label className="form-label">
                        Mobile No.
                      </label>

                      <input
                        className="form-input"
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                      />

                    </div>

                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >

                    <label className="form-label">
                      Email ID
                    </label>

                    <input
                      className="form-input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="employee@bank.com"
                    />

                  </div>

                </div>

                {/* =================================================
                    SECTION 3 - ROLE & ACCESS
                ================================================= */}

                <div style={sectionStyle}>

                  <div style={sectionTitleStyle}>

                    <div style={sectionIconStyle}>
                      <ShieldCheck size={17} />
                    </div>

                    <div>

                      <div>
                        Role & Access Configuration
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Application role and functional access
                      </div>

                    </div>

                  </div>

                  <div style={grid2}>

                    <div>

                      <label className="form-label">
                        Designation
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        placeholder="e.g. Credit Officer"
                      />

                    </div>

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

                        <option value="">
                          Select Role
                        </option>

                        <option value="Maker">
                          Maker
                        </option>

                        <option value="Checker">
                          Checker
                        </option>

                        <option value="Viewer">
                          Viewer
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* ROLE CARDS */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                      gap: "14px",
                      marginTop: "20px",
                    }}
                  >

                    {[
                      "Maker",
                      "Checker",
                      "Viewer",
                    ].map((role) => {

                      const selected =
                        form.role === role;

                      return (

                        <button
                          type="button"
                          key={role}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              role,
                            }))
                          }
                          style={{
                            position: "relative",
                            textAlign: "left",
                            padding: "18px",
                            borderRadius: "11px",
                            border: selected
                              ? "2px solid #2563eb"
                              : "1px solid #dbe2ea",
                            background: selected
                              ? "#eff6ff"
                              : "#ffffff",
                            cursor: "pointer",
                          }}
                        >

                          {selected && (

                            <div
                              style={{
                                position: "absolute",
                                right: "12px",
                                top: "12px",
                                width: "21px",
                                height: "21px",
                                borderRadius: "50%",
                                background: "#2563eb",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check size={12} />
                            </div>

                          )}

                          <ShieldCheck
                            size={20}
                            style={{
                              marginBottom: "10px",
                              color: selected
                                ? "#2563eb"
                                : "#64748b",
                            }}
                          />

                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                              color: "#172033",
                            }}
                          >
                            {role}
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              marginTop: "6px",
                              lineHeight: 1.5,
                            }}
                          >
                            {roleDescriptions[role]}
                          </div>

                        </button>

                      );
                    })}

                  </div>

                </div>

                {/* =================================================
                    SECTION 4 - BRANCH & LOGIN CONTROL
                ================================================= */}

                <div style={sectionStyle}>

                  <div style={sectionTitleStyle}>

                    <div style={sectionIconStyle}>
                      <Building2 size={17} />
                    </div>

                    <div>

                      <div>
                        Branch & Login Controls
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Configure branch and working-day access
                      </div>

                    </div>

                  </div>

                  <div style={grid2}>

                    {/* MULTI BRANCH */}

                    <div>

                      <label className="form-label">
                        Multi Branch Access <span>*</span>
                      </label>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >

                        {["Y", "N"].map((value) => {

                          const selected =
                            form.multiBranchAccess === value;

                          return (

                            <button
                              type="button"
                              key={value}
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  multiBranchAccess: value,
                                  loginBranch:
                                    value === "Y"
                                      ? ""
                                      : prev.loginBranch,
                                }))
                              }
                              style={{
                                minWidth: "90px",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                border: selected
                                  ? "1px solid #2563eb"
                                  : "1px solid #d1d5db",
                                background: selected
                                  ? "#eff6ff"
                                  : "#ffffff",
                                color: selected
                                  ? "#1d4ed8"
                                  : "#475569",
                                fontWeight: 650,
                                cursor: "pointer",
                              }}
                            >
                              {value === "Y"
                                ? "Yes"
                                : "No"}
                            </button>

                          );

                        })}

                      </div>

                    </div>

                    {/* LOGIN BRANCH */}

                    <div>

                      <label className="form-label">

                        Login Branch

                        {form.multiBranchAccess ===
                          "N" && (
                          <span> *</span>
                        )}

                      </label>

                      <select
                        className="form-input"
                        name="loginBranch"
                        value={form.loginBranch}
                        onChange={handleChange}
                        disabled={
                          form.multiBranchAccess ===
                          "Y"
                        }
                        required={
                          form.multiBranchAccess ===
                          "N"
                        }
                        style={{
                          opacity:
                            form.multiBranchAccess ===
                            "Y"
                              ? 0.6
                              : 1,
                        }}
                      >

                        <option value="">
                          Select Login Branch
                        </option>

                        <option value="Head Office">
                          Head Office
                        </option>

                        <option value="Pune Main Branch">
                          Pune Main Branch
                        </option>

                        <option value="Mumbai Branch">
                          Mumbai Branch
                        </option>

                        <option value="Nashik Branch">
                          Nashik Branch
                        </option>

                        <option value="Nagpur Branch">
                          Nagpur Branch
                        </option>

                      </select>

                      {form.multiBranchAccess ===
                        "Y" && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginTop: "6px",
                          }}
                        >
                          User can access multiple
                          authorized branches.
                        </div>
                      )}

                    </div>

                  </div>

                  {/* HOLIDAY */}

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >

                    <label className="form-label">
                      Login on Holidays <span>*</span>
                    </label>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "8px",
                      }}
                    >

                      {["Y", "N"].map((value) => {

                        const selected =
                          form.loginOnHolidays ===
                          value;

                        return (

                          <button
                            type="button"
                            key={value}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                loginOnHolidays: value,
                              }))
                            }
                            style={{
                              minWidth: "90px",
                              padding: "10px 18px",
                              borderRadius: "8px",
                              border: selected
                                ? "1px solid #2563eb"
                                : "1px solid #d1d5db",
                              background: selected
                                ? "#eff6ff"
                                : "#ffffff",
                              color: selected
                                ? "#1d4ed8"
                                : "#475569",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
                          >
                            {value === "Y"
                              ? "Yes"
                              : "No"}
                          </button>

                        );

                      })}

                    </div>

                  </div>

                </div>

                {/* =================================================
                    SECTION 5 - LOGIN TIME & SESSION
                ================================================= */}

                <div style={sectionStyle}>

                  <div style={sectionTitleStyle}>

                    <div style={sectionIconStyle}>
                      <Clock3 size={17} />
                    </div>

                    <div>

                      <div>
                        Login & Session Controls
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Define allowed login window and session
                        security parameters
                      </div>

                    </div>

                  </div>

                  <div style={grid3}>

                    <div>

                      <label className="form-label">
                        Login Time
                      </label>

                      <input
                        className="form-input"
                        type="time"
                        name="loginTime"
                        value={form.loginTime}
                        onChange={handleChange}
                      />

                    </div>

                    <div>

                      <label className="form-label">
                        Logout Time
                      </label>

                      <input
                        className="form-input"
                        type="time"
                        name="logoutTime"
                        value={form.logoutTime}
                        onChange={handleChange}
                      />

                    </div>

                    <div>

                      <label className="form-label">
                        Inactive Session Timeout
                        <span> *</span>
                      </label>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >

                        <input
                          className="form-input"
                          type="number"
                          min="60"
                          name="inactiveSessionTimeout"
                          value={
                            form.inactiveSessionTimeout
                          }
                          onChange={handleChange}
                          placeholder="900"
                        />

                        <div
                          style={{
                            minWidth: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f8fafc",
                            border: "1px solid #dbe2ea",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          Sec
                        </div>

                      </div>

                    </div>

                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >

                    <label className="form-label">
                      No. of Bad Logins
                    </label>

                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      name="badLogins"
                      value={form.badLogins}
                      onChange={handleChange}
                      placeholder="0"
                      style={{
                        maxWidth: "350px",
                      }}
                    />

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginTop: "6px",
                      }}
                    >
                      Current failed login attempt count.
                      Backend should enforce the lockout
                      policy.
                    </div>

                  </div>

                </div>

                {/* =================================================
                    SECTION 6 - AUDIT INFORMATION
                ================================================= */}

                <div style={sectionStyle}>

                  <div style={sectionTitleStyle}>

                    <div style={sectionIconStyle}>
                      <CalendarDays size={17} />
                    </div>

                    <div>

                      <div>
                        Login Audit Information
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Previous login information maintained
                        for audit purposes
                      </div>

                    </div>

                  </div>

                  <div style={grid2}>

                    <div>

                      <label className="form-label">
                        Last Login Date
                      </label>

                      <input
                        className="form-input"
                        type="date"
                        name="lastLoginDate"
                        value={form.lastLoginDate}
                        onChange={handleChange}
                      />

                    </div>

                    <div>

                      <label className="form-label">
                        Last Login Time
                      </label>

                      <input
                        className="form-input"
                        type="time"
                        name="lastLoginTime"
                        value={form.lastLoginTime}
                        onChange={handleChange}
                      />

                    </div>

                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      gap: "10px",
                    }}
                  >

                    <ShieldCheck
                      size={18}
                      style={{
                        flexShrink: 0,
                        color: "#2563eb",
                      }}
                    />

                    <div>

                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#172033",
                        }}
                      >
                        Backend Security Integration
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "4px",
                          lineHeight: 1.5,
                        }}
                      >
                        User creation APIs, password hashing,
                        2FA configuration, branch authorization,
                        session timeout enforcement and audit
                        logging will be integrated with the Java
                        backend once the APIs are provided.
                      </div>

                    </div>

                  </div>

                </div>

                {/* ERROR */}

                {passwordError && (

                  <div
                    style={{
                      marginTop: "5px",
                      marginBottom: "20px",
                      padding: "12px 14px",
                      borderRadius: "9px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {passwordError}
                  </div>

                )}

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                style={{
                  padding: "18px 32px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  position: "sticky",
                  bottom: 0,
                  background: "#ffffff",
                  zIndex: 5,
                }}
              >

                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  Fields marked with * are mandatory.
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >

                  <button
                    type="button"
                    className="outline-button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={!form.role}
                    style={{
                      opacity: !form.role ? 0.5 : 1,
                      cursor: !form.role
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    <Plus size={16} />
                    Create User
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