const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://los-backend-355.onrender.com"
).replace(/\/+$/, "");

export const USER_ORGANIZATION_ID = 17;
export const USER_ORGANIZATION_CODE = "SBI01";

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const storedAuthData = typeof window === "undefined"
    ? null
    : window.localStorage.getItem("authData");

  if (storedAuthData) {
    let authData;
    try {
      authData = JSON.parse(storedAuthData);
    } catch {
      throw new Error("Authentication data is invalid. Please sign in again.");
    }

    if (typeof authData?.accessToken === "string" && authData.accessToken) {
      headers.Authorization = `Bearer ${authData.accessToken}`;
    }
  }

  return headers;
}

function getServerErrorMessage(result) {
  if (!result || typeof result !== "object") return "";
  if (typeof result.message === "string" && result.message.trim()) return result.message;
  if (typeof result.error === "string" && result.error.trim()) return result.error;

  const details = result.errors || result.details;
  if (Array.isArray(details)) {
    return details
      .map((item) => typeof item === "string" ? item : item?.message)
      .filter((message) => typeof message === "string" && message.trim())
      .join(" ");
  }

  if (details && typeof details === "object") {
    return Object.entries(details)
      .flatMap(([field, messages]) => {
        const values = Array.isArray(messages) ? messages : [messages];
        return values
          .filter((message) => typeof message === "string" && message.trim())
          .map((message) => `${field}: ${message}`);
      })
      .join(" ");
  }

  return "";
}

async function request(path, options, defaultMessage) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Unable to reach the user service. Check your connection and try again.");
    }
    throw error;
  }

  let responseText;
  try {
    responseText = await response.text();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Unable to read the user service response. Please try again.");
    }
    throw error;
  }

  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error("The user service returned an unexpected response.");
      }
    }
  }

  if (response.ok && responseText && (!result || typeof result !== "object")) {
    throw new Error("The user service returned an unexpected response.");
  }

  if (!response.ok || result?.success === false) {
    const fallback = response.status >= 500
      ? "The user service is temporarily unavailable. Please try again."
      : response.status === 401 || response.status === 403
        ? "You are not authorized to create this user. Please sign in again or contact an administrator."
        : defaultMessage;
    throw new Error(getServerErrorMessage(result) || fallback);
  }

  return result;
}

export async function getUsers(organizationId = getOrganizationId()) {
  const query = new URLSearchParams({ organizationId: String(organizationId) });
  return request(
    `/api/users?${query.toString()}`,
    { method: "GET" },
    "Unable to load users.",
  );
}

export async function createUser(user) {
  return request(
    "/api/v1/users",
    {
      method: "POST",
      body: JSON.stringify(user),
    },
    "Unable to create user.",
  );
}
