const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const USER_ORGANIZATION_ID = 17;
export const USER_ORGANIZATION_CODE = "SBI01";

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const storedAuthData = window.localStorage.getItem("authData");

  if (storedAuthData) {
    const accessToken = JSON.parse(storedAuthData)?.accessToken;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function request(path, options, defaultMessage) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export async function getUsers(organizationId = USER_ORGANIZATION_ID) {
  const query = new URLSearchParams({ organizationId: String(organizationId) });
  return request(
    `/api/v1/administration/users?${query.toString()}`,
    { method: "GET" },
    "Unable to load users",
  );
}

export async function createUser(user) {
  return request(
    "/api/v1/administration/users/users",
    {
      method: "POST",
      body: JSON.stringify(user),
    },
    "Unable to create user",
  );
}