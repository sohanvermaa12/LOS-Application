'use client';

import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  return { user, isAuthenticated: Boolean(user), signIn: setUser, signOut: () => setUser(null) };
}