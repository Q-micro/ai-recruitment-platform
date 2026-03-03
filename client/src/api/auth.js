import { apiFetch } from "./http";

export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(name, email, password, role) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}