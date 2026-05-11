/**
 * The `getJobs` function makes an API request to fetch job data.
 * @returns The `getJobs` function is returning the result of calling `apiFetch("/jobs")`, which is
 * likely a Promise that resolves to the data fetched from the "/jobs" endpoint.
 */
import { apiFetch } from "./http";

export function getJobs() {
  return apiFetch("/jobs");
}
