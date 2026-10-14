const API_URL = process.env.NEXT_PUBLIC_LOAN_ELIGIBILITY_API_URL || '';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  try {
    const authData = JSON.parse(window.localStorage.getItem('authData') || '{}');
    if (authData.accessToken) headers.Authorization = `Bearer ${authData.accessToken}`;
  } catch {
    throw new Error('Your sign-in session is invalid. Please sign in again.');
  }
  return headers;
}

export async function assessLoanEligibility(assessment) {
  if (!API_URL) return { configured: false };
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(assessment)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || 'Unable to assess loan eligibility.');
  }
  return { configured: true, result };
}