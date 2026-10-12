'use client';

import AppShell from '../../../components/AppShell';
import UserForm from '../../../components/UserForm';

export default function AddUserPage() {
  return (
    <AppShell title="Add User">
      <UserForm mode="add" />
    </AppShell>
  );
}

