'use client';

import { useRouter } from 'next/navigation';
import ForgotPasswordRequest from '../../components/ForgotPasswordRequest';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#eef4f4', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', border: '1px solid #dfe8e8', borderRadius: '12px', padding: '32px 28px', boxShadow: '0 18px 40px rgba(20, 39, 44, 0.08)' }}>
        <ForgotPasswordRequest onBack={() => router.push('/login')} />
      </div>
    </div>
  );
}
