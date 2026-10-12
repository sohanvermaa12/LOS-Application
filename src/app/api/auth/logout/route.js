import { clearAuthSession } from "../../../../lib/authServer";

export function POST(request) {
  return clearAuthSession(request);
}
