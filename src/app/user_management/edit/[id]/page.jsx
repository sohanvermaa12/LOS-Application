'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '../../../../components/AppShell';
import UserForm from '../../../../components/UserForm';
import Card from '../../../../components/Card';
import { getEmployeeById } from '../../../../services/employeeService';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditUserPage({ params: paramsPromise }) {
  const router = useRouter();
  const routeParams = useParams();
  
  // Resolve id safely from params promise or useParams()
  let resolvedId = null;
  if (paramsPromise && typeof paramsPromise.then === 'function') {
    try {
      const unwrapped = use(paramsPromise);
      resolvedId = unwrapped?.id;
    } catch {
      resolvedId = routeParams?.id;
    }
  } else {
    resolvedId = paramsPromise?.id || routeParams?.id;
  }

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resolvedId) {
      const emp = getEmployeeById(resolvedId);
      setEmployee(emp);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [resolvedId]);

  if (loading) {
    return (
      <AppShell title="Edit Employee">
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#7a8e91' }}>
          Loading employee details...
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell title="Employee Not Found">
        <Card style={{ padding: '36px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertCircle size={26} />
          </div>
          <h2 style={{ fontSize: '18px', color: '#173e46', margin: '0 0 8px' }}>
            Employee Record Not Found
          </h2>
          <p style={{ color: '#7a8e91', fontSize: '13px', margin: '0 0 24px' }}>
            The requested employee identifier could not be located in the directory.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => router.push('/user_management')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            Return to User Management
          </button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Edit: ${employee.name || employee.fullName}`}>
      <UserForm mode="edit" initialData={employee} />
    </AppShell>
  );
}

