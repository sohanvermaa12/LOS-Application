const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://los-backend-355v.onrender.com";

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let message = "Unable to sign in";

    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      // The backend may return an empty or non-JSON error response.
    }

    throw new Error(message);
  }

  return response.json();
}
