/**
 * The function `apiFetch` is an asynchronous function that handles API requests by setting headers,
 * fetching data from a specified path, and returning the response data or throwing an error if the
 * request fails.
 * @param path - The `path` parameter in the `apiFetch` function represents the endpoint or route of
 * the API that you want to make a request to. It is a string that specifies the path relative to the
 * base URL defined in `API_BASE`.
 * @param [options] - The `options` parameter in the `apiFetch` function is an object that can contain
 * various properties to customize the behavior of the API request. Some of the properties that can be
 * included in the `options` object are:
 * @returns The `apiFetch` function returns the data fetched from the API endpoint specified by the
 * `path`. If the response from the API is successful (status code 2xx), it returns the parsed JSON
 * data. If there is an error response from the API (status code is not 2xx), it logs the error data to
 * the console and throws an error with the message from the API response data
 */
const API_BASE = "http://localhost:3001";

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const token = options.token || localStorage.getItem("token");

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const cleanOptions = { ...options };
  delete cleanOptions.token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...cleanOptions,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("API ERROR:", data);
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}
