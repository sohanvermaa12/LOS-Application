function getRequestHeaders() {
  const storedAuthData = window.localStorage.getItem('authData');
  if (!storedAuthData) {
    throw new Error('Your session is unavailable. Please sign in again.');
  }

  let authData;
  try {
    authData = JSON.parse(storedAuthData);
  } catch {
    throw new Error('Your session is invalid. Please sign in again.');
  }

  if (!authData?.accessToken) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authData.accessToken}`,
  };
}

async function requestLeads(options, defaultMessage) {
  const response = await fetch('/api/leads', {
    ...options,
    headers: getRequestHeaders(),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? 'The lead service returned an unreadable response.'
        : `${defaultMessage} (HTTP ${response.status}).`,
    );
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || `${defaultMessage} (HTTP ${response.status}).`);
  }

  return result;
}

export async function createLead(lead) {
  return requestLeads(
    { method: 'POST', body: JSON.stringify(lead) },
    'Unable to create lead',
  );
}

export async function getAllLeads() {
  const result = await requestLeads(
    { method: 'GET', cache: 'no-store' },
    'Unable to load leads',
  );
  const records = [
    result,
    result?.data?.leads,
    result?.data?.items,
    result?.data?.records,
    result?.data?.content,
    result?.data,
    result?.leads,
    result?.items,
    result?.records,
    result?.content,
  ].find(Array.isArray);

  if (!records) {
    throw new Error('The lead service returned an unsupported lead list response.');
  }

  return records;
}