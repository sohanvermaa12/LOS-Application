import { forwardAuthRequest } from "../../../../lib/authServer";

export function POST(request) {
  return forwardAuthRequest(request, "/api/v1/auth/login");
}
