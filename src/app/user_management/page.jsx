"use client";

import {
  Building2, CalendarDays, Check, Clock3, Edit3, Eye, EyeOff, LockKeyhole,
  Plus, Search, ShieldCheck, UserRound, Users, X, Eye as ViewIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

const EMPTY_FORM = {
  employeeId: "", userName: "", password: "", confirmPassword: "",
  twoFAEnabled: "Y", status: "Active",
  firstName: "", middleName: "", lastName: "", dateOfBirth: "", email: "", mobile: "", gender: "",
  designation: "", role: "",
  multiBranchAccess: "N", loginBranch: "", loginOnHolidays: "N",
  loginTime: "09:00", logoutTime: "18:00", inactiveSessionTimeout: "900", badLogins: "0",
  lastLoginDate: "", lastLoginTime: "",
};

const ROLES = {
  Maker: "Create and process loan applications.",
  Checker: "Review, verify and approve applications.",
  Viewer: "View permitted application information.",
};
const BRANCHES = ["Head Office", "Pune Main Branch", "Mumbai Branch", "Nashik Branch", "Nagpur Branch"];

const validatePassword = (p) => {
  if (p.length < 8) return "Password must contain at least 8 characters.";
  if (!/[A-Z]/.test(p)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(p)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(p)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*]/.test(p)) return "Password must contain at least one special character.";
  return "";
};

