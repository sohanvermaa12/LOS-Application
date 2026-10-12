import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://los-backend-355v.onrender.com";
export const AUTH_SESSION_COOKIE = "los-session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return secret;
}

function createSessionValue(accessToken) {
  const payload = Buffer.from(
    JSON.stringify({
      accessToken,
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function readSessionAccessToken(value) {
  if (!value) return null;

  const [payload, signature, ...extra] = value.split(".");
  if (!payload || !signature || extra.length) return null;

  let expectedSignature;
  try {
    expectedSignature = createHmac("sha256", getSessionSecret())
      .update(payload)
      .digest();
  } catch {
    return null;
  }

  const actualSignature = Buffer.from(signature, "base64url");
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      typeof session.accessToken !== "string" ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }
    return session.accessToken;
  } catch {
    return null;
  }
}

export async function forwardAuthRequest(request, path, requireAccessToken = false) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid authentication request" },
      { status: 400 },
    );
  }

  let upstream;
  try {
    upstream = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the authentication service" },
      { status: 502 },
    );
  }

  let result;
  try {
    result = await upstream.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid response from the authentication service" },
      { status: 502 },
    );
  }

  if (!upstream.ok || result?.success === false) {
    return NextResponse.json(result, { status: upstream.status });
  }

  const accessToken = result?.data?.accessToken;
  if ((requireAccessToken || !result?.data?.otpRequired) && !accessToken) {
    return NextResponse.json(
      { success: false, message: "The authentication response did not include a session" },
      { status: 502 },
    );
  }

  let sessionValue;
  if (accessToken && !result?.data?.otpRequired) {
    try {
      sessionValue = createSessionValue(accessToken);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  }

  const response = NextResponse.json(result, { status: upstream.status });
  if (sessionValue) {
    response.cookies.set(AUTH_SESSION_COOKIE, sessionValue, sessionCookieOptions);
  }

  return response;
}

export async function clearAuthSession(request) {
  const accessToken = readSessionAccessToken(
    request.cookies.get(AUTH_SESSION_COOKIE)?.value,
  );
  let response;

  if (!accessToken) {
    response = NextResponse.json({ success: true });
  } else {
    let upstream;
    try {
      upstream = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
    } catch {
      response = NextResponse.json(
        { success: false, message: "Unable to reach the authentication service" },
        { status: 502 },
      );
    }

    if (upstream) {
      let result;
      try {
        result = await upstream.json();
      } catch {
        result = upstream.ok
          ? { success: true }
          : { success: false, message: "Unable to log out" };
      }
      response = NextResponse.json(result, {
        status: upstream.ok ? 200 : upstream.status,
      });
    }
  }

  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
