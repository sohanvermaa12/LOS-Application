'use client';

import { createContext, useContext } from 'react';

export const AccessContext = createContext({
  role: null,
  loading: true,
  hasPermission: () => false,
});

export function useAccessControl() {
  return useContext(AccessContext);
}

export function PermissionGate({ module, action = 'view', children, fallback = null }) {
  const { hasPermission } = useAccessControl();
  return hasPermission(module, action) ? children : fallback;
}