const passwordScore = (p) =>
  [p.length >= 8, /[A-Z]/.test(p), /[a-z]/.test(p), /[0-9]/.test(p), /[!@#$%^&*]/.test(p)].filter(Boolean).length;

/* ---------- small building blocks ---------- */

function Field({ label, required, hint, children }) {
  return (
    <div className="um-field">
      <label className="um-label">
        {label}
        {required && <span className="um-req"> *</span>}
      </label>
      {children}
      {hint && <div className="um-hint">{hint}</div>}
    </div>
  );
}

function Segmented({ value, onChange, options = [["Y", "Yes"], ["N", "No"]] }) {
  return (
    <div className="um-seg" role="radiogroup">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={value === v ? "um-seg-on" : ""}
          onClick={() => onChange(v)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="um-section">
      <header className="um-section-head">
        <span className="um-section-icon"><Icon size={17} /></span>
        <div>
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function PasswordInput({ show, onToggle, ...props }) {
  return (
    <div className="um-pw">
      <input className="form-input um-input" type={show ? "text" : "password"} required {...props} />
      <button type="button" onClick={onToggle} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };
  const handleChange = (e) => set(e.target.name, e.target.value);

  const closeModal = () => {
    setShowCreateUser(false);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();

    if (!form.employeeId.trim()) return setFormError("Employee ID is required.");
    if (!form.userName.trim()) return setFormError("User Name is required.");

    const pwError = validatePassword(form.password);
    if (pwError) return setFormError(pwError);
    if (form.password !== form.confirmPassword)
      return setFormError("Password and Confirm Password do not match.");
    if (!form.role) return setFormError("Please select a user role.");
    if (form.multiBranchAccess === "N" && !form.loginBranch)
      return setFormError("Please select a Login Branch when Multi Branch Access is No.");

    /*
      BACKEND API INTEGRATION WILL BE ADDED LATER.
      Password must NEVER be stored by the frontend — the backend should hash it.
    */

    const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
    const initials = fullName.split(" ").filter(Boolean).map((w) => w[0]).join("").substring(0, 2).toUpperCase();

    setUsers((prev) => [
      ...prev,
      {
        id: `USR-${String(prev.length + 1).padStart(5, "0")}`,
        employeeId: form.employeeId,
        userName: form.userName,
        fullName,
        email: form.email,
        mobile: form.mobile,
        designation: form.designation,
        role: form.role,
        status: form.status,
        loginBranch: form.multiBranchAccess === "Y" ? "Multiple Branches" : form.loginBranch,
        twoFAEnabled: form.twoFAEnabled,
        lastLogin: form.lastLoginDate && form.lastLoginTime ? `${form.lastLoginDate} ${form.lastLoginTime}` : "Never",
        initials,
      },
    ]);
    closeModal();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matches =
        !q ||
        [u.employeeId, u.fullName, u.userName, u.email, u.mobile].some((v) => (v || "").toLowerCase().includes(q));
      return (
        matches &&
        (!roleFilter || u.role === roleFilter) &&
        (!branchFilter || u.loginBranch === branchFilter) &&
        (!statusFilter || u.status === statusFilter)
      );
    });
  }, [users, query, roleFilter, branchFilter, statusFilter]);

  const count = (role) => users.filter((u) => u.role === role).length;
  const score = passwordScore(form.password);
  const strength = ["", "Weak", "Weak", "Fair", "Good", "Strong"][score];

  const stats = [
    { label: "Total users", value: users.length, icon: Users, tone: "blue" },
    { label: "Makers", value: count("Maker"), icon: Edit3, tone: "teal" },
    { label: "Checkers", value: count("Checker"), icon: ShieldCheck, tone: "violet" },
    { label: "Viewers", value: count("Viewer"), icon: ViewIcon, tone: "amber" },
  ];

  return (
    <AppShell title="User Management">
      <style>{CSS}</style>

      <PageHeader
        eyebrow="ADMINISTRATION"
        title="User Management"
        description="Manage application users, authentication controls and role-based access."
        action={
          <button className="primary-button" onClick={() => setShowCreateUser(true)}>
            <Plus size={17} /> Add User
          </button>
        }
      />

      {/* Summary */}
      <section className="um-stats">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <div className="um-stat">
              <span className={`um-stat-icon um-${tone}`}><Icon size={20} /></span>
              <div>
                <div className="um-stat-value">{value}</div>
                <div className="um-stat-label">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Toolbar */}
      <div className="um-toolbar">
        <div className="um-search">
          <Search size={17} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by employee ID, name, username, email or mobile"
          />
        </div>
        <select className="um-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
          <option value="">All roles</option>
          {Object.keys(ROLES).map((r) => <option key={r}>{r}</option>)}
        </select>
        <select className="um-filter" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} aria-label="Filter by branch">
          <option value="">All branches</option>
          {[...BRANCHES, "Multiple Branches"].map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="um-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* List */}
      <Card>
        <div className="um-list-head">
          <div>
            <h3>Application users</h3>
            <p>
              {users.length
                ? `Showing ${filtered.length} of ${users.length} users configured for the LOS application.`
                : "Users configured for the LOS application."}
            </p>
          </div>
          <button className="outline-button" onClick={() => setShowCreateUser(true)}>
            <Plus size={15} /> Add User
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="um-empty">
            <span className="um-empty-icon"><UserRound size={26} /></span>
            <h3>{users.length === 0 ? "No users created yet" : "No users match your filters"}</h3>
            <p>
              {users.length === 0
                ? "Create a user and assign a Maker, Checker or Viewer role."
                : "Try a different search term or clear the filters."}
            </p>
            {users.length === 0 && (
              <button className="primary-button" onClick={() => setShowCreateUser(true)}>
                <Plus size={17} /> Create User
              </button>
            )}
          </div>
        ) : (
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  {["Employee / User", "Role", "Designation", "Branch", "Contact", "2FA", "Status", "Last login", ""].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td data-label="User">
                      <div className="um-person">
                        <span className="um-avatar">{u.initials}</span>
                        <div>
                          <strong>{u.fullName}</strong>
                          <small>{u.employeeId} • {u.userName}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Role"><span className={`um-badge um-role-${u.role}`}>{u.role}</span></td>
                    <td data-label="Designation">{u.designation || "-"}</td>
                    <td data-label="Branch">{u.loginBranch || "-"}</td>
                    <td data-label="Contact">
                      <div>{u.email || "-"}</div>
                      <small>{u.mobile}</small>
                    </td>
                    <td data-label="2FA">
                      <span className={`um-dot ${u.twoFAEnabled === "Y" ? "on" : "off"}`}>
                        {u.twoFAEnabled === "Y" ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`um-pill ${u.status === "Active" ? "ok" : "warn"}`}>{u.status}</span>
                    </td>
                    <td data-label="Last login">{u.lastLogin}</td>
                    <td className="um-actions">
                      <button className="outline-button" title="Edit user" aria-label="Edit user"><Edit3 size={14} /></button>
                      <button className="outline-button" title="View user" aria-label="View user"><ViewIcon size={14} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create user modal */}
      {showCreateUser && (
        <div className="um-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="um-modal" role="dialog" aria-modal="true" aria-labelledby="um-title">
            <div className="um-modal-head">
              <div className="um-modal-title">
                <span className="um-section-icon um-lg"><UserRound size={21} /></span>
                <div>
                  <h2 id="um-title">Create new user</h2>
                  <p>Create and configure an application user account.</p>
                </div>
              </div>
              <button type="button" className="um-close" onClick={closeModal} aria-label="Close"><X size={19} /></button>
            </div>

            <form onSubmit={handleCreateUser} className="um-form">
              <div className="um-body">
                <Section icon={LockKeyhole} title="Employee & login" subtitle="Employee identity and authentication credentials">
                  <div className="um-grid g3">
                    <Field label="Employee ID" required>
                      <input className="form-input um-input" name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="Enter Employee ID" required />
                    </Field>
                    <Field label="User name" required>
                      <input className="form-input um-input" name="userName" value={form.userName} onChange={handleChange} placeholder="Enter login username" required />
                    </Field>
                    <Field label="Status" required>
                      <select className="form-input um-input" name="status" value={form.status} onChange={handleChange}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </Field>
                  </div>

                  <div className="um-grid g2 um-gap">
                    <Field label="Password" required hint="Minimum 8 characters with uppercase, lowercase, number and special character.">
                      <PasswordInput
                        name="password" value={form.password} onChange={handleChange}
                        placeholder="Create initial password"
                        show={showPassword} onToggle={() => setShowPassword((s) => !s)}
                      />
                      {form.password && (
                        <div className="um-meter" aria-live="polite">
                          <div className="um-meter-bars">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <i key={i} className={i <= score ? `lvl-${score}` : ""} />
                            ))}
                          </div>
                          <span>{strength}</span>
                        </div>
                      )}
                    </Field>
                    <Field label="Confirm password" required>
                      <PasswordInput
                        name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                        placeholder="Re-enter password"
                        show={showConfirmPassword} onToggle={() => setShowConfirmPassword((s) => !s)}
                      />
                      {form.confirmPassword && (
                        <div className={`um-match ${form.password === form.confirmPassword ? "ok" : "bad"}`}>
                          {form.password === form.confirmPassword ? "Passwords match" : "Passwords do not match"}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div className="um-gap">
                    <Field label="Two-factor authentication" required>
                      <Segmented value={form.twoFAEnabled} onChange={(v) => set("twoFAEnabled", v)} options={[["Y", "Enabled"], ["N", "Disabled"]]} />
                    </Field>
                  </div>
                </Section>

                <Section icon={UserRound} title="Personal information" subtitle="Employee personal and contact details">
                  <div className="um-grid g3">
                    <Field label="First name" required>
                      <input className="form-input um-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required />
                    </Field>
                    <Field label="Middle name">
                      <input className="form-input um-input" name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle name" />
                    </Field>
                    <Field label="Last name" required>
                      <input className="form-input um-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required />
                    </Field>
                  </div>
                  <div className="um-grid g3 um-gap">
                    <Field label="Date of birth">
                      <input className="form-input um-input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                    </Field>
                    <Field label="Gender">
                      <select className="form-input um-input" name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field label="Mobile no.">
                      <input className="form-input um-input" type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter mobile number" />
                    </Field>
                  </div>
                  <div className="um-gap">
                    <Field label="Email ID">
                      <input className="form-input um-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="employee@bank.com" />
                    </Field>
                  </div>
                </Section>

                <Section icon={ShieldCheck} title="Role & access" subtitle="Application role and functional access">
                  <div className="um-grid g2">
                    <Field label="Designation">
                      <input className="form-input um-input" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Credit Officer" />
                    </Field>
                    <Field label="Role" required>
                      <select className="form-input um-input" name="role" value={form.role} onChange={handleChange} required>
                        <option value="">Select role</option>
                        {Object.keys(ROLES).map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="um-roles um-gap">
                    {Object.entries(ROLES).map(([role, desc]) => {
                      const on = form.role === role;
                      return (
                        <button type="button" key={role} className={`um-role ${on ? "on" : ""}`} onClick={() => set("role", role)} aria-pressed={on}>
                          {on && <span className="um-tick"><Check size={12} /></span>}
                          <ShieldCheck size={20} />
                          <strong>{role}</strong>
                          <span>{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section icon={Building2} title="Branch & login access" subtitle="Configure branch and working-day access">
                  <div className="um-grid g2">
                    <Field label="Multi branch access" required hint={form.multiBranchAccess === "Y" ? "User can access multiple authorized branches." : undefined}>
                      <Segmented
                        value={form.multiBranchAccess}
                        onChange={(v) => setForm((p) => ({ ...p, multiBranchAccess: v, loginBranch: v === "Y" ? "" : p.loginBranch }))}
                      />
                    </Field>
                    <Field label="Login branch" required={form.multiBranchAccess === "N"}>
                      <select
                        className="form-input um-input" name="loginBranch" value={form.loginBranch}
                        onChange={handleChange} disabled={form.multiBranchAccess === "Y"}
                        required={form.multiBranchAccess === "N"}
                      >
                        <option value="">Select login branch</option>
                        {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="um-gap">
                    <Field label="Login on holidays" required>
                      <Segmented value={form.loginOnHolidays} onChange={(v) => set("loginOnHolidays", v)} />
                    </Field>
                  </div>
                </Section>

                <Section icon={Clock3} title="Login & session" subtitle="Allowed login window and session security">
                  <div className="um-grid g3">
                    <Field label="Login time">
                      <input className="form-input um-input" type="time" name="loginTime" value={form.loginTime} onChange={handleChange} />
                    </Field>
                    <Field label="Logout time">
                      <input className="form-input um-input" type="time" name="logoutTime" value={form.logoutTime} onChange={handleChange} />
                    </Field>
                    <Field label="Inactive session timeout (sec)" required>
                      <input className="form-input um-input" type="number" min="60" name="inactiveSessionTimeout" value={form.inactiveSessionTimeout} onChange={handleChange} placeholder="900" />
                    </Field>
                  </div>
                  <div className="um-gap um-narrow">
                    <Field label="No. of bad logins" hint="Current failed login attempt count. Backend should enforce the lockout policy.">
                      <input className="form-input um-input" type="number" min="0" name="badLogins" value={form.badLogins} onChange={handleChange} placeholder="0" />
                    </Field>
                  </div>
                </Section>

                <Section icon={CalendarDays} title="Login audit" subtitle="Previous login information kept for audit purposes">
                  <div className="um-grid g2">
                    <Field label="Last login date">
                      <input className="form-input um-input" type="date" name="lastLoginDate" value={form.lastLoginDate} onChange={handleChange} />
                    </Field>
                    <Field label="Last login time">
                      <input className="form-input um-input" type="time" name="lastLoginTime" value={form.lastLoginTime} onChange={handleChange} />
                    </Field>
                  </div>
                  <div className="um-note">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>Backend security integration</strong>
                      <p>
                        User creation APIs, password hashing, 2FA configuration, branch authorization,
                        session timeout enforcement and audit logging will be integrated with the Java
                        backend once the APIs are provided.
                      </p>
                    </div>
                  </div>
                </Section>

                {formError && <div className="um-error" role="alert">{formError}</div>}
              </div>

              <div className="um-foot">
                <span className="um-hint">Fields marked * are mandatory.</span>
                <div className="um-foot-btns">
                  <button type="button" className="outline-button" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="primary-button" disabled={!form.role} style={{ opacity: form.role ? 1 : 0.5, cursor: form.role ? "pointer" : "not-allowed" }}>
                    <Plus size={16} /> Create User
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

/* ---------- styles (scoped with the um- prefix) ---------- */

const CSS = `
.um-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}
.um-stat{display:flex;align-items:center;gap:14px}
.um-stat-icon{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;flex-shrink:0}
.um-blue{background:#e8f0ff;color:#2457d6}.um-teal{background:#dcf5ef;color:#0b8a72}
.um-violet{background:#eee8ff;color:#6a43d6}.um-amber{background:#fff1d6;color:#b86e00}
.um-stat-value{font-size:28px;font-weight:750;line-height:1;color:#142036;letter-spacing:-.02em}
.um-stat-label{margin-top:6px;font-size:13px;color:#64748b}

.um-toolbar{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.um-search{flex:1 1 320px;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #dbe2ea;border-radius:11px;padding:0 14px;color:#64748b;transition:border-color .15s,box-shadow .15s}
.um-search:focus-within{border-color:#2457d6;box-shadow:0 0 0 4px rgba(36,87,214,.12)}
.um-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;height:44px;font-size:14px;color:#142036}
.um-filter{height:46px;padding:0 34px 0 14px;border:1px solid #dbe2ea;border-radius:11px;background:#fff;color:#334155;font-size:14px;cursor:pointer}
.um-filter:focus-visible{outline:2px solid #2457d6;outline-offset:2px}

.um-list-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.um-list-head h3{margin:0;font-size:18px;color:#142036}
.um-list-head p{margin:4px 0 0;font-size:13px;color:#64748b}

.um-empty{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;border:1.5px dashed #d5dde8;border-radius:14px;background:#fafcff}
.um-empty-icon{width:60px;height:60px;border-radius:16px;background:#e8f0ff;color:#2457d6;display:grid;place-items:center;margin-bottom:16px}
.um-empty h3{margin:0 0 6px;color:#142036}.um-empty p{margin:0 0 20px;color:#64748b;max-width:360px}

.um-table-wrap{overflow-x:auto}
.um-table{width:100%;border-collapse:separate;border-spacing:0;min-width:1000px}
.um-table th{text-align:left;font-size:12px;font-weight:650;color:#64748b;padding:12px 14px;background:#f6f8fb;border-bottom:1px solid #e5e9f0;white-space:nowrap}
.um-table th:first-child{border-radius:10px 0 0 10px}.um-table th:last-child{border-radius:0 10px 10px 0}
.um-table td{padding:14px;border-bottom:1px solid #eef1f5;font-size:14px;color:#26334a;vertical-align:middle}
.um-table tbody tr{transition:background .12s}.um-table tbody tr:hover{background:#f8faff}
.um-table small,.um-person small{display:block;margin-top:3px;font-size:12px;color:#7b8798}
.um-person{display:flex;align-items:center;gap:12px}.um-person strong{color:#142036}
.um-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#2457d6,#0b8a72);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:700;flex-shrink:0}
.um-badge{display:inline-block;padding:4px 11px;border-radius:8px;font-size:12px;font-weight:650}
.um-role-Maker{background:#dcf5ef;color:#0b6b59}.um-role-Checker{background:#eee8ff;color:#5632b5}.um-role-Viewer{background:#fff1d6;color:#8f5600}
.um-pill{display:inline-block;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:650}
.um-pill.ok{background:#dcf5e6;color:#0f7a3f}.um-pill.warn{background:#fff1d6;color:#8f5600}
.um-dot{display:inline-flex;align-items:center;gap:7px;font-size:13px}
.um-dot:before{content:"";width:8px;height:8px;border-radius:50%}
.um-dot.on:before{background:#16a35a}.um-dot.off:before{background:#a3adbb}
.um-actions{display:flex;gap:7px;border-bottom:1px solid #eef1f5}

/* modal */
.um-overlay{position:fixed;inset:0;z-index:2000;background:rgba(15,23,42,.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;animation:um-fade .18s ease-out}
.um-modal{width:100%;max-width:1060px;max-height:94vh;display:flex;flex-direction:column;background:#fff;border-radius:20px;box-shadow:0 30px 90px rgba(15,23,42,.35);overflow:hidden;animation:um-pop .22s ease-out}
.um-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:20px 28px;border-bottom:1px solid #e5e9f0}
.um-modal-title{display:flex;align-items:center;gap:14px;min-width:0}
.um-modal-title h2{margin:0;font-size:21px;font-weight:750;color:#142036}
.um-modal-title p{margin:3px 0 0;font-size:13px;color:#64748b}
.um-close{border:0;background:#f1f4f8;width:38px;height:38px;border-radius:10px;cursor:pointer;display:grid;place-items:center;flex-shrink:0;color:#334155}
.um-close:hover{background:#e5e9f0}
.um-form{display:flex;flex-direction:column;min-height:0;flex:1}
.um-body{padding:26px 28px 8px;overflow-y:auto;flex:1}
.um-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 28px;border-top:1px solid #e5e9f0;background:#fff}
.um-foot-btns{display:flex;gap:10px}

.um-section{margin-bottom:28px;padding:20px;border:1px solid #e8ecf2;border-radius:16px;background:#fcfdff}
.um-section-head{display:flex;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #e8ecf2}
.um-section-head h4{margin:0;font-size:15px;font-weight:700;color:#142036}
.um-section-head p{margin:2px 0 0;font-size:12px;color:#8592a5}
.um-section-icon{width:36px;height:36px;border-radius:10px;background:#e8f0ff;color:#2457d6;display:grid;place-items:center;flex-shrink:0}
.um-section-icon.um-lg{width:44px;height:44px;border-radius:12px}

.um-grid{display:grid;gap:18px}.g2{grid-template-columns:repeat(2,minmax(0,1fr))}.g3{grid-template-columns:repeat(3,minmax(0,1fr))}
.um-gap{margin-top:18px}.um-narrow{max-width:360px}
.um-field{min-width:0}
.um-label{display:block;margin-bottom:7px;font-size:13px;font-weight:600;color:#334155}
.um-req{color:#dc2626}
.um-hint{margin-top:6px;font-size:11.5px;line-height:1.5;color:#7b8798}
.um-input{width:100%;box-sizing:border-box;height:44px;padding:0 13px;border:1px solid #d5dde8;border-radius:10px;background:#fff;font-size:14px;color:#142036;transition:border-color .15s,box-shadow .15s}
.um-input:focus{outline:0;border-color:#2457d6;box-shadow:0 0 0 4px rgba(36,87,214,.12)}
.um-input:disabled{background:#f1f4f8;color:#8592a5;cursor:not-allowed}

.um-pw{position:relative}.um-pw .um-input{padding-right:46px}
.um-pw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:transparent;width:34px;height:34px;border-radius:8px;cursor:pointer;color:#64748b}
.um-pw button:hover{background:#f1f4f8}
.um-meter{display:flex;align-items:center;gap:10px;margin-top:9px;font-size:12px;color:#64748b}
.um-meter-bars{display:flex;gap:4px;flex:1}
.um-meter-bars i{flex:1;height:5px;border-radius:3px;background:#e5e9f0}
.um-meter-bars i.lvl-1,.um-meter-bars i.lvl-2{background:#ef4444}.um-meter-bars i.lvl-3{background:#f59e0b}
.um-meter-bars i.lvl-4{background:#84cc16}.um-meter-bars i.lvl-5{background:#16a34a}
.um-match{margin-top:9px;font-size:12px;font-weight:600}.um-match.ok{color:#15803d}.um-match.bad{color:#dc2626}

.um-seg{display:inline-flex;padding:4px;gap:4px;background:#eef1f6;border-radius:11px}
.um-seg button{min-width:92px;padding:9px 16px;border:0;border-radius:8px;background:transparent;color:#52607a;font-weight:650;font-size:13.5px;cursor:pointer;transition:background .15s,color .15s}
.um-seg button.um-seg-on{background:#fff;color:#2457d6;box-shadow:0 1px 3px rgba(15,23,42,.15)}

.um-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.um-role{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;padding:18px;border-radius:14px;border:1.5px solid #dbe2ea;background:#fff;cursor:pointer;color:#64748b;transition:border-color .15s,background .15s}
.um-role:hover{border-color:#9db6ef}
.um-role.on{border-color:#2457d6;background:#eff4ff;color:#2457d6}
.um-role strong{font-size:14.5px;color:#142036}.um-role span{font-size:12px;line-height:1.5;color:#64748b}
.um-tick{position:absolute;right:12px;top:12px;width:21px;height:21px;border-radius:50%;background:#2457d6;color:#fff!important;display:grid;place-items:center}

.um-note{display:flex;gap:12px;margin-top:18px;padding:14px 16px;border-radius:12px;background:#eff4ff;border:1px solid #d6e2fb;color:#2457d6}
.um-note svg{flex-shrink:0;margin-top:2px}.um-note strong{font-size:13px;color:#142036}
.um-note p{margin:4px 0 0;font-size:12px;line-height:1.55;color:#52607a}
.um-error{margin-bottom:20px;padding:12px 14px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:13px;font-weight:500}

@keyframes um-fade{from{opacity:0}to{opacity:1}}
@keyframes um-pop{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.um-overlay,.um-modal{animation:none}}

/* tablet */
@media (max-width:1024px){
  .um-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .g3{grid-template-columns:repeat(2,minmax(0,1fr))}
}

/* mobile: table becomes stacked cards, modal becomes full screen */
@media (max-width:720px){
  .um-stats{gap:12px}
  .um-stat-value{font-size:24px}
  .um-toolbar .um-filter{flex:1 1 calc(33% - 10px);min-width:0}
  .um-list-head .outline-button{width:100%;justify-content:center}

  .um-table{min-width:0;display:block}
  .um-table thead{display:none}
  .um-table tbody{display:grid;gap:14px}
  .um-table tr{display:block;border:1px solid #e5e9f0;border-radius:14px;padding:6px 14px;background:#fff}
  .um-table td{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:11px 0;border-bottom:1px dashed #e8ecf2;text-align:right}
  .um-table td:before{content:attr(data-label);font-size:12px;font-weight:600;color:#7b8798;text-align:left;flex-shrink:0}
  .um-table td:first-child{text-align:left}.um-table td:first-child:before{display:none}
  .um-table td.um-actions{border-bottom:0;justify-content:flex-end}.um-table td.um-actions:before{display:none}

  .um-overlay{padding:0;align-items:flex-end}
  .um-modal{max-height:100dvh;height:100dvh;border-radius:0}
  .um-modal-head,.um-foot{padding:14px 16px}
  .um-body{padding:16px 14px 4px}
  .um-modal-title p{display:none}
  .um-section{padding:14px;margin-bottom:18px}
  .g2,.g3,.um-roles{grid-template-columns:1fr}
  .um-narrow{max-width:none}
  .um-seg{display:flex}.um-seg button{flex:1;min-width:0}
  .um-foot{flex-direction:column-reverse;align-items:stretch}
  .um-foot .um-hint{text-align:center}
  .um-foot-btns{display:grid;grid-template-columns:1fr 1fr}
  .um-foot-btns button{justify-content:center}
}
@media (max-width:420px){.um-stats{grid-template-columns:1fr 1fr}.um-toolbar .um-filter{flex:1 1 100%}}
`;