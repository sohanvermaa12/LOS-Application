
'use client';

import { useState } from 'react';
import {
  Check,
  CircleAlert,
  Plus,
  Search,
  ShieldCheck,
  X,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';

import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';

const MODULE_PERMISSIONS = [
  { name: 'Dashboard', actions: ['View'] },
  { name: 'Bank Management', actions: ['View', 'Create', 'Edit', 'Delete'] },
  { name: 'User Management', actions: ['View', 'Create', 'Edit', 'Delete'] },
  { name: 'Lead Management', actions: ['View', 'Create', 'Edit', 'Delete', 'Approve'] },
  { name: 'Loan Applications', actions: ['View', 'Create', 'Edit', 'Delete', 'Approve'] },
  { name: 'Applicant Management', actions: ['View', 'Create', 'Edit', 'Delete'] },
  { name: 'Reports', actions: ['View'] },
  { name: 'Settings', actions: ['View', 'Edit'] },
  {
    name: 'Role & Access Management',
    actions: ['View', 'Create', 'Edit', 'Delete'],
  },
];

function RoleAccessPageContent() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [permissions, setPermissions] = useState({});
  const [formError, setFormError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const searchQuery = searchInput.trim().toLowerCase();

  const filteredRoles = roles
    .map((role, index) => ({ ...role, originalIndex: index }))
    .filter((role) =>
      `${role.name} ${role.description}`.toLowerCase().includes(searchQuery)
    );

  const resetForm = () => {
    setRoleName('');
    setDescription('');
    setStatus('Active');
    setPermissions({});
    setFormError('');
    setEditingIndex(null);
  };

  const closePanel = () => {
    setPanelOpen(false);
    resetForm();
  };

  const openCreatePanel = () => {
    resetForm();
    setPanelOpen(true);
  };

  const openEditPanel = (index) => {
    const role = roles[index];

    setRoleName(role.name);
    setDescription(role.description);
    setStatus(role.status);
    setPermissions(role.permissions || {});
    setEditingIndex(index);
    setFormError('');
    setPanelOpen(true);
  };

  const togglePermission = (moduleName, action, checked) => {
    setPermissions((current) => {
      const next = { ...current };
      const moduleActions = new Set(next[moduleName] || []);

      if (checked) {
        moduleActions.add(action);
      } else {
        moduleActions.delete(action);
      }

      next[moduleName] = [...moduleActions];
      return next;
    });
  };

  const toggleModule = (moduleName, actions, checked) => {
    setPermissions((current) => ({
      ...current,
      [moduleName]: checked ? [...actions] : [],
    }));
  };

  const selectAllPermissions = () => {
    const allPermissions = {};

    MODULE_PERMISSIONS.forEach((module) => {
      allPermissions[module.name] = [...module.actions];
    });

    setPermissions(allPermissions);
  };

  const clearAllPermissions = () => {
    setPermissions({});
  };

  const createRole = (event) => {
    event.preventDefault();

    const name = roleName.trim();
    const roleDescription = description.trim();

    if (!name || !roleDescription) {
      setFormError('Enter a role name and description.');
      return;
    }

    const roleData = {
      name,
      description: roleDescription,
      status,
      permissions: { ...permissions },
    };

    if (editingIndex !== null) {
      setRoles((current) =>
        current.map((role, index) =>
          index === editingIndex ? roleData : role
        )
      );
    } else {
      setRoles((current) => [...current, roleData]);
    }

    closePanel();
  };

  const deleteRole = () => {
    if (deleteIndex === null) return;

    setRoles((current) =>
      current.filter((_, index) => index !== deleteIndex)
    );

    setDeleteIndex(null);
  };

  const getPermissionCount = (role) =>
    Object.values(role.permissions || {}).reduce(
      (total, actions) => total + actions.length,
      0
    );

  return (
    <>
      <main className="role-access-page">
        <PageHeader
          title="Role & Access Management"
          action={
            <button
              type="button"
              className="primary-button"
              onClick={openCreatePanel}
            >
              <Plus size={16} /> Add Role
            </button>
          }
        />

        

        <Card className="role-table-card">
          <div className="role-table-toolbar">
            <div>
              <h2>Roles</h2>
              <p>Manage role permissions for this workspace</p>
            </div>

            <form
              className="role-search-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="role-search-field">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search roles"
                  aria-label="Search roles"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </label>

              <button type="submit" className="secondary-button">
                Search
              </button>
            </form>
          </div>

          <div className="role-table-scroll">
            <table className="role-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Assigned Users</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.originalIndex}>
                    <td>
                      <strong className="role-name">{role.name}</strong>
                    </td>

                    <td className="role-description">
                      {role.description}
                    </td>

                    <td>—</td>

                    <td>
                      <span className="role-permission-count">
                        {getPermissionCount(role)} permissions
                      </span>
                    </td>

                    <td>
                      <span
                        className={`role-status ${
                          role.status === 'Active' ? 'active' : 'inactive'
                        }`}
                      >
                        {role.status}
                      </span>
                    </td>

                    <td>
                      <div className="role-row-actions">
                        <button
                          type="button"
                          title="View role"
                          aria-label={`View ${role.name}`}
                          onClick={() => setViewingIndex(role.originalIndex)}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          title="Edit role"
                          aria-label={`Edit ${role.name}`}
                          onClick={() => openEditPanel(role.originalIndex)}
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          className="delete"
                          title="Delete role"
                          aria-label={`Delete ${role.name}`}
                          onClick={() => setDeleteIndex(role.originalIndex)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRoles.length === 0 && (
              <div className="role-empty-state">
                <ShieldCheck size={25} />
                <strong>
                  {searchQuery
                    ? 'No roles match your search'
                    : 'No role data to display'}
                </strong>
                <span>
                  {searchQuery
                    ? 'Try another search term.'
                    : 'Select Add Role to create a role.'}
                </span>
              </div>
            )}
          </div>
        </Card>

        {panelOpen && (
          <div className="role-drawer-backdrop">
            <aside
              className="role-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-drawer-title"
            >
              <header className="role-drawer-header">
                <div>
                  <span>ROLE CONFIGURATION</span>
                  <h2 id="role-drawer-title">
                    {editingIndex !== null ? 'Edit Role' : 'Add Role'}
                  </h2>
                </div>

                <button
                  type="button"
                  className="role-close-button"
                  onClick={closePanel}
                  aria-label="Close role panel"
                >
                  <X size={19} />
                </button>
              </header>

              <form className="role-edit-form" onSubmit={createRole}>
                <div className="role-form-fields">
                  <label>
                    <span>Role Name <b>*</b></span>
                    <input
                      value={roleName}
                      onChange={(event) => {
                        setRoleName(event.target.value);
                        setFormError('');
                      }}
                      maxLength={60}
                      required
                      placeholder="Enter a role name"
                    />
                  </label>

                  <label>
                    <span>Description <b>*</b></span>
                    <textarea
                      value={description}
                      onChange={(event) => {
                        setDescription(event.target.value);
                        setFormError('');
                      }}
                      maxLength={240}
                      rows={3}
                      required
                      placeholder="Describe the role's responsibilities"
                    />
                  </label>

                  <label>
                    <span>Status</span>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </label>
                </div>

                <div className="role-permissions-heading">
                  <div>
                    <h3>Module Permissions</h3>
                    <p>Choose the actions permitted for this role.</p>
                  </div>

                  <div className="role-bulk-actions">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                    >
                      <Check size={14} /> Select all
                    </button>

                    <button
                      type="button"
                      onClick={clearAllPermissions}
                    >
                      <X size={14} /> Clear all
                    </button>
                  </div>
                </div>

                <div className="role-permission-list">
                  {MODULE_PERMISSIONS.map((module) => {
                    const selectedActions = permissions[module.name] || [];
                    const allSelected =
                      module.actions.length > 0 &&
                      module.actions.every((action) =>
                        selectedActions.includes(action)
                      );

                    return (
                      <fieldset
                        className="role-permission-module"
                        key={module.name}
                      >
                        <legend>
                          <label>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(event) =>
                                toggleModule(
                                  module.name,
                                  module.actions,
                                  event.target.checked
                                )
                              }
                            />
                            <strong>{module.name}</strong>
                          </label>

                          <span>
                            {selectedActions.length}/{module.actions.length}
                          </span>
                        </legend>

                        <div className="role-action-checkboxes">
                          {module.actions.map((action) => (
                            <label key={action}>
                              <input
                                type="checkbox"
                                checked={selectedActions.includes(action)}
                                onChange={(event) =>
                                  togglePermission(
                                    module.name,
                                    action,
                                    event.target.checked
                                  )
                                }
                              />
                              {action}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>

                {formError && (
                  <p className="role-form-error" role="alert">
                    {formError}
                  </p>
                )}

                <footer className="role-drawer-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closePanel}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary-button">
                    <Check size={15} />
                    {editingIndex !== null ? 'Update Role' : 'Create Role'}
                  </button>
                </footer>
              </form>
            </aside>
          </div>
        )}

        {viewingIndex !== null && roles[viewingIndex] && (
          <div className="role-drawer-backdrop">
            <aside
              className="role-drawer role-view-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-view-title"
            >
              <header className="role-drawer-header">
                <div>
                  <span>ROLE DETAILS</span>
                  <h2 id="role-view-title">{roles[viewingIndex].name}</h2>
                </div>

                <button
                  type="button"
                  className="role-close-button"
                  onClick={() => setViewingIndex(null)}
                  aria-label="Close role details"
                >
                  <X size={19} />
                </button>
              </header>

              <div className="role-view-content">
                <dl className="role-detail-list">
                  <div>
                    <dt>Role Name</dt>
                    <dd>{roles[viewingIndex].name}</dd>
                  </div>

                  <div>
                    <dt>Status</dt>
                    <dd>{roles[viewingIndex].status}</dd>
                  </div>

                  <div className="role-detail-description">
                    <dt>Description</dt>
                    <dd>{roles[viewingIndex].description}</dd>
                  </div>
                </dl>

                <h3>Module Permissions</h3>

                <div className="role-view-modules">
                  {MODULE_PERMISSIONS.map((module) => {
                    const selected =
                      roles[viewingIndex].permissions?.[module.name] || [];

                    return (
                      <div className="role-view-module" key={module.name}>
                        <strong>{module.name}</strong>

                        {selected.length > 0 ? (
                          <div className="role-view-chips">
                            {selected.map((action) => (
                              <span key={action}>{action}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="role-no-permissions">
                            No permissions selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="primary-button role-view-edit"
                  onClick={() => {
                    const index = viewingIndex;
                    setViewingIndex(null);
                    openEditPanel(index);
                  }}
                >
                  <Pencil size={14} /> Edit Role
                </button>
              </div>
            </aside>
          </div>
        )}

        {deleteIndex !== null && roles[deleteIndex] && (
          <div className="role-delete-backdrop">
            <section
              className="role-delete-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-delete-title"
            >
              <div className="role-delete-icon">
                <Trash2 size={19} />
              </div>

              <h2 id="role-delete-title">Delete Role?</h2>

              <p>
                Are you sure you want to delete{' '}
                <strong>{roles[deleteIndex].name}</strong>?
                This action will remove it from this page session.
              </p>

              <div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setDeleteIndex(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="role-confirm-delete"
                  onClick={deleteRole}
                >
                  Delete Role
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      <style jsx>{`
        .role-access-page {
          padding-bottom: 24px;
        }

        .role-demo-notice {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: -11px 0 18px;
          padding: 11px 13px;
          color: #536d70;
          background: #f1f6f5;
          border: 1px solid #dfeae7;
          border-radius: 6px;
          font-size: 11px;
          line-height: 1.5;
        }

        .role-demo-notice :global(svg) {
          flex: 0 0 auto;
          margin-top: 1px;
          color: #45817b;
        }

        :global(.role-table-card) {
          padding: 0;
          overflow: hidden;
        }

        .role-table-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 20px 22px 17px;
        }

        .role-table-toolbar h2 {
          margin: 0;
          color: #23474c;
          font: 700 15px Manrope, sans-serif;
        }

        .role-table-toolbar p {
          margin: 5px 0 0;
          color: #91a0a3;
          font-size: 11px;
        }

        .role-search-form {
          display: flex;
          width: min(410px, 52%);
          gap: 8px;
        }

        .role-search-field {
          display: flex;
          height: 38px;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          color: #87989a;
          border: 1px solid #d8e2e1;
          border-radius: 6px;
          background: #fff;
        }

        .role-search-field:focus-within {
          border-color: #177e7a;
          box-shadow: 0 0 0 3px rgba(23, 126, 122, 0.08);
        }

        .role-search-field input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          color: #345256;
          background: transparent;
          font-size: 11px;
        }

        .role-search-form :global(.secondary-button) {
          height: 38px;
        }

        .role-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .role-table {
          min-width: 890px;
        }

        .role-table th {
          padding: 12px 13px;
          white-space: nowrap;
        }

        .role-table td {
          padding: 13px;
          vertical-align: middle;
        }

        .role-table th:first-child,
        .role-table td:first-child {
          padding-left: 22px;
        }

        .role-table th:last-child,
        .role-table td:last-child {
          padding-right: 22px;
        }

        .role-name {
          color: #34575c;
          font-size: 11px;
        }

        .role-description {
          max-width: 260px;
          color: #78898b;
          line-height: 1.5;
          white-space: normal;
        }

        .role-permission-count {
          color: #5c777a;
          font-size: 10px;
          white-space: nowrap;
        }

        .role-status {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .role-status.active {
          color: #2b815b;
          background: #e6f3eb;
        }

        .role-status.inactive {
          color: #8b6860;
          background: #f4eae7;
        }

        .role-row-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .role-row-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #247976;
        }

        .role-row-actions button:hover {
          color: #0c5d5d;
        }

        .role-row-actions button.delete {
          color: #b15d52;
        }

        .role-empty-state {
          display: grid;
          min-height: 175px;
          place-content: center;
          justify-items: center;
          gap: 8px;
          padding: 25px;
          color: #91a2a3;
          text-align: center;
          font-size: 11px;
        }

        .role-empty-state strong {
          color: #526d70;
          font-size: 13px;
        }

        .role-drawer-backdrop,
        .role-delete-backdrop {
          position: fixed;
          inset: 0;
          z-index: 8;
          display: flex;
          justify-content: flex-end;
          background: rgba(17, 38, 42, 0.38);
        }

        .role-drawer {
          display: flex;
          flex-direction: column;
          width: min(640px, 100%);
          height: 100%;
          background: #f8faf9;
          box-shadow: -15px 0 50px rgba(16, 42, 45, 0.16);
        }

        .role-drawer-header {
          display: flex;
          flex: 0 0 auto;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 22px 25px 17px;
          border-bottom: 1px solid #e4ecea;
          background: #fff;
        }

        .role-drawer-header > div > span {
          color: #89999a;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
        }

        .role-drawer-header h2 {
          margin: 5px 0 0;
          color: #173e46;
          font: 700 20px Manrope, sans-serif;
        }

        .role-close-button {
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          color: #718286;
          border-radius: 6px;
        }

        .role-close-button:hover {
          background: #eff4f2;
        }

        .role-edit-form {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
          overflow-y: auto;
          padding: 18px 24px 0;
        }

        .role-form-fields {
          display: grid;
          gap: 13px;
        }

        .role-form-fields label {
          display: grid;
          gap: 6px;
          color: #52696c;
          font-size: 11px;
          font-weight: 700;
        }

        .role-form-fields label b {
          color: #bd6a52;
        }

        .role-form-fields input,
        .role-form-fields textarea,
        .role-form-fields select {
          width: 100%;
          padding: 10px 11px;
          color: #345256;
          border: 1px solid #d8e2e1;
          border-radius: 6px;
          outline: none;
          background: #fff;
          font: 11px 'DM Sans', sans-serif;
        }

        .role-form-fields input,
        .role-form-fields select {
          height: 38px;
        }

        .role-form-fields textarea {
          resize: vertical;
        }

        .role-form-fields input:focus,
        .role-form-fields textarea:focus,
        .role-form-fields select:focus {
          border-color: #177e7a;
          box-shadow: 0 0 0 3px rgba(23, 126, 122, 0.08);
        }

        .role-permissions-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
          margin: 22px 0 10px;
        }

        .role-permissions-heading h3 {
          margin: 0;
          color: #315357;
          font: 700 13px Manrope, sans-serif;
        }

        .role-permissions-heading p {
          margin: 4px 0 0;
          color: #89999a;
          font-size: 10px;
        }

        .role-bulk-actions {
          display: flex;
          gap: 12px;
        }

        .role-bulk-actions button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #167c78;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .role-permission-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          padding-bottom: 18px;
        }

        .role-permission-module {
          min-width: 0;
          margin: 0;
          padding: 9px 0;
          border: 0;
          border-bottom: 1px solid #e5ebe9;
          border-radius: 0;
          background: transparent;
        }

        .role-permission-module legend {
          width: 100%;
          padding: 0;
        }

        .role-permission-module legend label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #456367;
          font-size: 11px;
          cursor: pointer;
        }

        .role-permission-module legend > span {
          float: right;
          color: #93a0a1;
          font-size: 9px;
        }

        .role-permission-module input {
          accent-color: #177e7a;
          cursor: pointer;
        }

        .role-action-checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 17px;
          padding: 8px 0 0 24px;
        }

        .role-action-checkboxes label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #728386;
          font-size: 10px;
          cursor: pointer;
        }

        .role-form-error {
          margin: 0 0 10px;
          color: #ae5148;
          font-size: 11px;
        }

        .role-drawer-footer {
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin: auto -24px 0;
          padding: 13px 24px;
          border-top: 1px solid #e2eae8;
          background: #fff;
        }

        .role-drawer-footer :global(button) {
          height: 38px;
        }

        .role-view-content {
          flex: 1;
          overflow-y: auto;
          padding: 22px 25px;
        }

        .role-detail-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
          margin: 0 0 24px;
        }

        .role-detail-list div {
          min-width: 0;
        }

        .role-detail-description {
          grid-column: 1 / -1;
        }

        .role-detail-list dt {
          margin-bottom: 5px;
          color: #879698;
          font-size: 10px;
        }

        .role-detail-list dd {
          margin: 0;
          color: #3c5c60;
          font-size: 12px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .role-view-content h3 {
          margin: 0 0 12px;
          color: #315357;
          font: 700 13px Manrope, sans-serif;
        }

        .role-view-modules {
          display: grid;
          gap: 8px;
        }

        .role-view-module {
          padding: 11px 12px;
          border: 1px solid #e1e9e7;
          border-radius: 7px;
          background: #fff;
        }

        .role-view-module > strong {
          display: block;
          margin-bottom: 8px;
          color: #456367;
          font-size: 11px;
        }

        .role-view-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .role-view-chips span {
          padding: 4px 7px;
          color: #2b7b70;
          border-radius: 12px;
          background: #e8f3ef;
          font-size: 9px;
          font-weight: 700;
        }

        .role-no-permissions {
          color: #9aa6a7;
          font-size: 10px;
        }

        .role-view-edit {
          margin-top: 20px;
        }

        .role-delete-backdrop {
          z-index: 9;
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .role-delete-dialog {
          width: min(420px, 100%);
          padding: 24px;
          border: 1px solid #e3eae8;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 20px 60px rgba(16, 42, 45, 0.2);
        }

        .role-delete-icon {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          color: #ad5c50;
          border-radius: 9px;
          background: #f9eae7;
        }

        .role-delete-dialog h2 {
          margin: 14px 0 7px;
          color: #284a4f;
          font: 700 17px Manrope, sans-serif;
        }

        .role-delete-dialog p {
          margin: 0;
          color: #738487;
          font-size: 11px;
          line-height: 1.6;
        }

        .role-delete-dialog > div {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 22px;
        }

        .role-confirm-delete {
          height: 38px;
          padding: 0 14px;
          color: #fff;
          border-radius: 6px;
          background: #a94c43;
          font-size: 11px;
          font-weight: 700;
        }

        .role-confirm-delete:hover {
          background: #913c35;
        }

        @media (max-width: 720px) {
          :global(.page-header) {
            align-items: flex-start;
            flex-direction: column;
          }

          .role-table-toolbar {
            align-items: stretch;
            flex-direction: column;
            padding: 17px 15px 14px;
          }

          .role-search-form {
            width: 100%;
          }

          .role-drawer-header {
            padding-right: 17px;
            padding-left: 17px;
          }

          .role-edit-form {
            padding-right: 16px;
            padding-left: 16px;
          }

          .role-drawer-footer {
            margin-right: -16px;
            margin-left: -16px;
            padding-right: 16px;
            padding-left: 16px;
          }

          .role-permissions-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 420px) {
          .role-search-form {
            flex-wrap: wrap;
          }

          .role-search-field {
            flex-basis: 100%;
          }

          .role-search-form :global(.secondary-button) {
            flex: 1;
          }

          .role-bulk-actions {
            width: 100%;
            justify-content: space-between;
          }

          .role-detail-list {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .role-detail-description {
            grid-column: auto;
          }

          .role-drawer-footer {
            justify-content: stretch;
          }

          .role-drawer-footer :global(button) {
            flex: 1;
          }
        }
      `}</style>
    </>
  );
}

export default function RoleAccessPage() {
  return (
    <AppShell title="Role & Access Management">
      <RoleAccessPageContent />
    </AppShell>
  );
}
