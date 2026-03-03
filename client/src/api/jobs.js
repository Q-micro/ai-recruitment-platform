import { apiFetch } from "./http";

export function getJobs() {
  return apiFetch("/jobs");
}