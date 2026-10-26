'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCheck,
  CircleAlert,
  Eye,
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import { PermissionGate, useAccessControl } from '../../components/AccessControl';
import { getUsers } from '../../services/leadService';
import {
  PERMISSION_MODULES,
  readStoredRoles,
  saveRoles,
} from '../../lib/rbac';

function createEmptyPermissions() {
  return Object.fromEntries(
    PERMISSION_MODULES.flatMap((module) =>
      module.actions.map((action) => [`${module.id}.${action}`, false])
    )
  );
}

function createEmptyRole() {
  return {
    id: '',
    name: '',
    description: '',
    status: 'Active',
    isSystem: false,
    permissions: createEmptyPermissions(),
  };
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function assignedRoleIds(user) {
  return [
    user.systemRole, user.system_role, user.userRole, user.user_role, user.role,
  ].filter((value) => typeof value === 'string').map(normalize);
}

function isAssignedToRole(user, role) {
  const userRoles = assignedRoleIds(user);
  return userRoles.includes(normalize(role.id)) || userRoles.includes(normalize(role.name));
}

function selectedPermissionCount(role) {
  return Object.values(role.permissions || {}).filter(Boolean).length;
}

function RoleAccessPageContent() {
  const { hasPermission } = useAccessControl();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [rolesError, setRolesError] = useState('');
  const [usersError, setUsersError] = useState('');
  const [notification, setNotification] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [panelMode, setPanelMode] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    try {
      setRoles(readStoredRoles());
    } catch (error) {
      setRolesError(error instanceof Error ? error.message : 'Unable to read saved roles.');
    } finally {
      setLoadingRoles(false);
    }

    getUsers()
      .then((records) => {
        if (!cancelled) setUsers(records);
      })
      .catch((error) => {
        if (!cancelled) setUsersError(error instanceof Error ? error.message : 'Unable to load assigned user counts.');
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRoles = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return roles;
    return roles.filter((role) =>
      `${role.name} ${role.description}`.toLowerCase().includes(query)
    );
  }, [roles, searchQuery]);

  const showNotification = (type, message) => setNotification({ type, message });

  const openCreate = () => {
    setActiveRole(createEmptyRole());
    setPanelMode('create');
    setFormError('');
  };

  const openEdit = (role) => {
    setActiveRole({
      ...role,
      permissions: { ...createEmptyPermissions(), ...(role.permissions || {}) },
    });
    setPanelMode('edit');
    setFormError('');
  };

  const saveRole = (event) => {
    event.preventDefault();
    if (saving) return;

    const name = activeRole.name.trim();
    const description = activeRole.description.trim();
    if (!name) {
      setFormError('Enter a role name.');
      return;
    }
    if (!description) {
      setFormError('Enter a description for this role.');
      return;
    }
    if (roles.some((role) => normalize(role.name) === normalize(name) && role.id !== activeRole.id)) {
      setFormError('A role with this name already exists.');
      return;
    }

    const roleToSave = {
      ...activeRole,
      id: activeRole.id || `CUSTOM_${Date.now()}`,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };
    const nextRoles = panelMode === 'edit'
      ? roles.map((role) => role.id === activeRole.id ? roleToSave : role)
      : [...roles, roleToSave];

    setSaving(true);
    try {
      saveRoles(nextRoles);
      setRoles(nextRoles);
      setActiveRole(null);
      setPanelMode('');
      setFormError('');
      showNotification('success', `Role “${name}” ${panelMode === 'edit' ? 'updated' : 'created'} in this browser.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save the role in browser storage.');
      showNotification('error', 'The role could not be saved. Check browser storage and try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete || !hasPermission('role-access', 'delete')) return;
    const nextRoles = roles.filter((role) => role.id !== pendingDelete.id);
    try {
      saveRoles(nextRoles);
      setRoles(nextRoles);
      showNotification('success', `Role “${pendingDelete.name}” was deleted from this browser.`);
      setPendingDelete(null);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Unable to delete the role.');
    }
  };

  const updatePermission = (key, checked) => {
    setActiveRole((previous) => ({
      ...previous,
      permissions: { ...previous.permissions, [key]: checked },
    }));
  };

  const setAllPermissions = (checked) => {
    setActiveRole((previous) => ({
      ...previous,
      permissions: Object.fromEntries(
        Object.keys(createEmptyPermissions()).map((key) => [key, checked])
      ),
    }));
  };

  const setModulePermissions = (module, checked) => {
    setActiveRole((previous) => ({
      ...previous,
      permissions: {
        ...previous.permissions,
        ...Object.fromEntries(module.actions.map((action) => [`${module.id}.${action}`, checked])),
      },
    }));
  };

  const assignedCount = (role) => {
    if (loadingUsers) return '…';
    if (usersError) return '—';
    return users.filter((user) => isAssignedToRole(user, role)).length;
  };

  return (
    <>
      <main className="role-access-page">
        <PageHeader
          // eyebrow="ADMINISTRATION"
          title="Role & Access Management"
          // description="Create roles and control which areas of the LOS each role can access."
          action={(
            <PermissionGate module="role-access" action="create">
              <button type="button" className="primary-button" onClick={openCreate}>
                <Plus size={16} /> Add Role
              </button>
            </PermissionGate>
          )}
        />

        <div className="role-demo-notice" role="note">
          <CircleAlert size={17} />
          <span>
            Role changes are stored in this browser only. The backend has no role-management API; these UI checks are not authorization or a security boundary.
          </span>
        </div>

        {notification && (
          <div className={`role-notification ${notification.type}`} role={notification.type === 'error' ? 'alert' : 'status'}>
            <span>{notification.message}</span>
            <button type="button" onClick={() => setNotification(null)} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        )}

        <Card className="role-table-card">
          <div className="role-table-toolbar">
            <div>
              <h2>Roles</h2>
              <p>Manage role permissions for this workspace</p>
            </div>
            <form className="role-search-form" onSubmit={(event) => {
              event.preventDefault();
              setSearchQuery(searchInput.trim());
            }}>
              <label className="role-search-field">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search roles"
                  aria-label="Search roles"
                />
              </label>
              <button type="submit" className="secondary-button">Search</button>
            </form>
          </div>

          {rolesError && (
            <div className="role-load-error" role="alert">
              <CircleAlert size={16} /> {rolesError}
            </div>
          )}
          {usersError && (
            <div className="role-user-warning" role="status">
              Assigned user counts are unavailable: {usersError}
            </div>
          )}

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
                {!loadingRoles && filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <strong className="role-name">{role.name}</strong>
                      {role.isSystem && <span className="role-system-label">System role</span>}
                    </td>
                    <td className="role-description">{role.description}</td>
                    <td>{assignedCount(role)}</td>
                    <td>
                      <span className="role-permission-count">
                        <KeyRound size={13} /> {selectedPermissionCount(role)} permissions
                      </span>
                    </td>
                    <td>
                      <span className={`role-status ${role.status === 'Active' ? 'active' : 'inactive'}`}>
                        {role.status}
                      </span>
                    </td>
                    <td>
                      <div className="role-row-actions">
                        <button type="button" onClick={() => { setActiveRole(role); setPanelMode('view'); }}>
                          <Eye size={15} /> <span>View</span>
                        </button>
                        {hasPermission('role-access', 'edit') && (
                          <button type="button" onClick={() => openEdit(role)} aria-label={`Edit ${role.name}`}>
                            <Pencil size={15} /> <span>Edit</span>
                          </button>
                        )}
                        {hasPermission('role-access', 'delete') && (
                          <button
                            type="button"
                            className="delete"
                            onClick={() => setPendingDelete(role)}
                            disabled={role.isSystem}
                            title={role.isSystem ? 'System roles cannot be deleted.' : `Delete ${role.name}`}
                            aria-label={`Delete ${role.name}`}
                          >
                            <Trash2 size={15} /> <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loadingRoles && <div className="role-empty-state" role="status">Loading saved roles…</div>}
            {!loadingRoles && !rolesError && filteredRoles.length === 0 && (
              <div className="role-empty-state">
                <ShieldCheck size={25} />
                <strong>{roles.length ? 'No roles match your search' : 'No roles have been created'}</strong>
                <span>{roles.length ? 'Try another search term.' : 'Add a role to configure access permissions.'}</span>
              </div>
            )}
          </div>
        </Card>

        {activeRole && (
          <div className="role-drawer-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveRole(null);
              setPanelMode('');
            }
          }}>
            <aside className="role-drawer" role="dialog" aria-modal="true" aria-labelledby="role-drawer-title">
              <header className="role-drawer-header">
                <div>
                  <span>{panelMode === 'view' ? 'ROLE DETAILS' : 'ROLE CONFIGURATION'}</span>
                  <h2 id="role-drawer-title">
                    {panelMode === 'create' ? 'Add Role' : panelMode === 'edit' ? 'Edit Role' : activeRole.name}
                  </h2>
                </div>
                <button type="button" className="role-close-button" onClick={() => {
                  setActiveRole(null);
                  setPanelMode('');
                }} aria-label="Close role panel"><X size={19} /></button>
              </header>

              {panelMode === 'view' ? (
                <div className="role-view-content">
                  <dl className="role-detail-list">
                    <div><dt>Role name</dt><dd>{activeRole.name}</dd></div>
                    <div><dt>Description</dt><dd>{activeRole.description}</dd></div>
                    <div><dt>Assigned users</dt><dd>{usersError ? 'Unavailable' : assignedCount(activeRole)}</dd></div>
                    <div><dt>Status</dt><dd>{activeRole.status}</dd></div>
                  </dl>
                  <h3>Permissions</h3>
                  <div className="role-view-modules">
                    {PERMISSION_MODULES.map((module) => {
                      const actions = module.actions.filter((action) => activeRole.permissions?.[`${module.id}.${action}`]);
                      return (
                        <section className="role-view-module" key={module.id}>
                          <strong>{module.label}</strong>
                          {actions.length ? (
                            <div className="role-view-chips">
                              {actions.map((action) => <span key={action}>{action}</span>)}
                            </div>
                          ) : <span className="role-no-permissions">No permissions assigned</span>}
                        </section>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form className="role-edit-form" onSubmit={saveRole}>
                  <div className="role-form-fields">
                    <label>
                      <span>Role Name <b>*</b></span>
                      <input
                        value={activeRole.name}
                        onChange={(event) => setActiveRole((role) => ({ ...role, name: event.target.value }))}
                        maxLength={60}
                        required
                        placeholder="e.g. Loan Reviewer"
                      />
                    </label>
                    <label>
                      <span>Description <b>*</b></span>
                      <textarea
                        value={activeRole.description}
                        onChange={(event) => setActiveRole((role) => ({ ...role, description: event.target.value }))}
                        maxLength={240}
                        rows={3}
                        required
                        placeholder="Describe the role's responsibilities"
                      />
                    </label>
                    <label>
                      <span>Status</span>
                      <select
                        value={activeRole.status}
                        onChange={(event) => setActiveRole((role) => ({ ...role, status: event.target.value }))}
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
                      <button type="button" onClick={() => setAllPermissions(true)}><CheckCheck size={14} /> Select all</button>
                      <button type="button" onClick={() => setAllPermissions(false)}><X size={14} /> Clear all</button>
                    </div>
                  </div>

                  <div className="role-permission-list">
                    {PERMISSION_MODULES.map((module) => {
                      const selectedCount = module.actions.filter((action) => activeRole.permissions[`${module.id}.${action}`]).length;
                      const allSelected = selectedCount === module.actions.length;
                      return (
                        <fieldset className="role-permission-module" key={module.id}>
                          <legend>
                            <label>
                              <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(element) => {
                                  if (element) element.indeterminate = selectedCount > 0 && !allSelected;
                                }}
                                onChange={(event) => setModulePermissions(module, event.target.checked)}
                                aria-label={`Select all ${module.label} permissions`}
                              />
                              <strong>{module.label}</strong>
                            </label>
                            <span>{selectedCount}/{module.actions.length}</span>
                          </legend>
                          <div className="role-action-checkboxes">
                            {module.actions.map((action) => {
                              const key = `${module.id}.${action}`;
                              return (
                                <label key={key}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(activeRole.permissions[key])}
                                    onChange={(event) => updatePermission(key, event.target.checked)}
                                  />
                                  <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>

                  {formError && <p className="role-form-error" role="alert">{formError}</p>}
                  <footer className="role-drawer-footer">
                    <button type="button" className="secondary-button" onClick={() => {
                      setActiveRole(null);
                      setPanelMode('');
                    }}>Cancel</button>
                    <button type="submit" className="primary-button" disabled={saving}>
                      <Check size={15} /> {saving ? 'Saving…' : panelMode === 'edit' ? 'Save Changes' : 'Create Role'}
                    </button>
                  </footer>
                </form>
              )}
            </aside>
          </div>
        )}

        {pendingDelete && (
          <div className="role-delete-backdrop">
            <section className="role-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="role-delete-title">
              <span className="role-delete-icon"><Trash2 size={19} /></span>
              <h2 id="role-delete-title">Delete role?</h2>
              <p>“{pendingDelete.name}” will be removed from this browser. This does not change any backend user assignments.</p>
              <div>
                <button type="button" className="secondary-button" onClick={() => setPendingDelete(null)}>Cancel</button>
                <button type="button" className="role-confirm-delete" onClick={confirmDelete}>Delete Role</button>
              </div>
            </section>
          </div>
        )}
      </main>

      <style jsx>{`
        .role-access-page { padding-bottom: 24px; }
        .role-demo-notice, .role-notification, .role-load-error, .role-user-warning {
          display: flex; align-items: flex-start; gap: 9px; border-radius: 6px; font-size: 11px; line-height: 1.5;
        }
        .role-demo-notice { margin: -11px 0 18px; padding: 11px 13px; color: #536d70; background: #f1f6f5; border: 1px solid #dfeae7; }
        .role-demo-notice :global(svg) { flex: 0 0 auto; margin-top: 1px; color: #45817b; }
        .role-notification { justify-content: space-between; align-items: center; margin: 0 0 14px; padding: 11px 13px; }
        .role-notification.success { color: #28714f; background: #eaf5ee; border: 1px solid #d6ebdd; }
        .role-notification.error, .role-load-error { color: #9d493d; background: #fff4f1; border: 1px solid #f1d9d3; }
        .role-notification button { display: grid; place-items: center; color: inherit; }
        :global(.role-table-card) { padding: 0; overflow: hidden; }
        .role-table-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 22px 17px; }
        .role-table-toolbar h2 { margin: 0; color: #23474c; font: 700 15px Manrope, sans-serif; }
        .role-table-toolbar p { margin: 5px 0 0; color: #91a0a3; font-size: 11px; }
        .role-search-form { display: flex; width: min(410px, 52%); gap: 8px; }
        .role-search-field { display: flex; height: 38px; min-width: 0; flex: 1; align-items: center; gap: 8px; padding: 0 10px; color: #87989a; border: 1px solid #d8e2e1; border-radius: 6px; background: #fff; }
        .role-search-field:focus-within { border-color: #177e7a; box-shadow: 0 0 0 3px rgba(23,126,122,.08); }
        .role-search-field input { width: 100%; min-width: 0; border: 0; outline: 0; color: #345256; background: transparent; font-size: 11px; }
        .role-search-form :global(.secondary-button) { height: 38px; }
        .role-load-error, .role-user-warning { margin: 0 22px 13px; padding: 10px 12px; }
        .role-user-warning { color: #7b6743; background: #fbf5e8; border: 1px solid #f0e3c8; }
        .role-load-error :global(svg) { flex: 0 0 auto; }
        .role-table-scroll { width: 100%; overflow-x: auto; }
        .role-table { min-width: 890px; }
        .role-table th { padding: 12px 13px; white-space: nowrap; }
        .role-table td { padding: 13px; vertical-align: middle; }
        .role-table th:first-child, .role-table td:first-child { padding-left: 22px; }
        .role-table th:last-child, .role-table td:last-child { padding-right: 22px; }
        .role-name { color: #34575c; font-size: 11px; }
        .role-system-label { display: block; margin-top: 4px; color: #9aa7a8; font-size: 9px; }
        .role-description { max-width: 260px; color: #78898b; line-height: 1.5; white-space: normal; }
        .role-permission-count { display: inline-flex; align-items: center; gap: 5px; color: #5c777a; font-size: 10px; white-space: nowrap; }
        .role-status { display: inline-flex; align-items: center; padding: 5px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; }
        .role-status.active { color: #2b815b; background: #e6f3eb; }
        .role-status.inactive { color: #8b6860; background: #f4eae7; }
        .role-row-actions { display: flex; align-items: center; gap: 12px; }
        .role-row-actions button { display: inline-flex; align-items: center; gap: 4px; color: #247976; font-size: 10px; font-weight: 700; }
        .role-row-actions button:hover { color: #0c5d5d; }
        .role-row-actions button.delete { color: #b15d52; }
        .role-row-actions button:disabled { cursor: not-allowed; opacity: .45; }
        .role-empty-state { display: grid; min-height: 175px; place-content: center; justify-items: center; gap: 8px; padding: 25px; color: #91a2a3; text-align: center; font-size: 11px; }
        .role-empty-state strong { color: #526d70; font-size: 13px; }
        .role-drawer-backdrop, .role-delete-backdrop { position: fixed; inset: 0; z-index: 8; display: flex; justify-content: flex-end; background: rgba(17,38,42,.38); }
        .role-drawer { display: flex; flex-direction: column; width: min(640px, 100%); height: 100%; background: #f8faf9; box-shadow: -15px 0 50px rgba(16,42,45,.16); }
        .role-drawer-header { display: flex; flex: 0 0 auto; align-items: flex-start; justify-content: space-between; gap: 15px; padding: 22px 25px 17px; border-bottom: 1px solid #e4ecea; background: #fff; }
        .role-drawer-header>div>span { color: #89999a; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; }
        .role-drawer-header h2 { margin: 5px 0 0; color: #173e46; font: 700 20px Manrope, sans-serif; }
        .role-close-button { display: grid; width: 32px; height: 32px; place-items: center; color: #718286; border-radius: 6px; }
        .role-close-button:hover { background: #eff4f2; }
        .role-edit-form, .role-view-content { flex: 1; overflow-y: auto; }
        .role-edit-form { padding: 18px 24px 0; }
        .role-form-fields { display: grid; gap: 13px; }
        .role-form-fields label { display: grid; gap: 6px; color: #52696c; font-size: 11px; font-weight: 700; }
        .role-form-fields label b { color: #bd6a52; }
        .role-form-fields input, .role-form-fields textarea, .role-form-fields select { width: 100%; padding: 10px 11px; color: #345256; border: 1px solid #d8e2e1; border-radius: 6px; outline: none; background: #fff; font: 11px 'DM Sans', sans-serif; }
        .role-form-fields input, .role-form-fields select { height: 38px; }
        .role-form-fields textarea { resize: vertical; }
        .role-form-fields input:focus, .role-form-fields textarea:focus, .role-form-fields select:focus { border-color: #177e7a; box-shadow: 0 0 0 3px rgba(23,126,122,.08); }
        .role-permissions-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; margin: 22px 0 10px; }
        .role-permissions-heading h3, .role-view-content h3 { margin: 0; color: #315357; font: 700 13px Manrope, sans-serif; }
        .role-permissions-heading p { margin: 4px 0 0; color: #89999a; font-size: 10px; }
        .role-bulk-actions { display: flex; gap: 9px; }
        .role-bulk-actions button { display: inline-flex; align-items: center; gap: 4px; color: #167c78; font-size: 10px; font-weight: 700; white-space: nowrap; }
        .role-permission-list { display: grid; gap: 8px; padding-bottom: 18px; }
        .role-permission-module { min-width: 0; margin: 0; padding: 0; border: 1px solid #e1e9e7; border-radius: 7px; background: #fff; }
        .role-permission-module legend { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 11px 7px; }
        .role-permission-module legend label { display: inline-flex; align-items: center; gap: 8px; color: #456367; font-size: 11px; cursor: pointer; }
        .role-permission-module legend>span { color: #93a0a1; font-size: 9px; }
        .role-permission-module input { accent-color: #177e7a; }
        .role-action-checkboxes { display: flex; flex-wrap: wrap; gap: 8px 16px; padding: 3px 11px 11px 30px; }
        .role-action-checkboxes label { display: inline-flex; align-items: center; gap: 5px; color: #728386; font-size: 10px; cursor: pointer; }
        .role-form-error { margin: 0 0 10px; color: #ae5148; font-size: 11px; }
        .role-drawer-footer { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 9px; margin: 0 -24px; padding: 13px 24px; border-top: 1px solid #e2eae8; background: #fff; }
        .role-drawer-footer :global(button) { height: 38px; }
        .role-view-content { padding: 22px 25px; }
        .role-detail-list { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; margin: 0 0 24px; }
        .role-detail-list div { min-width: 0; }
        .role-detail-list dt { margin-bottom: 5px; color: #879698; font-size: 10px; }
        .role-detail-list dd { margin: 0; color: #3c5c60; font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        .role-view-content h3 { margin-bottom: 12px; }
        .role-view-modules { display: grid; gap: 8px; }
        .role-view-module { padding: 11px 12px; border: 1px solid #e1e9e7; border-radius: 7px; background: #fff; }
        .role-view-module>strong { display: block; margin-bottom: 8px; color: #456367; font-size: 11px; }
        .role-view-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .role-view-chips span { padding: 4px 7px; color: #2b7b70; border-radius: 12px; background: #e8f3ef; font-size: 9px; font-weight: 700; }
        .role-no-permissions { color: #9aa6a7; font-size: 10px; }
        .role-delete-backdrop { z-index: 9; display: grid; place-items: center; padding: 20px; }
        .role-delete-dialog { width: min(420px, 100%); padding: 24px; border: 1px solid #e3eae8; border-radius: 10px; background: #fff; box-shadow: 0 20px 60px rgba(16,42,45,.2); }
        .role-delete-icon { display: grid; width: 38px; height: 38px; place-items: center; color: #ad5c50; border-radius: 9px; background: #f9eae7; }
        .role-delete-dialog h2 { margin: 14px 0 7px; color: #284a4f; font: 700 17px Manrope, sans-serif; }
        .role-delete-dialog p { margin: 0; color: #738487; font-size: 11px; line-height: 1.6; }
        .role-delete-dialog>div { display: flex; justify-content: flex-end; gap: 9px; margin-top: 22px; }
        .role-confirm-delete { height: 38px; padding: 0 14px; color: #fff; border-radius: 6px; background: #a94c43; font-size: 11px; font-weight: 700; }
        .role-confirm-delete:hover { background: #913c35; }
        @media (max-width: 720px) {
          :global(.page-header) { align-items: flex-start; flex-direction: column; }
          .role-table-toolbar { align-items: stretch; flex-direction: column; padding: 17px 15px 14px; }
          .role-search-form { width: 100%; }
          .role-load-error, .role-user-warning { margin-right: 15px; margin-left: 15px; }
          .role-drawer-header { padding-right: 17px; padding-left: 17px; }
          .role-edit-form { padding-right: 16px; padding-left: 16px; }
          .role-drawer-footer { margin-right: -16px; margin-left: -16px; padding-right: 16px; padding-left: 16px; }
          .role-permissions-heading { align-items: flex-start; flex-direction: column; }
        }
        @media (max-width: 420px) {
          .role-search-form { flex-wrap: wrap; }
          .role-search-field { flex-basis: 100%; }
          .role-search-form :global(.secondary-button) { flex: 1; }
          .role-bulk-actions { width: 100%; justify-content: space-between; }
          .role-detail-list { grid-template-columns: 1fr; gap: 12px; }
          .role-drawer-footer { justify-content: stretch; }
          .role-drawer-footer :global(button) { flex: 1; }
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
