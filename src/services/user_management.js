function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const storedAuthData = window.localStorage.getItem("authData");

  if (storedAuthData) {
    let authData;
    try {
      authData = JSON.parse(storedAuthData);
    } catch {
      throw new Error("Your session is invalid. Please sign in again.");
    }
    const accessToken = authData?.accessToken;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

function getOrganizationId() {
  const storedAuthData = window.localStorage.getItem("authData");
  if (!storedAuthData) {
    throw new Error("Your session is unavailable. Please sign in again.");
  }

  let authData;
  try {
    authData = JSON.parse(storedAuthData);
  } catch {
    throw new Error("Your session is invalid. Please sign in again.");
  }

  const user = authData?.user || authData?.profile || authData?.employee || {};
  const organizationId =
    authData?.organizationId ??
    authData?.organization_id ??
    user.organizationId ??
    user.organization_id;

  if (organizationId === undefined || organizationId === null || organizationId === "") {
    throw new Error("Organization ID is missing from your session. Please sign in again.");
  }

  return organizationId;
}

async function request(path, options, defaultMessage) {
  const response = await fetch(path, {
    ...options,
    headers: getHeaders(),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(defaultMessage);
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || defaultMessage);
  }

  return result;
}

export async function getUsers(organizationId = getOrganizationId()) {
  const query = new URLSearchParams({ organizationId: String(organizationId) });
  return request(
    `/api/users?${query.toString()}`,
    { method: "GET" },
    "Unable to load users",
  );
}

export async function createUser(user) {
  return request(
    "/api/users",
    {
      method: "POST",
      body: JSON.stringify(user),
    },
    "Unable to create user",
  );
}