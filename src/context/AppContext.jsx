'use client';

import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  return <AppContext.Provider value={{ notifications, addNotification: (message) => setNotifications((current) => [...current, message]) }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}