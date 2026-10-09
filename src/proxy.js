import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, readSessionAccessToken } from "./lib/authServer";

const publicRoutes = ["/", "/login", "/forgot_password"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (
    isPublicRoute ||
    readSessionAccessToken(request.cookies.get(AUTH_SESSION_COOKIE)?.value)
  ) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
