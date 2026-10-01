const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://los-backend-355v.onrender.com";

export async function login(credentials) {
  return request("/api/v1/auth/login", credentials, "Unable to sign in");
}

export async function verifyOtp({ tempSessionToken, otp }) {
  return request(
    "/api/v1/auth/verify-otp",
    { tempSessionToken, otp },
    "Unable to verify OTP",
  );
}

export async function logout(accessToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Unable to log out");
  }

  return result;
}

async function request(path, body, defaultMessage) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(defaultMessage);
  }

  if (!response.ok) {
    throw new Error(result.message || result.error || defaultMessage);
  }

  if (result.success === false) {
    throw new Error(result.message || defaultMessage);
  }

  return result;
}
