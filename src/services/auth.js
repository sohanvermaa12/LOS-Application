import { login as proxyLogin } from "./login";

export function login(credentials) {
  return proxyLogin(credentials);
}