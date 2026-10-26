'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AccessContext } from './AccessControl';
import {
  DEFAULT_ROLES,
  getCurrentRole,
  getRoutePermission,
  hasRolePermission,
  readStoredRoles,
  ROLE_CHANGE_EVENT,
} from '../lib/rbac';
import { getUserProfile } from '../services/user_profile';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [authData, setAuthData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accessReady, setAccessReady] = useState(false);
  const [accessError, setAccessError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let currentAuth = null;
    let currentRoles = DEFAULT_ROLES;

    try {
      const storedAuth = window.localStorage.getItem('authData');
      currentAuth = storedAuth ? JSON.parse(storedAuth) : null;
      currentRoles = readStoredRoles();
      setAuthData(currentAuth);
      setRoles(currentRoles);
    } catch (error) {
      setRoles([]);
      setAccessError(error instanceof Error ? error.message : 'Saved role settings could not be loaded.');
      setAccessReady(true);
      console.error('Unable to initialize role-based access settings.', error);
      return undefined;
    }

    const loadRoleProfile = async () => {
      try {
        if (currentAuth?.user?.id && !getCurrentRole(currentAuth, null, currentRoles)) {
          const currentProfile = await getUserProfile();
          if (!cancelled) setProfile(currentProfile);
        } else {
          setAccessReady(true);
          return;
        }
      } catch (error) {
        setAccessError(error instanceof Error ? error.message : 'Unable to load the current user role.');
      } finally {
        if (!cancelled) setAccessReady(true);
      }
    };

    const reloadRoles = () => {
      try {
        setRoles(readStoredRoles());
        setAccessError('');
      } catch (error) {
        setRoles([]);
        setAccessError(error instanceof Error ? error.message : 'Saved roles could not be reloaded.');
        console.error('Unable to reload saved roles.', error);
      }
    };

    window.addEventListener('storage', reloadRoles);
    window.addEventListener(ROLE_CHANGE_EVENT, reloadRoles);
    loadRoleProfile();

    return () => {
      cancelled = true;
      window.removeEventListener('storage', reloadRoles);
      window.removeEventListener(ROLE_CHANGE_EVENT, reloadRoles);
    };
  }, []);

  const currentRole = useMemo(
    () => getCurrentRole(authData, profile, roles),
    [authData, profile, roles]
  );
  const hasPermission = useCallback(
    (module, action = 'view') => hasRolePermission(currentRole, module, action),
    [currentRole]
  );
  const accessContext = useMemo(
    () => ({ role: currentRole, loading: !accessReady, hasPermission }),
    [accessReady, currentRole, hasPermission]
  );
  const routePermission = getRoutePermission(pathname || '');
  const canViewRoute = !routePermission || hasPermission(...routePermission);

  return (
    <AccessContext.Provider value={accessContext}>
      <div className="app-shell">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
          onClose={() => setSidebarOpen(false)}
          role={currentRole}
        />
        <main className="main-content">
          <Header menuOpen={sidebarOpen} onMenu={() => setSidebarOpen((open) => !open)} />
          <div className="page-wrap">
            {!accessReady ? (
              <div role="status" aria-live="polite" style={{ padding: 24, color: '#708087' }}>
                Checking page access…
              </div>
            ) : !currentRole || !canViewRoute ? (
              <section role="alert" style={{ maxWidth: 620, margin: '48px auto', padding: 28, border: '1px solid #e5ecec', borderRadius: 8, background: '#fff' }}>
                <h1 style={{ margin: '0 0 8px', color: '#173e46', fontSize: 20 }}>Access restricted</h1>
                <p style={{ margin: 0, color: '#708087', fontSize: 13 }}>
                    {accessError
                      ? `Role-based access could not be initialized: ${accessError}`
                      : !currentRole
                      ? 'Your session role does not match an active UI role. Contact an administrator to configure access.'
                      : 'Your role does not have permission to view this page.'}
                </p>
              </section>
            ) : children}
          </div>
        </main>
      </div>
    </AccessContext.Provider>
  );
}